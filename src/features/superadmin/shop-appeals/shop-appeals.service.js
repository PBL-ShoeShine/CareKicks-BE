const supabase = require("../../../core/config/supabase");

const VALID_STATUS = ["pending", "approved", "rejected"];

const APPEAL_SELECT = `
  id_appeal,
  id_shops,
  id_shops_admin,
  description,
  evidence_images,
  status,
  reviewed_by,
  reviewed_at,
  rejection_reason,
  created_at,
  updated_at,
  shops (
    id_shops,
    nm_toko,
    foto_toko,
    alamat_toko,
    status_verifikasi,
    alasan_penangguhan,
    suspended_at
  ),
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

const normalizeOne = (value) => (Array.isArray(value) ? value[0] : value);

const sanitizeSearch = (value = "") => String(value).trim().replace(/[,%()]/g, " ");

const mapAppeal = (appeal) => {
  const shopAdmin = normalizeOne(appeal.shops_admin);
  const adminUser = normalizeOne(shopAdmin?.users);

  return {
    ...appeal,
    shop: normalizeOne(appeal.shops),
    admin_toko: adminUser || null,
    shops: undefined,
    shops_admin: undefined,
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

const getAdminIdsByEmailSearch = async (keyword) => {
  if (!keyword) return [];

  const { data, error } = await supabase
    .from("shops_admin")
    .select("id_shops_admin, users!inner(email, nama)")
    .or(`email.ilike.%${keyword}%,nama.ilike.%${keyword}%`, {
      foreignTable: "users",
    });

  if (error) throw error;

  return (data || []).map((row) => row.id_shops_admin);
};

const getShopIdsBySearch = async (keyword) => {
  if (!keyword) return [];

  const { data, error } = await supabase
    .from("shops")
    .select("id_shops")
    .ilike("nm_toko", `%${keyword}%`);

  if (error) throw error;

  return (data || []).map((row) => row.id_shops);
};

const ensurePending = (appeal) => {
  if (String(appeal?.status || "").toLowerCase() !== "pending") {
    const error = new Error("Banding hanya dapat diproses saat status masih pending");
    error.status = 400;
    throw error;
  }
};

const notifyShopAdmin = async (idShopAdmin, title, message) => {
  const { data: admin, error } = await supabase
    .from("shops_admin")
    .select("id_user")
    .eq("id_shops_admin", idShopAdmin)
    .single();

  if (error || !admin?.id_user) {
    console.error("Gagal mengambil admin toko untuk notifikasi:", error?.message);
    return;
  }

  const { error: notifError } = await supabase.from("notification").insert({
    id_user: admin.id_user,
    title,
    message,
    type_notification: "shop_appeal",
    is_read: false,
    created_at: new Date(),
  });

  if (notifError) {
    console.error("Gagal membuat notifikasi banding:", notifError.message);
  }
};

exports.getAppeals = async ({ status = "", search = "" } = {}) => {
  const nextStatus = String(status || "").toLowerCase();
  const keyword = sanitizeSearch(search);
  const [adminIds, shopIds] = await Promise.all([
    getAdminIdsByEmailSearch(keyword),
    getShopIdsBySearch(keyword),
  ]);

  let query = supabase
    .from("shop_suspension_appeals")
    .select(APPEAL_SELECT)
    .order("created_at", { ascending: false });

  if (nextStatus && nextStatus !== "all") {
    if (!VALID_STATUS.includes(nextStatus)) {
      const error = new Error("Filter status tidak valid");
      error.status = 400;
      throw error;
    }

    query = query.eq("status", nextStatus);
  }

  if (keyword) {
    const filters = [];
    if (shopIds.length) {
      filters.push(`id_shops.in.(${shopIds.join(",")})`);
    }
    if (adminIds.length) {
      filters.push(`id_shops_admin.in.(${adminIds.join(",")})`);
    }
    if (!filters.length) return [];
    query = query.or(filters.join(","));
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(mapAppeal);
};

exports.getAppealDetail = async (id) => {
  const { data, error } = await supabase
    .from("shop_suspension_appeals")
    .select(APPEAL_SELECT)
    .eq("id_appeal", id)
    .single();

  if (error) throw error;

  return mapAppeal(data);
};

exports.approveAppeal = async (id, authUser) => {
  const idSuperadmin = await getSuperadminId(authUser.id_user || authUser.id);
  const appeal = await exports.getAppealDetail(id);

  ensurePending(appeal);

  const { error: appealError } = await supabase
    .from("shop_suspension_appeals")
    .update({
      status: "approved",
      reviewed_by: idSuperadmin,
      reviewed_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id_appeal", id);

  if (appealError) throw appealError;

  const { error: shopError } = await supabase
    .from("shops")
    .update({
      status_verifikasi: "approved",
      alasan_penangguhan: null,
      suspended_at: null,
      suspended_by: null,
    })
    .eq("id_shops", appeal.id_shops);

  if (shopError) throw shopError;

  await notifyShopAdmin(
    appeal.id_shops_admin,
    "Banding Toko Disetujui",
    `Banding toko ${appeal.shop?.nm_toko || ""} disetujui. Toko sudah aktif kembali.`,
  );

  return exports.getAppealDetail(id);
};

exports.rejectAppeal = async (id, authUser, rejectionReason) => {
  const reason = String(rejectionReason || "").trim();

  if (reason.length < 10) {
    const error = new Error("Alasan penolakan wajib diisi minimal 10 karakter");
    error.status = 400;
    throw error;
  }

  const idSuperadmin = await getSuperadminId(authUser.id_user || authUser.id);
  const appeal = await exports.getAppealDetail(id);

  ensurePending(appeal);

  const { error } = await supabase
    .from("shop_suspension_appeals")
    .update({
      status: "rejected",
      reviewed_by: idSuperadmin,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq("id_appeal", id);

  if (error) throw error;

  await notifyShopAdmin(
    appeal.id_shops_admin,
    "Banding Toko Ditolak",
    `Banding toko ${appeal.shop?.nm_toko || ""} ditolak. Alasan: ${reason}`,
  );

  return exports.getAppealDetail(id);
};
