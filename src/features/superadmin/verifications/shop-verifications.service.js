const supabase = require("../../../core/config/supabase");

const VALID_STATUSES = ["approved", "rejected"];

const SHOP_SELECT = `
  id_shops,
  id_shops_admin,
  nm_toko,
  desk_toko,
  spesialisasi,
  jam_buka,
  jam_tutup,
  foto_ktp,
  foto_toko,
  status_verifikasi,
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

const normalizeOwner = (shopAdmin) => {
  const admin = Array.isArray(shopAdmin) ? shopAdmin[0] : shopAdmin;
  const user = Array.isArray(admin?.users) ? admin.users[0] : admin?.users;

  return user || null;
};

const mapShop = (shop) => ({
  id_shops: shop.id_shops,
  id_shops_admin: shop.id_shops_admin,
  nm_toko: shop.nm_toko,
  desk_toko: shop.desk_toko,
  spesialisasi: shop.spesialisasi,
  jam_buka: shop.jam_buka,
  jam_tutup: shop.jam_tutup,
  foto_ktp: shop.foto_ktp,
  foto_toko: shop.foto_toko,
  status_verifikasi: shop.status_verifikasi,
  owner: normalizeOwner(shop.shops_admin),
});

exports.getShopVerifications = async ({ status = "pending", search = "", page = 1, limit = 10 }) => {
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

  if (status && status !== "all") {
    query = query.eq("status_verifikasi", status);
  }

  if (keyword) {
    query = query.or(`nm_toko.ilike.%${keyword}%,spesialisasi.ilike.%${keyword}%`);
  }

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    shops: (data || []).map(mapShop),
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total: count || 0,
      totalPages: Math.max(Math.ceil((count || 0) / currentLimit), 1),
    },
  };
};

exports.getShopVerificationDetail = async (id) => {
  const { data, error } = await supabase
    .from("shops")
    .select(SHOP_SELECT)
    .eq("id_shops", id)
    .single();

  if (error) throw error;

  return mapShop(data);
};

exports.updateShopVerificationStatus = async (id, status) => {
  const nextStatus = String(status || "").toLowerCase();

  if (!VALID_STATUSES.includes(nextStatus)) {
    throw new Error("Status harus approved atau rejected");
  }

  const shop = await exports.getShopVerificationDetail(id);
  const previousStatus = shop.status_verifikasi;

  const { error: shopError } = await supabase
    .from("shops")
    .update({ status_verifikasi: nextStatus })
    .eq("id_shops", id)
    .select("id_shops")
    .single();

  if (shopError) throw shopError;

  if (nextStatus === "approved") {
    const ownerId = shop.owner?.id_user;

    if (!ownerId) {
      throw new Error("Pemilik toko tidak ditemukan");
    }

    const { error: userError } = await supabase
      .from("users")
      .update({ jenis_role: "shops_admin" })
      .eq("id_user", ownerId);

    if (userError) {
      await supabase
        .from("shops")
        .update({ status_verifikasi: previousStatus })
        .eq("id_shops", id);
      throw userError;
    }
  }

  return exports.getShopVerificationDetail(id);
};
