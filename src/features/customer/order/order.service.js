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

    const { error } = await supabase.from("notification").insert(notifications);

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
  total_ongkir,
  catatan,
  merk,
  jenis_sepatu,
  warna,
  services,
  fotoFiles,
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

  // Step 4: Upload foto sepatu (multi)
  let fotoUrls = [];
  if (fotoFiles && fotoFiles.length > 0) {
    for (const file of fotoFiles) {
      const fileExt =
        file.originalname.split(".").pop() ||
        file.mimetype.split("/")[1] ||
        "jpg";
      const fileName = `orders/${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("services")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Gagal upload foto: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("services")
        .getPublicUrl(fileName);

      fotoUrls.push(publicUrlData.publicUrl);
    }
  }

  if (fotoUrls.length === 0) {
    throw new Error("Wajib menyertakan minimal 1 foto sepatu.");
  }
  const fotoUrlStr = fotoUrls.join(",");

  // Step 5: Hitung total harga dari DB (bukan dari client — aman dari manipulasi)
  let totalHarga = 0;
  for (const svc of services) {
    totalHarga += serviceMap[svc.id_services] || 0;
  }

  // Step 6: Generate kode_order (Format: PREFIX-YYMMDD-XXX)
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yymmdd = `${yy}${mm}${dd}`;

  // Ambil 3 huruf pertama nama toko sebagai Prefix
  const cleanName = shop.nm_toko.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const prefix = cleanName.substring(0, 3) || "ORD";

  // Cari jumlah pesanan hari ini untuk menentukan urutan harian
  const likePattern = `${prefix}-${yymmdd}-%`;
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .ilike("kode_order", likePattern);

  const urutan = (count || 0) + 1;
  const urutanStr = String(urutan).padStart(3, "0");

  const kodeOrder = `${prefix}-${yymmdd}-${urutanStr}`;

  // Step 7: Insert ke tabel orders (QR code akan di-generate saat payment dikonfirmasi)
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
      qr_image: null,
      link_qr: null,
      total_ongkir,
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
    foto_sebelum: fotoUrlStr,
    merk: merk,
    jenis_sepatu: jenis_sepatu,
    warna: warna,
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
    foto_sepatu_url: fotoUrls[0], // Return first url for frontend quick view
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
    .select(
      "id_shops, nm_toko, lat_toko, long_toko, jarak_gratis_km, tarif_per_km, jarak_maksimal_km, tarif_per_km_luar_radius",
    )
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
    lat_toko: shop.lat_toko,
    long_toko: shop.long_toko,
    jarak_gratis_km: shop.jarak_gratis_km,
    tarif_per_km: shop.tarif_per_km,
    jarak_maksimal_km: shop.jarak_maksimal_km,
    tarif_per_km_luar_radius: shop.tarif_per_km_luar_radius,
    services: services || [],
  };
};

// ─── CREATE ONLINE ORDER FROM CART ─────────────────────────────────────────────
exports.createOnlineOrderFromCart = async ({
  userId,
  selectedIds,
  nama_pemilik,
  no_hp,
  alamat,
  lat_order,
  long_order,
  total_ongkir,
  metode_pengambilan,
}) => {
  if (!selectedIds || selectedIds.length === 0) {
    throw new Error("Tidak ada item keranjang yang dipilih");
  }

  // Step 1: Ambil cart items
  const { data: cartItems, error: itemError } = await supabase
    .from("cart_item")
    .select("*")
    .in("id_cart_item", selectedIds);

  if (itemError) throw new Error(itemError.message);
  if (!cartItems || cartItems.length === 0) {
    throw new Error("Item keranjang tidak ditemukan");
  }

  // Step 2: Ambil cart dan services secara terpisah (hindari issue join syntax)
  const cartIds = [...new Set(cartItems.map((i) => i.id_cart))];
  const serviceIds = [...new Set(cartItems.map((i) => i.id_services))];

  const { data: carts, error: cartError } = await supabase
    .from("cart")
    .select("*")
    .in("id_cart", cartIds);

  if (cartError) throw new Error(cartError.message);

  const { data: services, error: svcError } = await supabase
    .from("services")
    .select("id_services, nama_layanan, harga")
    .in("id_services", serviceIds);

  if (svcError) throw new Error(svcError.message);

  // Build lookup maps
  const cartMap = {};
  for (const c of carts || []) cartMap[c.id_cart] = c;
  const serviceMap = {};
  for (const s of services || []) serviceMap[s.id_services] = s;

  // Attach cart dan service ke setiap item
  for (const item of cartItems) {
    item.cart = cartMap[item.id_cart];
    item.service = serviceMap[item.id_services];
    if (!item.cart) throw new Error(`Cart tidak ditemukan untuk item ${item.id_cart_item}`);
    if (!item.service) throw new Error(`Layanan tidak ditemukan untuk item ${item.id_cart_item}`);
  }

  // Step 2: Verifikasi semua item milik user yang login
  const { data: customer, error: custError } = await supabase
    .from("customers")
    .select("id_customers, nama, nomor_hp")
    .eq("id_user", userId)
    .single();

  if (custError || !customer) {
    throw new Error("Data customer tidak ditemukan");
  }

  for (const item of cartItems) {
    if (item.cart.id_customers !== customer.id_customers) {
      throw new Error("Item keranjang bukan milik Anda");
    }
  }

  // Step 3: Verifikasi semua item dari toko yang sama
  const shopIds = [...new Set(cartItems.map((i) => i.cart.id_shops))];
  if (shopIds.length !== 1) {
    throw new Error("Item keranjang harus dari toko yang sama");
  }
  const idShops = shopIds[0];

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id_shops, nm_toko")
    .eq("id_shops", idShops)
    .single();

  if (shopError || !shop) {
    throw new Error("Toko tidak ditemukan");
  }

  // Step 3a: Verifikasi toko buka (jam operasional)
  const now = new Date();
  const dayOfWeek = now.getDay() || 7; // JS: 0=Minggu → 7
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  const { data: todayHours, error: hoursError } = await supabase
    .from("shop_operating_hours")
    .select("is_open, open_time, close_time")
    .eq("id_shops", idShops)
    .eq("day_of_week", dayOfWeek)
    .single();

  if (hoursError || !todayHours) {
    throw new Error("Jam operasional toko tidak ditemukan");
  }

  if (!todayHours.is_open) {
    throw new Error("Toko sedang tutup hari ini");
  }

  if (currentTime < todayHours.open_time || currentTime > todayHours.close_time) {
    throw new Error("Toko sedang tutup, pesan di jam operasional toko");
  }

  // Step 3b: Verifikasi semua layanan milik toko ini dan aktif
  const uniqueServiceIdList = [...new Set(cartItems.map((i) => i.id_services))];
  const { data: validServices, error: svcValidError } = await supabase
    .from("services")
    .select("id_services, nama_layanan, harga")
    .eq("id_shops", idShops)
    .eq("is_active", true)
    .in("id_services", uniqueServiceIdList);

  if (svcValidError) throw new Error(svcValidError.message);

  if (!validServices || validServices.length !== uniqueServiceIdList.length) {
    throw new Error("Satu atau lebih layanan tidak valid atau tidak aktif di toko ini");
  }

  // Perbarui nama_layanan dan harga dari DB (bukan dari client)
  const svcNameMap = {};
  const svcPriceMap = {};
  for (const svc of validServices) {
    svcNameMap[svc.id_services] = svc.nama_layanan;
    svcPriceMap[svc.id_services] = svc.harga;
  }
  for (const item of cartItems) {
    item.service.nama_layanan = svcNameMap[item.id_services];
  }

  // Step 4: Generate kode_order
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yymmdd = `${yy}${mm}${dd}`;

  const cleanName = shop.nm_toko.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const prefix = cleanName.substring(0, 3) || "ORD";

  const likePattern = `${prefix}-${yymmdd}-%`;
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .ilike("kode_order", likePattern);

  const urutan = (count || 0) + 1;
  const urutanStr = String(urutan).padStart(3, "0");
  const kodeOrder = `${prefix}-${yymmdd}-${urutanStr}`;

  // Step 5: Hitung total harga dari DB (bukan dari client)
  let totalHarga = 0;
  for (const item of cartItems) {
    totalHarga += svcPriceMap[item.id_services] || 0;
  }

  // Step 6: Insert orders (QR code akan di-generate saat payment dikonfirmasi)
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      kode_order: kodeOrder,
      id_customer: customer.id_customers,
      tgl_order: new Date(),
      status_order: "pending",
      metode_order: "online",
      metode_bayar: "transfer",
      metode_pengambilan: metode_pengambilan || "delivery",
      alamat_pengantaran: alamat,
      lat_order,
      long_order,
      qr_image: null,
      link_qr: null,
      total_ongkir: total_ongkir || 0,
      status_pembayaran: "unpaid",
      id_shops: idShops,
      upload_bkt_byr: null,
    })
    .select("id_orders, kode_order, tgl_order, status_order, status_pembayaran")
    .single();

  if (orderError) throw new Error(orderError.message);

  const idOrders = orderData.id_orders;

  // Step 7: Insert detail_orders — satu record per cart item
  const detailInserts = cartItems.map((item) => {
    let fotoStr = "";
    try {
      const parsed = JSON.parse(item.foto_sebelum || "[]");
      fotoStr = Array.isArray(parsed) ? parsed.join(",") : item.foto_sebelum || "";
    } catch (_) {
      fotoStr = item.foto_sebelum || "";
    }

    return {
      id_orders: idOrders,
      id_services: item.id_services,
      foto_sebelum: fotoStr,
      merk: item.merk || "",
      jenis_sepatu: item.jenis_sepatu || "",
      warna: item.warna || "",
      catatan: item.catatan || null,
      total_harga: svcPriceMap[item.id_services] || 0,
    };
  });

  const { error: detailError } = await supabase
    .from("detail_orders")
    .insert(detailInserts);

  if (detailError) throw new Error(detailError.message);

  // Step 8: Status history
  await supabase.from("order_status_history").insert({
    id_orders: idOrders,
    id_staff: null,
    status: "pending",
    keterangan: "Pesanan dari keranjang dibuat oleh customer",
    changed_by_role: "customer",
  });

  // Step 9: Hapus cart items yang sudah di-order
  const cartItemIds = cartItems.map((i) => i.id_cart_item);
  const { error: deleteError } = await supabase
    .from("cart_item")
    .delete()
    .in("id_cart_item", cartItemIds);

  if (deleteError) {
    console.error("Gagal hapus cart items:", deleteError.message);
  }

  // Hapus cart jika sudah tidak punya item
  const uniqueCartIds = [...new Set(cartItems.map((i) => i.cart.id_cart))];
  for (const idCart of uniqueCartIds) {
    const { count: remaining } = await supabase
      .from("cart_item")
      .select("*", { count: "exact", head: true })
      .eq("id_cart", idCart);

    if (remaining === 0) {
      await supabase.from("cart").delete().eq("id_cart", idCart);
    }
  }

  // Step 10: Notifikasi admin
  const namaDisplay = customer.nama || nama_pemilik;
  await notifyShopAdmins(idShops, idOrders, kodeOrder, namaDisplay);

  // Step 11: Notifikasi customer
  try {
    await supabase.from("notification").insert({
      id_user: userId,
      id_orders: idOrders,
      title: "Pesanan Berhasil Dibuat",
      message: `Pesanan #${kodeOrder} dari keranjang berhasil dibuat. Silakan lakukan pembayaran.`,
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
    total_harga: totalHarga + (total_ongkir || 0),
    nm_toko: shop.nm_toko,
    services: cartItems.map((item) => ({
      id_services: item.id_services,
      nama_layanan: item.service.nama_layanan,
      harga: item.harga_layanan,
    })),
  };
};
