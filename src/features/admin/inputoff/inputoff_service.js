const supabase = require("../../../core/config/supabase");
const crypto = require("crypto");
const shopAccess = require("../../../core/services/shop-access.service");

const generateKodeOrderOffline = async () => {
  const date = new Date();
  const dateString = date.toISOString().slice(2, 10).replace(/-/g, "");
  const prefix = `CAR-${dateString}-`;

  const { data: lastOrder, error } = await supabase
    .from("orders")
    .select("kode_order")
    .like("kode_order", `${prefix}%`)
    .order("kode_order", { ascending: false })
    .limit(1);

  let urutan = 1;
  if (lastOrder && lastOrder.length > 0) {
    const lastKode = lastOrder[0].kode_order;
    const lastUrutan = parseInt(lastKode.split("-").pop());
    if (!isNaN(lastUrutan)) {
      urutan = lastUrutan + 1;
    }
  }

  return `${prefix}${urutan.toString().padStart(3, "0")}`;
};

exports.createOfflineOrder = async (inputData) => {
  const {
    userId,
    nama_customer,
    nomor_telepon,
    jenis_sepatu,
    services,
    merk,
    warna,
    catatan,
    metode_bayar,
    fotoSebelumFile,
  } = inputData;

  try {
    let foto_sebelum_url = null;
    if (fotoSebelumFile) {
      const fileExt = fotoSebelumFile.mimetype.split("/")[1];
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `services/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("services")
        .upload(filePath, fotoSebelumFile.buffer, {
          contentType: fotoSebelumFile.mimetype,
        });

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("services")
        .getPublicUrl(filePath);

      foto_sebelum_url = publicUrlData.publicUrl;
    }

    const id_shops = await shopAccess.getShopIdForUser(
      inputData.authUser || { id: userId, id_user: userId },
    );

    // Step 2: Check if customer exists, if not create one
    let customerId;
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id_customers")
      .eq("nomor_hp", nomor_telepon)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id_customers;
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          id_user: userId,
          nama: nama_customer,
          nomor_hp: nomor_telepon,
          created_at: new Date(),
        })
        .select();

      if (customerError) {
        throw customerError;
      }

      customerId = newCustomer[0].id_customers;
    }


    const kode_order = await generateKodeOrderOffline();
    const qr_code = generateQRCode(kode_order);

    // Step 4: Calculate total price from services
    let total_harga = 0;
    for (const service of services) {
      total_harga += service.price || 0;
    }

    // Step 5: Create order record
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        kode_order,
        id_customer: customerId,
        id_shops,
        tgl_order: new Date(),
        status_order: "dikonfirmasi",
        metode_order: "offline",
        metode_bayar,
        upload_bkt_byr: null,
        alamat_pengantaran: null,
        lat_order: null,
        long_order: null,
        qr_image: qr_code.filename,
        link_qr: qr_code.url,
        total_ongkir: 0,
        status_pembayaran: "paid",
        // --- PERBAIKAN: MENYIMPAN ID STAFF PEMBUAT ORDER ---
        id_staff: userId || null, 
      })
      .select();

    if (orderError) {
      throw orderError;
    }

    const id_orders = orderData[0].id_orders;

    const detailOrdersInserts = services.map((service) => ({
      id_orders,
      id_services: service.id_services,
      foto_sebelum: foto_sebelum_url,
      merk: merk || "-",
      jenis_sepatu: jenis_sepatu,
      warna: warna || "-",
      catatan: catatan || null,
      review: null,
      foto_sesudah: null,
      total_harga: service.price || 0,
    }));

    const { error: detailError } = await supabase
      .from("detail_orders")
      .insert(detailOrdersInserts);

    if (detailError) {
      throw detailError;
    }

    const { data: shopSaldo, error: saldoFetchError } = await supabase
      .from("shops")
      .select("saldo_toko")
      .eq("id_shops", id_shops)
      .single();

    if (saldoFetchError) {
      throw saldoFetchError;
    }

    const saldoSekarang = Number(shopSaldo.saldo_toko || 0);
    const saldoBaru = saldoSekarang + Number(total_harga || 0);

    const { error: saldoUpdateError } = await supabase
      .from("shops")
      .update({
        saldo_toko: saldoBaru,
      })
      .eq("id_shops", id_shops);

    if (saldoUpdateError) {
      throw saldoUpdateError;
    }

    const { error: trackingError } = await supabase
      .from("order_status_history")
      .insert({
        id_orders,
        id_staff: userId || null, 
        status: "dikonfirmasi",
        keterangan: `Order offline dibuat - ${catatan || ""}`,
        changed_by_role: "admin_toko",
      });

    if (trackingError) {
      throw trackingError;
    }

    const { error: notifError } = await supabase.from("notification").insert({
      id_user: userId,
      title: "Pesanan Offline Baru",
      id_orders,
      message: `Pesanan baru dari ${nama_customer} (${nomor_telepon})`,
      type_notification: "order",
      is_read: false,
      created_at: new Date(),
    });

    if (notifError) {
      console.error("Notification error:", notifError);
      // Don't throw - notification is secondary
    }

    return {
      id_orders,
      kode_order,
      nama_customer,
      nomor_telepon,
      jenis_sepatu,
      total_harga,
      metode_bayar,
      services: services.map((s) => ({
        id_services: s.id_services,
        price: s.price,
      })),
      qr_code: qr_code.url,
      foto_sebelum_url,
      status_order: "dikonfirmasi",
      tgl_order: new Date(),
    };
  } catch (error) {
    console.error("Error creating offline order:", error);
    throw error;
  }
};

exports.getServices = async (authUser) => {
  const shopId = await shopAccess.getShopIdForUser(authUser);

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id_shops", shopId)
    .eq("is_active", true)
    .order("id_services", { ascending: true });

  if (error) throw error;

  return data || [];
};

// Generate QR Code (simple implementation - can be enhanced with qr-code library)
function generateQRCode(kode_order) {
  // Using a simple QR code service URL
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(kode_order)}`;
  const filename = `qr_${kode_order}_${Date.now()}.png`;

  return {
    url: qrUrl,
    filename: filename,
  };
}