const supabase = require("../../../core/config/supabase");
const pushNotification = require("../../../core/services/push-notification.service");

// ─── Helper: generate QR code URL ─────────────────────────────────────────────
function generateQRCode(kodeOrder) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(kodeOrder)}`;
  const filename = `qr_${kodeOrder}_${Date.now()}.png`;
  return { url, filename };
}

// ─── Helper: notifikasi ke semua admin/staff toko ─────────────────────────────
async function notifyShopAdmins(idShops, idOrders, kodeOrder, namaCustomer) {
  try {
    // Ambil semua id_user yang terkait dengan toko ini (dari shops_admin)
    const { data: shopAdmins } = await supabase
      .from("shops_admin")
      .select("id_user")
      .eq("id_shops", idShops);

    if (!shopAdmins || shopAdmins.length === 0) return;

    const notifications = shopAdmins.map((admin) => ({
      id_user: admin.id_user,
      id_orders: idOrders,
      title: "Pesanan Online Baru",
      message: `Pesanan baru dari ${namaCustomer} (#${kodeOrder}) menunggu konfirmasi pembayaran.`,
      type_notification: "order",
      is_read: false,
      created_at: new Date(),
    }));

    const { error } = await supabase
      .from("notification")
      .insert(notifications);

    if (error) {
      console.error("Gagal insert notifikasi admin:", error.message);
    }

    // Push notification ke setiap admin
    for (const admin of shopAdmins) {
      try {
        await pushNotification.sendToUser(
          admin.id_user,
          {
            title: "Pesanan Online Baru",
            body: `Pesanan baru dari ${namaCustomer} (#${kodeOrder}) menunggu konfirmasi pembayaran.`,
          },
          {
            type: "order",
            id_orders: String(idOrders),
            kode_order: kodeOrder,
            status_order: "pending",
          },
        );
      } catch (pushErr) {
        // Push gagal tidak block flow utama
        console.error("Gagal kirim push ke admin:", pushErr.message);
      }
    }
  } catch (err) {
    // Notifikasi gagal tidak block flow utama
    console.error("notifyShopAdmins error:", err.message);
  }
}

