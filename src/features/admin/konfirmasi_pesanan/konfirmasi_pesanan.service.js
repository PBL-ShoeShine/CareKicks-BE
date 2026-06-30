const supabase = require("../../../core/config/supabase");
const shopAccess = require("../../../core/services/shop-access.service");
const pushNotification = require("../../../core/services/push-notification.service");

function generateQRCode(kodeOrder) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(kodeOrder)}`;
  const filename = `qr_${kodeOrder}_${Date.now()}.png`;
  return { url, filename };
}

const ORDER_SELECT = `
  id_orders,
  kode_order,
  tgl_order,
  status_order,
  status_pembayaran,
  metode_order,
  metode_bayar,
  upload_bkt_byr,
  total_ongkir,
  qr_image,
  link_qr,
  alamat_pengantaran,
  catatan_pengiriman,
  id_customer,
  id_staff,
  staff:users!id_staff(
    nama
  ),
  customers (
    id_user,
    nama,
    nomor_hp
  ),
  detail_orders (
    id_detail_orders,
    merk,
    jenis_sepatu,
    warna,
    total_harga,
    catatan,
    foto_sebelum,
    services (
        id_services,
        nama_layanan,
        harga
    )
  )
`;

exports.getOrdersToConfirm = async (
  id_shops,
  tab = "pembayaran",
  metodeOrder,
) => {
  let query = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id_shops", id_shops)
    .order("tgl_order", { ascending: false });

  if (tab === "pesanan_masuk") {
    query = query.eq("status_order", "pending");
  } else if (tab === "pembayaran") {
    query = query
      .eq("status_order", "menunggu_konfirmasi")
      .eq("status_pembayaran", "unpaid");
  } else if (tab === "pesanan_baru") {
    if (metodeOrder === "offline") {
      query = query.eq("status_order", "dikonfirmasi");
    } else {
      query = query.eq("status_order", "menunggu_dijemput");
    }
  }

  if (metodeOrder) {
    query = query.eq("metode_order", metodeOrder);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
};

// Helper insert history — tidak tampilkan id_staff untuk aksi acc order & acc pembayaran
// sesuai keputusan: nama admin/staff tidak perlu muncul di riwayat customer untuk aksi ini
exports.insertStatusHistory = async (
  id_orders,
  status,
  keterangan,
  id_staff = null,
) => {
  const { error } = await supabase.from("order_status_history").insert({
    id_orders,
    status,
    keterangan,
    id_staff,
    changed_by_role: "admin_toko",
  });
  if (error) console.error("Gagal simpan history status:", error.message);
};

exports.confirmPayment = async (
  id_orders,
  id_shops,
  { action, reason, id_staff },
) => {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      id_orders,
      status_pembayaran,
      total_ongkir,
      metode_order,
      kode_order,
      detail_orders (
        total_harga
      )
    `,
    )
    .eq("id_orders", id_orders)
    .eq("id_shops", id_shops)
    .single();

  if (orderError) throw new Error(orderError.message);

  const statusPembayaran = action === "approve" ? "paid" : "rejected";
  const statusOrder =
    action === "approve" ? "menunggu_dijemput" : "menunggu_pembayaran";

  const updateData = {
    status_pembayaran: statusPembayaran,
    status_order: statusOrder,
  };

  if (action === "reject" && reason) {
    updateData.alasan_tolak_pembayaran = reason;
  }

  // FIX: hanya set id_staff di orders kalau memang ada (staff, bukan admin toko)
  if (id_staff) {
    updateData.id_staff = id_staff;
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id_orders", id_orders)
    .eq("id_shops", id_shops)
    .select(ORDER_SELECT)
    .single();

  if (error) throw new Error(error.message);

  // Update saldo toko jika approve
  if (
    action === "approve" &&
    order.metode_order === "online" &&
    order.status_pembayaran !== "paid"
  ) {
    const serviceTotal = (order.detail_orders || []).reduce(
      (sum, item) => sum + Number(item.total_harga || 0),
      0,
    );
    const ongkirTotal = Number(order.total_ongkir || 0);
    const addAmount = serviceTotal + ongkirTotal;

    const { data: shopSaldo, error: saldoFetchError } = await supabase
      .from("shops")
      .select("saldo_toko")
      .eq("id_shops", id_shops)
      .single();

    if (saldoFetchError) throw saldoFetchError;

    const saldoBaru = Number(shopSaldo.saldo_toko || 0) + addAmount;
    const { error: saldoUpdateError } = await supabase
      .from("shops")
      .update({ saldo_toko: saldoBaru })
      .eq("id_shops", id_shops);

    if (saldoUpdateError) throw saldoUpdateError;
  }

  // Catat history — id_staff null untuk admin toko (sesuai keputusan: tidak tampil di riwayat customer)
  await exports.insertStatusHistory(
    id_orders,
    statusOrder,
    `Pembayaran ${action === "approve" ? "diterima" : "ditolak"}. ${reason || ""}`,
    id_staff,
  );

  // Generate QR saat approve online order
  if (action === "approve" && order.metode_order === "online") {
    const qr = generateQRCode(data.kode_order);
    const { error: qrError } = await supabase
      .from("orders")
      .update({ qr_image: qr.filename, link_qr: qr.url })
      .eq("id_orders", id_orders);

    if (qrError) {
      console.error("Gagal menyimpan QR code:", qrError.message);
    }
  }

  // Notifikasi ke customer
  const customerUserId = Array.isArray(data?.customers)
    ? data.customers[0]?.id_user
    : data?.customers?.id_user;

  if (customerUserId) {
    const title =
      action === "approve" ? "Pembayaran Berhasil" : "Pembayaran Ditolak";
    const body =
      action === "approve"
        ? `Pembayaran untuk pesanan ${data.kode_order} telah kami terima. Pesanan Anda kini masuk ke antrean utama.`
        : `Pembayaran untuk pesanan ${data.kode_order} ditolak. Alasan: ${reason || "-"}`;

    await pushNotification.sendToUser(
      customerUserId,
      { title, body },
      { orderId: id_orders },
    );
  }

  return data;
};

