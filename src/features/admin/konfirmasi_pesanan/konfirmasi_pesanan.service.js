const supabase = require("../../../core/config/supabase");
const shopAccess = require("../../../core/services/shop-access.service");
const pushNotification = require("../../../core/services/push-notification.service");
const crypto = require("crypto");

// Generate QR code URL
function generateQRCode(kodeOrder) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(kodeOrder)}`;
  const filename = `qr_${kodeOrder}_${Date.now()}.png`;
  return { url, filename };
}

/**
 * Service untuk menangani konfirmasi pesanan (Alur 5 Tahap)
 */

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

/**
 * Ambil daftar pesanan yang memerlukan konfirmasi
 * @param {number} id_shops 
 * @param {string} tab - 'pesanan_masuk', 'pembayaran', 'pesanan_baru'
 */
exports.getOrdersToConfirm = async (id_shops, tab = "pembayaran", metodeOrder) => {
  let query = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id_shops", id_shops)
    .order("tgl_order", { ascending: false });

  if (tab === "pesanan_masuk") {
    // 1. Pesanan Masuk: Customer baru kirim pesanan
    query = query.eq("status_order", "pending");
  } else if (tab === "pembayaran") {
    // 2. Pembayaran: Customer sudah upload bukti bayar
    query = query.eq("status_order", "menunggu_konfirmasi").eq("status_pembayaran", "unpaid");
  } else if (tab === "pesanan_baru") {
    // 3. Pesanan Baru: Sudah dikonfirmasi & dibayar, siap dikerjakan
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

/**
 * Konfirmasi Pembayaran (Tahap 2 -> 3)
 * @param {number} id_orders 
 * @param {number} id_shops 
 * @param {object} data - { action: 'approve' | 'reject', reason?: string }
 */
exports.confirmPayment = async (id_orders, id_shops, { action, reason }) => {
  // Fetch current order info to prevent double-crediting and read payment details
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      id_orders,
      status_pembayaran,
      total_ongkir,
      metode_order,
      detail_orders (
        total_harga
      )
    `)
    .eq("id_orders", id_orders)
    .eq("id_shops", id_shops)
    .single();

  if (orderError) throw new Error(orderError.message);

  const statusPembayaran = action === "approve" ? "paid" : "rejected";
  const statusOrder = action === "approve" ? "menunggu_dijemput" : "menunggu_pembayaran";

  const updateData = {
    status_pembayaran: statusPembayaran,
    status_order: statusOrder,
  };

  if (action === "reject" && reason) {
    updateData.alasan_tolak_pembayaran = reason;
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id_orders", id_orders)
    .eq("id_shops", id_shops)
    .select("*, customers(id_user)")
    .single();

  if (error) throw new Error(error.message);

  // If approved and order was online and not already paid, update the shop's balance
  if (action === "approve" && order.metode_order === "online" && order.status_pembayaran !== "paid") {
    const serviceTotal = (order.detail_orders || []).reduce((sum, item) => sum + Number(item.total_harga || 0), 0);
    const ongkirTotal = Number(order.total_ongkir || 0);
    const addAmount = serviceTotal + ongkirTotal;

    const { data: shopSaldo, error: saldoFetchError } = await supabase
      .from("shops")
      .select("saldo_toko")
      .eq("id_shops", id_shops)
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
      .eq("id_shops", id_shops);

    if (saldoUpdateError) {
      throw saldoUpdateError;
    }
  }

  // Generate QR code saat payment dikonfirmasi (online order masuk ke Pesanan Baru)
  if (action === "approve" && order.metode_order === "online") {
    const qr = generateQRCode(data.kode_order);
    const { error: qrError } = await supabase
      .from("orders")
      .update({
        qr_image: qr.filename,
        link_qr: qr.url,
      })
      .eq("id_orders", id_orders);

    if (qrError) {
      console.error("Gagal menyimpan QR code:", qrError.message);
    }
  }

  // Simpan history
  await this.insertStatusHistory(id_orders, statusOrder, `Pembayaran ${action === 'approve' ? 'diterima' : 'ditolak'}. ${reason || ''}`);

  // Kirim Notifikasi ke Customer
  if (data?.customers?.id_user) {
    const title = action === 'approve' ? 'Pembayaran Berhasil' : 'Pembayaran Ditolak';
    const body = action === 'approve' 
      ? `Pembayaran untuk pesanan ${data.kode_order} telah kami terima. Pesanan Anda kini masuk ke antrean utama.`
      : `Pembayaran untuk pesanan ${data.kode_order} ditolak. Alasan: ${reason || '-'}`;
    
    await pushNotification.sendToUser(data.customers.id_user, { title, body }, { orderId: id_orders });
  }

  return data;
};

/**
 * Konfirmasi Pesanan Masuk (Tahap 1 -> 2)
 * @param {number} id_orders 
 * @param {number} id_shops 
 * @param {object} data - { action: 'approve' | 'reject', reason?: string }
 */
exports.confirmOrder = async (id_orders, id_shops, { action, reason }) => {
  // Jika disetujui, pindah ke status 'menunggu_pembayaran' agar customer bisa bayar
  const statusOrder = action === "approve" ? "menunggu_pembayaran" : "dibatalkan";
  
  const updateData = { status_order: statusOrder };
  
  if (action === "reject" && reason) {
    updateData.alasan_pembatalan = reason;
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id_orders", id_orders)
    .eq("id_shops", id_shops)
    .select("*, customers(id_user)")
    .single();

  if (error) throw new Error(error.message);

  // Simpan history
  await this.insertStatusHistory(id_orders, statusOrder, `Pesanan ${action === 'approve' ? 'disetujui (menunggu pembayaran)' : 'ditolak'}. ${reason || ''}`);

  // Kirim Notifikasi ke Customer
  if (data?.customers?.id_user) {
    const title = action === 'approve' ? 'Pesanan Disetujui' : 'Pesanan Dibatalkan';
    const body = action === 'approve'
      ? `Pesanan ${data.kode_order} telah disetujui. Silakan unggah bukti pembayaran agar dapat kami proses.`
      : `Pesanan ${data.kode_order} telah dibatalkan oleh toko. Alasan: ${reason || '-'}`;

    await pushNotification.sendToUser(data.customers.id_user, { title, body }, { orderId: id_orders });
  }

  return data;
};


/**
 * Helper untuk insert history status order
 */
exports.insertStatusHistory = async (id_orders, status, keterangan) => {
  const { error } = await supabase.from("order_status_history").insert({
    id_orders,
    status,
    keterangan,
    changed_by_role: "admin_toko",
  });

  if (error) console.error("Gagal simpan history status:", error.message);
};
