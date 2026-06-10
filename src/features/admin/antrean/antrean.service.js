const supabase = require("../../../core/config/supabase");
const shopAccess = require("../../../core/services/shop-access.service");

const ANTREAN_SELECT = `
  id_orders,
  kode_order,
  status_order,
  tgl_order,
  metode_order,
  qr_image,
  link_qr,
  detail_orders (
    id_detail_orders,
    merk,
    jenis_sepatu,
    warna,
    foto_sebelum,
    foto_sesudah,
    id_services,
    total_harga
  )
`;

// Mapping tab antrean ke status enum
const TAB_STATUS = {
  pesanan_baru: [
    "dikonfirmasi",
    "menunggu_dijemput",
    "sedang_dijemput",
    "sudah_dijemput",
  ],
  sedang_dicuci: ["washing"],
  siap: ["selesai_cuci"],
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

// Ambil antrean by tab
exports.getAllAntrean = async (authUser, tab) => {
  const idShops = await shopAccess.getShopIdForUser(authUser);

  const statusFilter = TAB_STATUS[tab];

  let query = supabase
    .from("orders")
    .select(ANTREAN_SELECT)
    .eq("id_shops", idShops)
    .order("tgl_order", { ascending: true });

  if (statusFilter) {
    query = query.in("status_order", statusFilter);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeQrOrder);
};

// Ambil total antrean aktif + selisih kemarin
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

// Ambil detail satu order
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

// Update status order oleh admin toko
exports.updateStatus = async (authUser, idOrder, status, keterangan = null) => {
  const idShops = await shopAccess.getShopIdForUser(authUser);

  if (!STATUS_VALID_ADMIN.includes(status)) {
    throw new Error(
      `Status tidak valid. Pilihan: ${STATUS_VALID_ADMIN.join(", ")}`,
    );
  }

  // Update status order
  const { data, error } = await supabase
    .from("orders")
    .update({ status_order: status })
    .eq("id_orders", idOrder)
    .eq("id_shops", idShops)
    .select(ANTREAN_SELECT)
    .single();
  if (error) throw new Error(error.message);

  // Insert history untuk status yang di-set admin
  await insertStatusHistory(idOrder, status, "admin_toko", null, keterangan);

  if (status === "dikonfirmasi") {
    if (data.metode_order === "online") {
      // Online: setelah dikonfirmasi → otomatis menunggu_dijemput
      await supabase
        .from("orders")
        .update({ status_order: "menunggu_dijemput" })
        .eq("id_orders", idOrder);

      await insertStatusHistory(
        idOrder,
        "menunggu_dijemput",
        "system",
        null,
        "Otomatis menunggu penjemputan setelah pembayaran dikonfirmasi",
      );
    } else if (data.metode_order === "offline") {
      // Offline: setelah dikonfirmasi → otomatis washing
      await supabase
        .from("orders")
        .update({ status_order: "washing" })
        .eq("id_orders", idOrder);

      await insertStatusHistory(
        idOrder,
        "washing",
        "system",
        null,
        "Otomatis mulai pencucian setelah pesanan offline dikonfirmasi",
      );
    }
  }

  return normalizeQrOrder(data);
};
