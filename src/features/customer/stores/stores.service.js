const supabase = require("../../../core/config/supabase");

const STORAGE_BUCKET = "services";
const BLOCKING_STATUSES = ["pending", "approved"];

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
  shops_admin!inner (
    id_shops_admin,
    id_user
  )
`;

const normalizeStatus = (status) => String(status || "").toLowerCase();

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
});

const requireField = (value, label) => {
  if (!String(value || "").trim()) {
    throw new Error(`${label} wajib diisi`);
  }
};

const validateImage = (file, label) => {
  if (!file) {
    throw new Error(`${label} wajib diunggah`);
  }

  if (!file.mimetype?.startsWith("image/")) {
    throw new Error(`${label} harus berupa gambar`);
  }
};

const uploadFile = async (file, folder, idUser) => {
  const safeOriginalName = String(file.originalname || "upload.jpg").replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `store-registration/${idUser}/${folder}/${Date.now()}_${safeOriginalName}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
};

const getRegistrationByUserId = async (idUser) => {
  const { data, error } = await supabase
    .from("shops")
    .select(SHOP_SELECT)
    .eq("shops_admin.id_user", idUser)
    .order("id_shops", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

exports.getMyRegistration = async (idUser) => {
  const shop = await getRegistrationByUserId(idUser);

  return shop ? mapShop(shop) : null;
};

exports.registerStore = async (idUser, payload, files = {}) => {
  const existingShop = await getRegistrationByUserId(idUser);

  if (existingShop) {
    const status = normalizeStatus(existingShop.status_verifikasi);
    const error = new Error(
      BLOCKING_STATUSES.includes(status)
        ? "Customer sudah memiliki pendaftaran toko yang masih pending atau sudah approved"
        : "Pendaftaran toko sebelumnya ditolak. Hubungi SuperAdmin untuk daftar ulang.",
    );
    error.status = 409;
    error.data = mapShop(existingShop);
    throw error;
  }

  requireField(payload.nm_toko || payload.nama_toko, "Nama toko");
  requireField(payload.spesialisasi, "Spesialisasi layanan");
  requireField(payload.desk_toko || payload.deskripsi_toko, "Deskripsi toko");

  const fotoKtpFile = files.foto_ktp?.[0] || files.ktp?.[0];
  const fotoTokoFile = files.foto_toko?.[0] || files.toko?.[0];

  validateImage(fotoKtpFile, "KTP pemilik");
  validateImage(fotoTokoFile, "Foto toko");

  const [fotoKtpUrl, fotoTokoUrl] = await Promise.all([
    uploadFile(fotoKtpFile, "ktp", idUser),
    uploadFile(fotoTokoFile, "shop", idUser),
  ]);

  const { data: shopAdmin, error: shopAdminError } = await supabase
    .from("shops_admin")
    .insert([{ id_user: idUser }])
    .select("id_shops_admin, id_user")
    .single();

  if (shopAdminError) throw shopAdminError;

  const shopPayload = {
    id_shops_admin: shopAdmin.id_shops_admin,
    nm_toko: String(payload.nm_toko || payload.nama_toko).trim(),
    desk_toko: String(payload.desk_toko || payload.deskripsi_toko).trim(),
    spesialisasi: String(payload.spesialisasi).trim(),
    foto_ktp: fotoKtpUrl,
    foto_toko: fotoTokoUrl,
    status_verifikasi: "pending",
  };

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .insert([shopPayload])
    .select(SHOP_SELECT)
    .single();

  if (shopError) {
    await supabase.from("shops_admin").delete().eq("id_shops_admin", shopAdmin.id_shops_admin);
    throw shopError;
  }

  return mapShop(shop);
};