// ─── CREATE ONLINE ORDER ───────────────────────────────────────────────────────
exports.createOnlineOrder = async ({
  userId,
  id_shops,
  nama_pemilik,
  no_hp,
  alamat,
  lat_order,
  long_order,
  catatan,
  services,
  fotoFile,
}) => {
  // Step 1: Verifikasi toko ada dan aktif
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id_shops, nm_toko")
    .eq("id_shops", id_shops)
    .single();

  if (shopError || !shop) {
    throw new Error("Toko tidak ditemukan");
  }

  // Step 2: Lookup id_customers dari id_user (akun yang login)
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id_customers, nama, nomor_hp")
    .eq("id_user", userId)
    .single();

  if (customerError || !customer) {
    throw new Error(
      "Data customer tidak ditemukan. Pastikan profil Anda sudah lengkap.",
    );
  }

  // Step 3: Verifikasi semua id_services valid dan aktif di toko ini
  const serviceIds = services.map((s) => s.id_services);
  const { data: validServices, error: svcError } = await supabase
    .from("services")
    .select("id_services, nama_layanan, harga")
    .eq("id_shops", id_shops)
    .eq("is_active", true)
    .in("id_services", serviceIds);

  if (svcError) throw new Error(svcError.message);

  if (!validServices || validServices.length !== serviceIds.length) {
    throw new Error(
      "Satu atau lebih layanan tidak valid atau tidak aktif di toko ini",
    );
  }

  // Buat map id_services → harga (harga dari DB, bukan dari client)
  const serviceMap = {};
  for (const svc of validServices) {
    serviceMap[svc.id_services] = svc.harga;
  }

  // Step 4: Upload foto sepatu (opsional)
  let fotoUrl = null;
  if (fotoFile) {
    const fileExt = fotoFile.mimetype.split("/")[1] || "jpg";
    const fileName = `orders/${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("services")
      .upload(fileName, fotoFile.buffer, {
        contentType: fotoFile.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Gagal upload foto: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("services")
      .getPublicUrl(fileName);

    fotoUrl = publicUrlData.publicUrl;
  }

  // Step 5: Hitung total harga dari DB (bukan dari client — aman dari manipulasi)
  let totalHarga = 0;
  for (const svc of services) {
    totalHarga += serviceMap[svc.id_services] || 0;
  }

  // Step 6: Generate kode_order dan QR code
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const kodeOrder = `ORD${timestamp}${randomStr}`;
  const qr = generateQRCode(kodeOrder);

  // Step 7: Insert ke tabel orders
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      kode_order: kodeOrder,
      id_customer: customer.id_customers,
      id_shops,
      tgl_order: new Date(),
      status_order: "pending",
      metode_order: "online",
      metode_bayar: "transfer", // Default; customer bayar via transfer/QRIS
      alamat_pengantaran: alamat,
      lat_order,
      long_order,
      qr_image: qr.filename,
      link_qr: qr.url,
      total_ongkir: 0,
      status_pembayaran: "unpaid",
      upload_bkt_byr: null,
    })
    .select("id_orders, kode_order, tgl_order, status_order, status_pembayaran")
    .single();

  if (orderError) throw new Error(orderError.message);

  const idOrders = orderData.id_orders;

  // Step 8: Insert detail_orders — satu record per layanan yang dipilih
  const detailInserts = services.map((svc) => ({
    id_orders: idOrders,
    id_services: svc.id_services,
    foto_sebelum: fotoUrl,
    merk: nama_pemilik, // Nama pemilik sepatu disimpan di field merk sebagai identifikasi
    jenis_sepatu: "-",
    warna: "-",
    catatan: catatan || null,
    review: null,
    foto_sesudah: null,
    total_harga: serviceMap[svc.id_services] || 0,
  }));

  const { error: detailError } = await supabase
    .from("detail_orders")
    .insert(detailInserts);

  if (detailError) throw new Error(detailError.message);

  // Step 9: Insert initial status history
  const { error: historyError } = await supabase
    .from("order_status_history")
    .insert({
      id_orders: idOrders,
      id_staff: null,
      status: "pending",
      keterangan: "Pesanan online dibuat oleh customer",
      changed_by_role: "customer",
    });

  if (historyError) {
    // Non-fatal — log saja
    console.error("Gagal insert history:", historyError.message);
  }

  // Step 10: Notifikasi in-app + push ke admin toko
  const namaDisplay = customer.nama || nama_pemilik;
  await notifyShopAdmins(id_shops, idOrders, kodeOrder, namaDisplay);

  // Step 11: Notifikasi ke customer sendiri (konfirmasi pesanan diterima)
  try {
    await supabase.from("notification").insert({
      id_user: userId,
      id_orders: idOrders,
      title: "Pesanan Berhasil Dibuat",
      message: `Pesanan #${kodeOrder} berhasil dibuat. Silakan lakukan pembayaran untuk melanjutkan.`,
      type_notification: "order",
      is_read: false,
      created_at: new Date(),
    });
  } catch (notifErr) {
    console.error("Gagal notifikasi customer:", notifErr.message);
  }

  return {
    id_orders: idOrders,
    kode_order: kodeOrder,
    tgl_order: orderData.tgl_order,
    status_order: orderData.status_order,
    status_pembayaran: orderData.status_pembayaran,
    total_harga: totalHarga,
    qr_code: qr.url,
    foto_sepatu_url: fotoUrl,
    nm_toko: shop.nm_toko,
    services: validServices.map((s) => ({
      id_services: s.id_services,
      nama_layanan: s.nama_layanan,
      harga: s.harga,
    })),
  };
};

// ─── GET SERVICES BY SHOP ──────────────────────────────────────────────────────
exports.getServicesByShop = async (idShops) => {
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id_shops, nm_toko")
    .eq("id_shops", idShops)
    .single();

  if (shopError || !shop) {
    throw new Error("Toko tidak ditemukan");
  }

  const { data: services, error } = await supabase
    .from("services")
    .select(
      "id_services, nama_layanan, harga, estimasi_waktu, deskripsi, is_active",
    )
    .eq("id_shops", idShops)
    .eq("is_active", true)
    .order("id_services", { ascending: true });

  if (error) throw new Error(error.message);

  return {
    nm_toko: shop.nm_toko,
    id_shops: shop.id_shops,
    services: services || [],
  };
};
