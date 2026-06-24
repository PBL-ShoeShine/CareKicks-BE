const supabase = require("../../../core/config/supabase");
const shopAccess = require("../../../core/services/shop-access.service");
const pushNotification = require("../../../core/services/push-notification.service");
const crypto = require("crypto");

// Generate QR code
function _generateQRCode(kodeOrder) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(kodeOrder)}`;
  const filename = `qr_${kodeOrder}_${Date.now()}.png`;
  return { url, filename };
}

// --- PERBAIKAN: Menambahkan id_staff dan relasi namanya ke dalam Select ---
const ANTREAN_SELECT = `
  id_orders,
  kode_order,
  status_order,
  status_pembayaran,
  upload_bkt_byr,
  alasan_tolak_pembayaran,
  tgl_order,
  metode_order,
  qr_image,
  link_qr,
  id_staff,
  staff:users!id_staff(nama),
  customers (
    id_user,
    nama
  ),
  detail_orders (
    id_detail_orders,
    merk,
    jenis_sepatu,
    warna,
    foto_sebelum,
    foto_sesudah,
    id_services,
    total_harga,
    services (
      id_services,
      nama_layanan
    )
  )
`;

// Mapping tab antrean ke status enum
const TAB_STATUS = {
  pembayaran: ["menunggu_konfirmasi"],
  pesanan_baru: [
    "dikonfirmasi",
    "menunggu_dijemput",
    "sedang_dijemput",
    "sudah_dijemput",
  ],
  pickup: ["menunggu_dijemput", "sedang_dijemput", "sudah_dijemput"],
  sedang_dicuci: ["washing"],
  siap: ["selesai_cuci"],
  delivery: ["sedang_diantar", "selesai"],
};

// Status yang boleh diupdate oleh admin toko
const STATUS_VALID_ADMIN = [
  "menunggu_pembayaran",
  "menunggu_konfirmasi",
  "dikonfirmasi",
  "dibatalkan",
  "menunggu_dijemput",
  "sedang_dijemput",
  "sudah_dijemput",
  "washing",
  "selesai_cuci",
  "sedang_diantar",
  "selesai",
];

const QR_BUCKET = process.env.SUPABASE_QR_BUCKET || "services";

const isUrl = (value) => /^https?:\/\//i.test(value);

const getQrPublicUrl = (qrImage, linkQr) => {
  if (!qrImage || typeof qrImage !== "string") return qrImage;
  if (isUrl(qrImage)) return qrImage;
  if (!qrImage.includes("/") && linkQr && isUrl(linkQr)) return linkQr;

  const publicMarker = "/storage/v1/object/public/";
  const publicIndex = qrImage.indexOf(publicMarker);
  if (publicIndex !== -1) {
    const publicPath = qrImage.slice(publicIndex + publicMarker.length);
    const [, ...pathParts] = publicPath.split("/");
    const storagePath = pathParts.join("/");
    if (!storagePath) return qrImage;
    const bucket = publicPath.split("/")[0] || QR_BUCKET;
    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return data.publicUrl;
  }

  const normalizedPath = qrImage.replace(/^\/+/, "");
  const pathParts = normalizedPath.split("/");
  const bucket = pathParts.length > 1 ? pathParts[0] : QR_BUCKET;
  const storagePath =
    pathParts.length > 1 ? pathParts.slice(1).join("/") : normalizedPath;
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
};

const normalizeQrOrder = (order) => {
  if (!order) return order;
  return {
    ...order,
    qr_image: getQrPublicUrl(order.qr_image, order.link_qr),
  };
};

// Helper: insert ke order_status_history
const insertStatusHistory = async (
  idOrders,
  status,
  changedByRole,
  idStaff = null,
  keterangan = null,
) => {
  const { error } = await supabase.from("order_status_history").insert({
    id_orders: idOrders,
    id_staff: idStaff,
    status,
    keterangan,
    changed_by_role: changedByRole,
  });
  if (error) throw new Error(`Gagal insert history: ${error.message}`);
};

const notifyCustomerPaymentStatus = async (order, notification) => {
  const customerData = Array.isArray(order?.customers)
    ? order.customers[0]
    : order?.customers;

  const idUser = customerData?.id_user;
  if (!idUser) {
    console.warn("Notifikasi pembayaran dilewati: id_user customer kosong", {
      id_orders: order?.id_orders,
    });
    return;
  }

  const payload = {
    id_user: idUser,
    id_orders: order.id_orders,
    title: notification.title,
    message: notification.body,
    type_notification: "payment",
  };

  const { error } = await supabase.from("notification").insert(payload);
  if (error) {
    console.error("Gagal insert notification pembayaran:", error.message);
  }

  try {
    await pushNotification.sendToUser(
      idUser,
      {
        title: notification.title,
        body: notification.body,
      },
      {
        type: "payment",
        id_orders: order.id_orders,
        kode_order: order.kode_order,
        status_order: notification.statusOrder,
        status_pembayaran: notification.statusPembayaran,
      },
    );
  } catch (error) {
    console.error("Gagal kirim push pembayaran:", error);
  }
};

exports.getAllAntrean = async (authUser, tab, metodeOrder) => {
  const idShops = await shopAccess.getShopIdForUser(authUser);

  let statusFilter = TAB_STATUS[tab];
  if (tab === "siap" && metodeOrder === "offline") {
    statusFilter = ["selesai"];
  }

  let query = supabase
    .from("orders")
    .select(ANTREAN_SELECT)
    .eq("id_shops", idShops)
    .order("tgl_order", { ascending: false });

  if (statusFilter) {
    query = query.in("status_order", statusFilter);
  }

  if (metodeOrder) {
    query = query.eq("metode_order", metodeOrder);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeQrOrder);
};

exports.getTotalAntrean = async (authUser) => {
  const idShops = await shopAccess.getShopIdForUser(authUser);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const statusAktif = [
    "dikonfirmasi",
    "menunggu_dijemput",
    "sedang_dijemput",
    "sudah_dijemput",
    "washing",
    "selesai_cuci",
  ];

  const { count: total, error: e1 } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("id_shops", idShops)
    .in("status_order", statusAktif);
  if (e1) throw new Error(e1.message);

  const { count: hariIni, error: e2 } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("id_shops", idShops)
    .gte("tgl_order", today.toISOString());
  if (e2) throw new Error(e2.message);

  const { count: kemarin, error: e3 } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("id_shops", idShops)
    .gte("tgl_order", yesterday.toISOString())
    .lt("tgl_order", today.toISOString());
  if (e3) throw new Error(e3.message);

  return { total, selisih: hariIni - kemarin, hariIni, kemarin };
};

exports.getAntreanById = async (authUser, idOrder) => {
  const idShops = await shopAccess.getShopIdForUser(authUser);

  const { data, error } = await supabase
    .from("orders")
    .select(ANTREAN_SELECT)
    .eq("id_orders", idOrder)
    .eq("id_shops", idShops)
    .single();
  if (error) throw new Error(error.message);
  return normalizeQrOrder(data);
};

exports.updateStatus = async (authUser, idOrder, status, keterangan = null) => {
  const idShops = await shopAccess.getShopIdForUser(authUser);
  
  // --- PERBAIKAN: Menangkap ID Staff dari authUser ---
  const currentStaffId = authUser?.id_user || authUser?.id_staff || null;

  if (!STATUS_VALID_ADMIN.includes(status)) {
    throw new Error(
      `Status tidak valid. Pilihan: ${STATUS_VALID_ADMIN.join(", ")}`,
    );
  }

  const { data: currentOrder, error: currentOrderError } = await supabase
    .from("orders")
    .select(`
      status_pembayaran,
      metode_order,
      total_ongkir,
      detail_orders (
        total_harga
      )
    `)
    .eq("id_orders", idOrder)
    .eq("id_shops", idShops)
    .single();

  if (currentOrderError) throw new Error(currentOrderError.message);

  const updatePayload = { status_order: status };

  if (status === "menunggu_pembayaran") {
    updatePayload.status_pembayaran = "unpaid";
    updatePayload.alasan_tolak_pembayaran = keterangan;
  } else if (status === "dikonfirmasi") {
    updatePayload.status_pembayaran = "paid";
    updatePayload.alasan_tolak_pembayaran = null;
  }

  // --- PERBAIKAN: Memasukkan ID Staff ke dalam payload update tabel orders ---
  if (currentStaffId) {
    updatePayload.id_staff = currentStaffId;
  }

  const { data: updatedData, error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id_orders", idOrder)
    .eq("id_shops", idShops)
    .select(ANTREAN_SELECT)
    .single();
  if (error) throw new Error(error.message);
  let data = updatedData;

  if (status === "dikonfirmasi" && currentOrder.metode_order === "online" && currentOrder.status_pembayaran !== "paid") {
    const serviceTotal = (currentOrder.detail_orders || []).reduce((sum, item) => sum + Number(item.total_harga || 0), 0);
    const ongkirTotal = Number(currentOrder.total_ongkir || 0);
    const addAmount = serviceTotal + ongkirTotal;

    const { data: shopSaldo, error: saldoFetchError } = await supabase
      .from("shops")
      .select("saldo_toko")
      .eq("id_shops", idShops)
      .single();

    if (saldoFetchError) {
      throw saldoFetchError;
    }

    const saldoSekarang = Number(shopSaldo.saldo_toko || 0);
    const saldoBaru = saldoSekarang + addAmount;

    const { error: saldoUpdateError } = await supabase
      .from("shops")
      .update({
        saldo_toko: saldoBaru,
      })
      .eq("id_shops", idShops);

    if (saldoUpdateError) {
      throw saldoUpdateError;
    }
  }

  // --- PERBAIKAN: Menyertakan ID Staff ke riwayat history ---
  await insertStatusHistory(idOrder, status, "admin_toko", currentStaffId, keterangan);

  if (status === "menunggu_pembayaran") {
    await notifyCustomerPaymentStatus(data, {
      title: "Pembayaran ditolak",
      body:
        keterangan ||
        `Bukti pembayaran order #${data.kode_order} ditolak. Silakan upload ulang bukti pembayaran.`,
      statusOrder: "menunggu_pembayaran",
      statusPembayaran: "unpaid",
    });
  }

  if (status === "dikonfirmasi") {
    if (data.metode_order === "online") {
      // Generate QR code saat online order masuk ke Pesanan Baru
      const qr = _generateQRCode(data.kode_order);

      // Online: setelah dikonfirmasi → otomatis menunggu_dijemput
      const { data: finalData, error: finalError } = await supabase
        .from("orders")
        .update({
          status_order: "menunggu_dijemput",
          status_pembayaran: "paid",
          alasan_tolak_pembayaran: null,
          qr_image: qr.filename,
          link_qr: qr.url,
        })
        .eq("id_orders", idOrder)
        .select(ANTREAN_SELECT)
        .single();
      if (finalError) throw new Error(finalError.message);
      data = finalData;

      await insertStatusHistory(
        idOrder,
        "menunggu_dijemput",
        "system",
        null,
        "Otomatis menunggu penjemputan setelah pembayaran dikonfirmasi",
      );

      await notifyCustomerPaymentStatus(finalData, {
        title: "Pembayaran dikonfirmasi",
        body: `Pembayaran order #${finalData.kode_order} sudah dikonfirmasi. Pesanan menunggu dijemput.`,
        statusOrder: "menunggu_dijemput",
        statusPembayaran: "paid",
      });
    }
  }

  return normalizeQrOrder(data);
};