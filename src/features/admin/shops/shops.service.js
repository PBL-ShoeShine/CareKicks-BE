const supabase = require("../../../core/config/supabase");

const ACTIVE_STATUSES = ["approved", "aktif"];
const SHOP_SELECT = `
  id_shops,
  id_shops_admin,
  nm_toko,
  desk_toko,
  alamat_toko,
  lat_toko,
  long_toko,
  foto_toko,
  foto_ktp,
  spesialisasi,
  tgl_berdiri,
  jam_buka,
  jam_tutup,
  saldo_toko,
  status_verifikasi,
  upload_qris,
  shops_admin (
    id_shops_admin,
    users (
      id_user,
      nama,
      email,
      no_hp
    )
  )
`;

const sanitizeSearch = (value = "") => value.trim().replace(/[,%()]/g, " ");

const makeStoreCode = (id) => `SHN-${String(id).padStart(3, "0")}`;

const normalizeOwner = (shopAdmin) => {
  const owner = Array.isArray(shopAdmin?.users) ? shopAdmin.users[0] : shopAdmin?.users;

  return owner || null;
};

const mapShop = (shop) => ({
  id_shops: shop.id_shops,
  store_code: makeStoreCode(shop.id_shops),
  id_shops_admin: shop.id_shops_admin,
  nm_toko: shop.nm_toko,
  desk_toko: shop.desk_toko,
  alamat_toko: shop.alamat_toko,
  lat_toko: shop.lat_toko,
  long_toko: shop.long_toko,
  foto_toko: shop.foto_toko,
  foto_ktp: shop.foto_ktp,
  spesialisasi: shop.spesialisasi,
  tgl_berdiri: shop.tgl_berdiri,
  jam_buka: shop.jam_buka,
  jam_tutup: shop.jam_tutup,
  saldo_toko: Number(shop.saldo_toko || 0),
  status_verifikasi: shop.status_verifikasi,
  upload_qris: shop.upload_qris,
  owner: normalizeOwner(shop.shops_admin),
});

const getOwnerAdminIdsBySearch = async (keyword) => {
  if (!keyword) return [];

  const { data, error } = await supabase
    .from("shops_admin")
    .select("id_shops_admin, users!inner(nama, email)")
    .or(`nama.ilike.%${keyword}%,email.ilike.%${keyword}%`, {
      foreignTable: "users",
    });

  if (error) throw error;

  return (data || []).map((item) => item.id_shops_admin);
};

exports.getShops = async ({ search = "", page = 1, limit = 10 }) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const from = (currentPage - 1) * currentLimit;
  const to = from + currentLimit - 1;
  const keyword = sanitizeSearch(search);

  const [statusResult, ownerAdminIds] = await Promise.all([
    supabase.from("shops").select("status_verifikasi"),
    getOwnerAdminIdsBySearch(keyword),
  ]);

  if (statusResult.error) throw statusResult.error;

  let query = supabase
    .from("shops")
    .select(SHOP_SELECT, { count: "exact" })
    .order("id_shops", { ascending: false })
    .range(from, to);

  if (keyword) {
    const directFilters = [
      `nm_toko.ilike.%${keyword}%`,
      `alamat_toko.ilike.%${keyword}%`,
      `spesialisasi.ilike.%${keyword}%`,
    ];

    if (ownerAdminIds.length) {
      directFilters.push(`id_shops_admin.in.(${ownerAdminIds.join(",")})`);
    }

    query = query.or(directFilters.join(","));
  }

  const { data, count, error } = await query;

  if (error) throw error;

  const statuses = statusResult.data || [];
  const totalToko = statuses.length;
  const tokoAktif = statuses.filter((shop) =>
    ACTIVE_STATUSES.includes(String(shop.status_verifikasi || "").toLowerCase()),
  ).length;

  return {
    shops: (data || []).map(mapShop),
    stats: {
      total_toko: totalToko,
      toko_aktif: tokoAktif,
    },
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / currentLimit),
    },
  };
};

exports.getShopDetail = async (id) => {
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select(SHOP_SELECT)
    .eq("id_shops", id)
    .single();

  if (shopError) throw shopError;

  const [servicesResult, ordersResult] = await Promise.all([
    supabase
      .from("services")
      .select("id_services, nama_layanan, harga, estimasi_waktu, deskripsi, is_active, foto_layanan")
      .eq("id_shops", id)
      .order("id_services", { ascending: false }),
    supabase
      .from("orders")
      .select("id_orders, kode_order, tgl_order, status_order, status_pembayaran, metode_bayar, total_ongkir")
      .eq("id_shops", id)
      .order("tgl_order", { ascending: false })
      .limit(5),
  ]);

  if (servicesResult.error) throw servicesResult.error;
  if (ordersResult.error) throw ordersResult.error;

  return {
    ...mapShop(shop),
    services: servicesResult.data || [],
    orders: ordersResult.data || [],
  };
};
