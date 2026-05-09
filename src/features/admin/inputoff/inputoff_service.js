const supabase = require("../../../core/config/supabase");
const crypto = require("crypto");

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
    foto_sebelum_url,
  } = inputData;

  try {
    // Step 1: Get user's shop
    const { data: shopData, error: shopError } = await supabase
      .from("shops_admin")
      .select(
        `
        id_shops_admin,
        shops (
          id_shops
        )
      `,
      )
      .eq("id_user", userId)
      .single();

    if (shopError || !shopData) {
      throw new Error("Shop data not found for this admin user");
    }

    const id_shops = shopData.shops[0].id_shops;

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

    // Step 3: Generate order code and QR code
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const kode_order = `ORD${timestamp}${randomStr}`;
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
        id_staff: null,
        tgl_order: new Date(),
        status_order: "pending",
        metode_order: "offline",
        metode_bayar,
        upload_bkt_byr: null,
        alamat_pengantaran: null,
        lat_order: null,
        long_order: null,
        qr_image: qr_code.filename,
        link_qr: qr_code.url,
        total_ongkir: 0,
        status_pembayaran: "pending",
      })
      .select();

    if (orderError) {
      throw orderError;
    }

    const id_orders = orderData[0].id_orders;

    // Step 6: Create detail orders for each service
    const detailOrdersInserts = services.map((service) => ({
      id_orders,
      id_services: service.id_services,
      foto_sebelum: foto_sebelum_url,
      merk: merk || "-",
      jenis_sepatu: jenis_sepatu,
      warna: warna || "-",
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

    // Step 7: Create initial tracking log
    const { error: trackingError } = await supabase
      .from("tracking_logs")
      .insert({
        status: "pending",
        id_staff: null,
        id_orders,
        waktu: new Date(),
        keterangan: `Order offline dibuat - ${catatan || ""}`,
        latitude: null,
        longitude: null,
      });

    if (trackingError) {
      throw trackingError;
    }

    // Step 8: Create notification for admin
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
      qr_code: qr_code.url,
      status_order: "pending",
      tgl_order: new Date(),
    };
  } catch (error) {
    console.error("Error creating offline order:", error);
    throw error;
  }
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
