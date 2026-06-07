const path = require("path");
const supabase = require("../../../core/config/supabase");

const BUCKET = "services";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const SHOP_ADMIN_SELECT = `
  id_shops_admin,
  id_user,
  shops (
    id_shops,
    nm_toko,
    status_verifikasi,
    alasan_penangguhan,
    suspended_at
  )
`;

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
    status_verifikasi,
    alasan_penangguhan,
    suspended_at
  )
`;

const normalizeOne = (value) => (Array.isArray(value) ? value[0] : value);

const getUserId = (authUser) => authUser?.id_user || authUser?.id;

const getShopAdminAccess = async (authUser) => {
  const idUser = getUserId(authUser);

  if (!idUser) {
    const error = new Error("Token tidak valid");
    error.status = 401;
    throw error;
  }

  const { data, error } = await supabase
    .from("shops_admin")
    .select(SHOP_ADMIN_SELECT)
    .eq("id_user", idUser)
    .maybeSingle();

  if (error) throw error;

  const shop = normalizeOne(data?.shops);
  if (!data?.id_shops_admin || !shop?.id_shops) {
    const accessError = new Error("Toko untuk admin ini tidak ditemukan");
    accessError.status = 403;
    throw accessError;
  }

  return {
    id_shops_admin: data.id_shops_admin,
    id_user: idUser,
    shop,
  };
};

const ensureSuspended = (shop) => {
  if (String(shop?.status_verifikasi || "").toLowerCase() !== "suspended") {
    const error = new Error("Banding hanya dapat diajukan saat toko sedang ditangguhkan");
    error.status = 400;
    throw error;
  }
};

const validateDescription = (description) => {
  const text = String(description || "").trim();

  if (text.length < 20) {
    const error = new Error("Deskripsi banding wajib diisi minimal 20 karakter");
    error.status = 400;
    throw error;
  }

  return text;
};

const validateFiles = (files) => {
  if (!files.length) {
    const error = new Error("Minimal unggah 1 gambar bukti pendukung");
    error.status = 400;
    throw error;
  }

  files.forEach((file) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      const error = new Error("File bukti hanya boleh JPEG, PNG, atau WebP");
      error.status = 400;
      throw error;
    }

    if (file.size > MAX_FILE_SIZE) {
      const error = new Error("Ukuran setiap gambar bukti maksimal 2MB");
      error.status = 400;
      throw error;
    }
  });
};

const safeFileName = (name) => {
  const ext = path.extname(name || "").toLowerCase();
  const base = path
    .basename(name || "bukti", ext)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const random = Math.random().toString(36).slice(2, 8);

  return `${Date.now()}-${random}-${base || "bukti"}${ext || ".jpg"}`;
};

const uploadEvidence = async (shopId, files) => {
  const uploadedPaths = [];

  try {
    const urls = [];

    for (const file of files) {
      const filePath = `appeals/${shopId}/${safeFileName(file.originalname)}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      uploadedPaths.push(filePath);

      const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      urls.push(publicData.publicUrl);
    }

    return urls;
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from(BUCKET).remove(uploadedPaths);
    }

    throw error;
  }
};

const notifySuperadmins = async (shopName) => {
  const { data: superadmins, error } = await supabase
    .from("superadmin")
    .select("id_user");

  if (error) {
    console.error("Gagal mengambil superadmin untuk notifikasi:", error.message);
    return;
  }

  const rows = (superadmins || [])
    .filter((item) => item.id_user)
    .map((item) => ({
      id_user: item.id_user,
      title: "Pengajuan Banding Toko",
      message: `${shopName || "Toko"} mengirim pengajuan banding penangguhan.`,
      type_notification: "shop_appeal",
      is_read: false,
      created_at: new Date(),
    }));

  if (!rows.length) return;

  const { error: notifError } = await supabase.from("notification").insert(rows);
  if (notifError) {
    console.error("Gagal membuat notifikasi banding:", notifError.message);
  }
};

exports.getMyAppeals = async (authUser) => {
  const access = await getShopAdminAccess(authUser);

  const { data, error } = await supabase
    .from("shop_suspension_appeals")
    .select(APPEAL_SELECT)
    .eq("id_shops_admin", access.id_shops_admin)
    .eq("id_shops", access.shop.id_shops)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return {
    shop: access.shop,
    appeals: data || [],
  };
};

exports.createAppeal = async (authUser, payload) => {
  const access = await getShopAdminAccess(authUser);
  const description = validateDescription(payload.description);
  const files = payload.files || [];

  ensureSuspended(access.shop);
  validateFiles(files);

  const { data: pendingAppeal, error: pendingError } = await supabase
    .from("shop_suspension_appeals")
    .select("id_appeal")
    .eq("id_shops", access.shop.id_shops)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingError) throw pendingError;

  if (pendingAppeal) {
    const error = new Error("Masih ada pengajuan banding pending untuk toko ini");
    error.status = 409;
    throw error;
  }

  const evidenceImages = await uploadEvidence(access.shop.id_shops, files);

  const { data, error } = await supabase
    .from("shop_suspension_appeals")
    .insert({
      id_shops: access.shop.id_shops,
      id_shops_admin: access.id_shops_admin,
      description,
      evidence_images: evidenceImages,
      status: "pending",
    })
    .select(APPEAL_SELECT)
    .single();

  if (error) throw error;

  await notifySuperadmins(access.shop.nm_toko);

  return data;
};
