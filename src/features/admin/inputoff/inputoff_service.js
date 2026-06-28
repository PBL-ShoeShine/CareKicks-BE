const supabase = require("../../../core/config/supabase");
const shopAccess = require("../../../core/services/shop-access.service");

const generateKodeOrderOffline = async () => {
  const date = new Date();
  const dateString = date.toISOString().slice(2, 10).replace(/-/g, "");
  const prefix = `CAR-${dateString}-`;

  const { data: lastOrder } = await supabase
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
    authUser,
  } = inputData;

  try {
    // Lookup id_staff dari tabel staff berdasarkan id_user
    const { data: staffData } = await supabase
      .from("staff")
      .select("id_staff")
      .eq("id_user", userId)
      .maybeSingle();

    const idStaffHistory = staffData?.id_staff ?? null;

    let foto_sebelum_url = null;
    if (fotoSebelumFile) {
      const fileExt = fotoSebelumFile.mimetype.split("/")[1];
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `services/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("services")
        .upload(filePath, fotoSebelumFile.buffer, {
          contentType: fotoSebelumFile.mimetype,
        });

      if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage.from("services").getPublicUrl(filePath);
      foto_sebelum_url = publicUrlData.publicUrl;
    }

    const id_shops = await shopAccess.getShopIdForUser(
      authUser || { id: userId, id_user: userId },
    );

    let customerId;
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id_customers")
      .eq("nomor_hp", nomor_telepon)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id_customers;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          id_user: userId,
          nama: nama_customer,
          nomor_hp: nomor_telepon,
          created_at: new Date(),
        })
        .select();

      if (customerError) throw customerError;
      customerId = newCustomer[0].id_customers;
    }

    const kode_order = await generateKodeOrderOffline();
    const qr_code = generateQRCode(kode_order);

    let total_harga = 0;
    for (const service of services) {
      total_harga += service.price || 0;
    }

    // orders.id_staff → FK ke users → pakai userId
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
        id_staff: userId,
      })
      .select();

    if (orderError) throw orderError;

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

    const { error: detailError } = await supabase.from("detail_orders").insert(detailOrdersInserts);
    if (detailError) throw detailError;

    const { data: shopSaldo, error: saldoFetchError } = await supabase
      .from("shops")
      .select("saldo_toko")
      .eq("id_shops", id_shops)
      .single();

    if (saldoFetchError) throw saldoFetchError;

    const saldoSekarang = Number(shopSaldo.saldo_toko || 0);
    const saldoBaru = saldoSekarang + Number(total_harga || 0);

    const { error: saldoUpdateError } = await supabase
      .from("shops")
      .update({ saldo_toko: saldoBaru })
      .eq("id_shops", id_shops);

    if (saldoUpdateError) throw saldoUpdateError;

    // order_status_history.id_staff → FK ke staff → pakai idStaffHistory
    const { error: trackingError } = await supabase
      .from("order_status_history")
      .insert({
        id_orders,
        id_staff: idStaffHistory,
        status: "dikonfirmasi",
        keterangan: `Order offline dibuat - ${catatan || ""}`,
        changed_by_role: "admin_toko",
      });

    if (trackingError) throw trackingError;

    const { error: notifError } = await supabase.from("notification").insert({
      id_user: userId,
      title: "Pesanan Offline Baru",
      id_orders,
      message: `Pesanan baru dari ${nama_customer} (${nomor_telepon})`,
      type_notification: "order",
      is_read: false,
      created_at: new Date(),
    });

    if (notifError) console.error("Notification error:", notifError);

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

function generateQRCode(kode_order) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(kode_order)}`;
  const filename = `qr_${kode_order}_${Date.now()}.png`;

  return {
    url: qrUrl,
    filename: filename,
  };
}