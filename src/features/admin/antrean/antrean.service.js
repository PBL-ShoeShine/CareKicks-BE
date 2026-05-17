const supabase = require("../../../core/config/supabase");

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

// Helper: dapat id_shops dari id_user (lewat shops_admin)
const getIdShops = async (idUser) => {
  // Langkah 1: dapat id_shops_admin dari id_user
  const { data: adminData, error: adminError } = await supabase
    .from("shops_admin")
    .select("id_shops_admin")
    .eq("id_user", idUser)
    .single();

  if (adminError) throw new Error("Gagal mengambil data admin: " + adminError.message);
  if (!adminData) throw new Error("Admin tidak ditemukan");

  // Langkah 2: dapat id_shops dari id_shops_admin
  const { data: shopsData, error: shopsError } = await supabase
    .from("shops")
    .select("id_shops")
    .eq("id_shops_admin", adminData.id_shops_admin)
    .single();

  if (shopsError) throw new Error("Gagal mengambil data toko: " + shopsError.message);
  if (!shopsData?.id_shops) throw new Error("Toko tidak ditemukan");

  return shopsData.id_shops;
};

// Ambil semua antrean, filter by status (opsional)
exports.getAllAntrean = async (idUser, status) => {
  const idShops = await getIdShops(idUser);

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
exports.getTotalAntrean = async (idUser) => {
  const idShops = await getIdShops(idUser);

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
exports.getAntreanById = async (idOrder) => {
  const { data, error } = await supabase
    .from("orders")
    .select(ANTREAN_SELECT)
    .eq("id_orders", idOrder)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Update status order: pending -> diproses -> selesai
exports.updateStatus = async (idOrder, status) => {
  const statusValid = ["pending", "diproses", "selesai"];
  if (!statusValid.includes(status)) {
    throw new Error(`Status tidak valid. Pilihan: ${statusValid.join(", ")}`);
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status_order: status })
    .eq("id_orders", idOrder)
    .select(ANTREAN_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return data;
};