exports.confirmOrder = async (
  id_orders,
  id_shops,
  { action, reason, id_staff },
) => {
  const statusOrder =
    action === "approve" ? "menunggu_pembayaran" : "dibatalkan";

  const updateData = { status_order: statusOrder };

  if (action === "reject" && reason) {
    updateData.alasan_pembatalan = reason;
  }

  // FIX: hanya set id_staff di orders kalau memang ada (staff, bukan admin toko)
  if (id_staff) {
    updateData.id_staff = id_staff;
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id_orders", id_orders)
    .eq("id_shops", id_shops)
    .select(ORDER_SELECT)
    .single();

  if (error) throw new Error(error.message);

  // Catat history — id_staff null untuk admin toko (sesuai keputusan: tidak tampil di riwayat customer)
  await exports.insertStatusHistory(
    id_orders,
    statusOrder,
    `Pesanan ${action === "approve" ? "disetujui (menunggu pembayaran)" : "ditolak"}. ${reason || ""}`,
    id_staff,
  );

  // Notifikasi ke customer
  const customerUserId = Array.isArray(data?.customers)
    ? data.customers[0]?.id_user
    : data?.customers?.id_user;

  if (customerUserId) {
    const title =
      action === "approve" ? "Pesanan Disetujui" : "Pesanan Dibatalkan";
    const body =
      action === "approve"
        ? `Pesanan ${data.kode_order} telah disetujui. Silakan unggah bukti pembayaran agar dapat kami proses.`
        : `Pesanan ${data.kode_order} telah dibatalkan oleh toko. Alasan: ${reason || "-"}`;

    await pushNotification.sendToUser(
      customerUserId,
      { title, body },
      { orderId: id_orders },
    );
  }

  return data;
};
