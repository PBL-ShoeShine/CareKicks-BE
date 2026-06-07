const supabase = require("../../../core/config/supabase");

const SHOP_SELECT = `
  id_shops,
  id_shops_admin,
  nm_toko,
  desk_toko,
  alamat_toko,
  foto_toko,
  foto_ktp,
  spesialisasi,
  status_verifikasi,
  alasan_penangguhan,
  suspended_at,
  suspended_by,
  shops_admin (
    id_shops_admin,
    id_user,
    users (
      id_user,
      nama,
      username,
      email,
      no_hp,
      jenis_role
    )
  )
`;

const normalizeAdmin = (shopAdmin) => {
  const admin = Array.isArray(shopAdmin) ? shopAdmin[0] : shopAdmin;
  const user = Array.isArray(admin?.users) ? admin.users[0] : admin?.users;

  return user || null;
};

const calculateReviewStats = (reviews = []) => {
  const total = reviews.length;
  const sum = reviews.reduce((acc, review) => acc + Number(review.rating || 0), 0);

  return {
    total_ulasan: total,
    rata_rata_rating: total ? Number((sum / total).toFixed(1)) : 0,
  };
};

const mapShop = (shop, reviews = []) => ({
  id_shops: shop.id_shops,
  id_shops_admin: shop.id_shops_admin,
  nm_toko: shop.nm_toko,
  desk_toko: shop.desk_toko,
  alamat_toko: shop.alamat_toko,
  foto_toko: shop.foto_toko,
  foto_ktp: shop.foto_ktp,
  spesialisasi: shop.spesialisasi,
  status_verifikasi: shop.status_verifikasi,
  alasan_penangguhan: shop.alasan_penangguhan,
  suspended_at: shop.suspended_at,
  suspended_by: shop.suspended_by,
  admin_toko: normalizeAdmin(shop.shops_admin),
  ...calculateReviewStats(reviews),
});

const getReviewsByShopIds = async (shopIds) => {
  if (!shopIds.length) return new Map();

  const { data, error } = await supabase
    .from("ulasan")
    .select("id_shops, rating")
    .in("id_shops", shopIds);

  if (error) throw error;

  return (data || []).reduce((map, review) => {
    const reviews = map.get(review.id_shops) || [];
    reviews.push(review);
    map.set(review.id_shops, reviews);
    return map;
  }, new Map());
};

exports.getReviewShops = async ({ search = "", page = 1, limit = 10 } = {}) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const from = (currentPage - 1) * currentLimit;
  const to = from + currentLimit - 1;
  const keyword = String(search || "").trim().replace(/[,%()]/g, " ");

  let query = supabase
    .from("shops")
    .select(SHOP_SELECT, { count: "exact" })
    .order("id_shops", { ascending: false })
    .range(from, to);

  if (keyword) {
    query = query.or(`nm_toko.ilike.%${keyword}%,alamat_toko.ilike.%${keyword}%,spesialisasi.ilike.%${keyword}%`);
  }

  const { data, count, error } = await query;

  if (error) throw error;

  const reviewMap = await getReviewsByShopIds((data || []).map((shop) => shop.id_shops));

  return {
    shops: (data || []).map((shop) => mapShop(shop, reviewMap.get(shop.id_shops) || [])),
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total: count || 0,
      totalPages: Math.max(Math.ceil((count || 0) / currentLimit), 1),
    },
  };
};

exports.getReviewShopDetail = async (id) => {
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select(SHOP_SELECT)
    .eq("id_shops", id)
    .single();

  if (shopError) throw shopError;

  const { data: reviews, error: reviewError } = await supabase
    .from("ulasan")
    .select("id_ulasan, rating, ulasan, created_at")
    .eq("id_shops", id)
    .order("created_at", { ascending: false });

  if (reviewError) throw reviewError;

  return {
    ...mapShop(shop, reviews || []),
    reviews: reviews || [],
  };
};

const getSuperadminId = async (idUser) => {
  const { data, error } = await supabase
    .from("superadmin")
    .select("id_superadmin")
    .eq("id_user", idUser)
    .single();

  if (error) throw error;
  return data.id_superadmin;
};

exports.suspendShop = async (id, idUser, alasanPenangguhan) => {
  const reason = String(alasanPenangguhan || "").trim();

  if (!reason) {
    throw new Error("Alasan penangguhan wajib diisi");
  }

  const idSuperadmin = await getSuperadminId(idUser);

  const { error } = await supabase
    .from("shops")
    .update({
      status_verifikasi: "suspended",
      alasan_penangguhan: reason,
      suspended_at: new Date().toISOString(),
      suspended_by: idSuperadmin,
    })
    .eq("id_shops", id);

  if (error) throw error;

  return exports.getReviewShopDetail(id);
};

exports.activateShop = async (id) => {
  const { error } = await supabase
    .from("shops")
    .update({
      status_verifikasi: "approved",
      alasan_penangguhan: null,
      suspended_at: null,
      suspended_by: null,
    })
    .eq("id_shops", id);

  if (error) throw error;

  return exports.getReviewShopDetail(id);
};
