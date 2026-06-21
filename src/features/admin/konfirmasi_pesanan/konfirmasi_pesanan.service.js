const supabase = require("../../../core/config/supabase");
const shopAccess = require("../../../core/services/shop-access.service");
const pushNotification = require("../../../core/services/push-notification.service");

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
exports.getOrdersToConfirm = async (id_shops, tab = "pembayaran") => {
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
    query = query.eq("status_order", "menunggu_dijemput");
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  // Jika data kosong, berikan data dummy untuk keperluan testing/cek UI
  if (!data || data.length === 0) {
    return getDummyOrders(tab);
  }

  return data;
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
 * Data Dummy untuk Testing
 */
const getDummyOrders = (tab) => {
  if (tab === "pembayaran") {
    return [
      {
        id_orders: 991,
        kode_order: "CK-DUMMY-PAY-001",
        tgl_order: new Date().toISOString(),
        status_order: "menunggu_konfirmasi",
        status_pembayaran: "unpaid",
        metode_order: "delivery",
        metode_bayar: "transfer_bank",
        upload_bkt_byr: "https://placehold.co/600x400?text=Bukti+Bayar+Dummy",
        total_ongkir: 15000,
        alamat_pengantaran: "Jl. Dummy No. 123, Jakarta",
        catatan_pengiriman: "Dekat warung kopi",
        id_customer: 1,
        customers: {
          id_user: 10,
          nama: "Budi Dummy",
          nomor_hp: "08123456789"
        },
        detail_orders: [
          {
            id_detail_orders: 1,
            merk: "Nike",
            jenis_sepatu: "Running",
            warna: "Hitam",
            total_harga: 50000,
            catatan: "Cuci bersih ya",
            foto_sebelum: "https://placehold.co/600x400?text=Sepatu+Nike",
            services: {
              id_services: 1,
              nama_layanan: "Deep Clean",
              harga: 50000
            }
          }
        ]
      }
    ];
  } else if (tab === "pesanan_masuk") {
    return [
      {
        id_orders: 992,
        kode_order: "CK-DUMMY-IN-002",
        tgl_order: new Date().toISOString(),
        status_order: "pending",
        status_pembayaran: "unpaid",
        metode_order: "pickup",
        metode_bayar: "cash",
        upload_bkt_byr: null,
        total_ongkir: 0,
        alamat_pengantaran: "Ambil di Toko",
        catatan_pengiriman: "-",
        id_customer: 2,
        customers: {
          id_user: 11,
          nama: "Siti Dummy",
          nomor_hp: "08987654321"
        },
        detail_orders: [
          {
            id_detail_orders: 2,
            merk: "Adidas",
            jenis_sepatu: "Sneakers",
            warna: "Putih",
            total_harga: 35000,
            catatan: "Hati-hati solnya",
            foto_sebelum: "https://placehold.co/600x400?text=Sepatu+Adidas",
            services: {
              id_services: 2,
              nama_layanan: "Fast Clean",
              harga: 35000
            }
          }
        ]
      }
    ];
  } else if (tab === "pesanan_baru") {
    return [
      {
        id_orders: 993,
        kode_order: "CK-DUMMY-NEW-003",
        tgl_order: new Date().toISOString(),
        status_order: "menunggu_dijemput",
        status_pembayaran: "paid",
        metode_order: "delivery",
        metode_bayar: "transfer_bank",
        upload_bkt_byr: "https://placehold.co/600x400?text=Lunas",
        total_ongkir: 15000,
        alamat_pengantaran: "Jl. Baru No. 456",
        catatan_pengiriman: "-",
        id_customer: 3,
        customers: {
          id_user: 12,
          nama: "Andi Dummy",
          nomor_hp: "081122334455"
        },
        detail_orders: [
          {
            id_detail_orders: 3,
            merk: "Puma",
            jenis_sepatu: "Classic",
            warna: "Biru",
            total_harga: 40000,
            catatan: "-",
            foto_sebelum: "https://placehold.co/600x400?text=Sepatu+Puma",
            services: {
              id_services: 3,
              nama_layanan: "Un-yellowing",
              harga: 40000
            }
          }
        ]
      }
    ];
  }
  return [];
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
