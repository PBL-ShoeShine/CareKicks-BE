const supabase = require("../../../core/config/supabase");
const shopAccess = require("../../../core/services/shop-access.service");

const ANTREAN_SELECT = `
  id_orders,
  kode_order,
  status_order,
  tgl_order,
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

// Ambil semua antrean, filter by status (opsional)
exports.getAllAntrean = async (authUser, status) => {
  const idShops = await shopAccess.getShopIdForUser(authUser);

  let query = supabase
    .from("orders")
    .select(ANTREAN_SELECT)
    .eq("id_shops", idShops)
    .order("tgl_order", { ascending: true });

  if (status) query = query.eq("status_order", status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

// Ambil total antrean aktif + selisih kemarin
exports.getTotalAntrean = async (authUser) => {
  const idShops = await shopAccess.getShopIdForUser(authUser);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const { count: total, error: e1 } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("id_shops", idShops)
    .in("status_order", ["pending", "diproses"]);
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
  return data;
};

// Update status order: pending -> diproses -> selesai
exports.updateStatus = async (authUser, idOrder, status) => {
  const idShops = await shopAccess.getShopIdForUser(authUser);
  const statusValid = ["pending", "diproses", "selesai"];
  if (!statusValid.includes(status)) {
    throw new Error(`Status tidak valid. Pilihan: ${statusValid.join(", ")}`);
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status_order: status })
    .eq("id_orders", idOrder)
    .eq("id_shops", idShops)
    .select(ANTREAN_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return data;
};
