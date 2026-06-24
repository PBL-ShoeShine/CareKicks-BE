const bcrypt = require("bcrypt");
const supabase = require("../../core/config/supabase");
const jwtService = require("../../core/services/jwt.service");

const PROFILE_BUCKET = "services";
const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024;

const getStoragePathFromPublicUrl = (publicUrl) => {
  if (!publicUrl) return null;

  const marker = `/storage/v1/object/public/${PROFILE_BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex !== -1) {
    return decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
  }

  if (publicUrl.startsWith("profile/")) {
    return publicUrl;
  }

  return null;
};

exports.register = async ({ nama, no_hp, email, password }) => {
  const username = email.split("@")[0];

  const hashed = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        username,
        nama,
        no_hp,
        email,
        password: hashed,
        jenis_role: "customer",
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  const token = jwtService.signToken({
    id: data.id_user,
    id_user: data.id_user,
    role: data.jenis_role,
  });

  const { password: _password, ...safeUser } = data;

  return {
    message: "Register berhasil",
    token,
    user: safeUser,
  };
};

exports.login = async ({ email, password }) => {
  // ambil user dari DB
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .or(`email.eq.${email},username.eq.${email}`)
    .maybeSingle();

  if (error || !data) {
    throw new Error("User tidak ditemukan");
  }

  // compare password
  const isMatch = await bcrypt.compare(password, data.password);

  if (!isMatch) {
    throw new Error("Password salah");
  }

  const safeUserPayload = await buildLoginUserPayload(data);

  // generate token
  const token = jwtService.signToken({
    id: data.id_user,
    id_user: data.id_user,
    role: data.jenis_role,
    id_shops: safeUserPayload.id_shops,
    id_staff: safeUserPayload.id_staff,
  });

  return {
    message: "Login berhasil",
    token,
    user: safeUserPayload,
  };
};

const buildLoginUserPayload = async (userData) => {
  const { password: _password, ...safeUser } = userData;

  if (userData.jenis_role === "staff") {
    const { data: staffData, error: staffError } = await supabase
      .from("staff")
      .select(
        `
        id_staff,
        id_staff_profile,
        staff_profile!inner (
          id_staff_profile,
          id_shops,
          role,
          status,
          shops (
            id_shops,
            nm_toko,
            desk_toko,
            alamat_toko,
            foto_toko,
            spesialisasi
          )
        )
      `,
      )
      .eq("id_user", userData.id_user)
      .maybeSingle();

    if (staffError) throw new Error(staffError.message);
    if (!staffData?.staff_profile?.id_shops) {
      throw new Error("Relasi staff ke toko belum lengkap");
    }

    const shop = Array.isArray(staffData.staff_profile.shops)
      ? staffData.staff_profile.shops[0]
      : staffData.staff_profile.shops;

    return {
      ...safeUser,
      id_staff: staffData.id_staff,
      id_staff_profile: staffData.id_staff_profile,
      id_shops: staffData.staff_profile.id_shops,
      staff_profile: {
        id_staff_profile: staffData.staff_profile.id_staff_profile,
        role: staffData.staff_profile.role,
        status: staffData.staff_profile.status,
      },
      shop,
    };
  }

  if (userData.jenis_role === "shops_admin") {
    const { data: shopAdminList, error: shopAdminError } = await supabase
      .from("shops_admin")
      .select("id_shops_admin, shops(id_shops, nm_toko, desk_toko, alamat_toko, foto_toko, spesialisasi, status_verifikasi, alasan_penangguhan)")
      .eq("id_user", userData.id_user);

    if (!shopAdminError && shopAdminList && shopAdminList.length > 0) {
      const shopAdmin = shopAdminList[0];
      const shop = Array.isArray(shopAdmin.shops)
        ? shopAdmin.shops[0]
        : shopAdmin.shops;
      return {
        ...safeUser,
        id_shops_admin: shopAdmin.id_shops_admin,
        id_shops: shop?.id_shops,
        shop,
      };
    }
  }

  // For customers, check if they have a pending shop registration
  if (userData.jenis_role === "customer") {
    const { data: shopAdminList, error: shopAdminError } = await supabase
      .from("shops_admin")
      .select("id_shops_admin, shops(id_shops, nm_toko, desk_toko, alamat_toko, foto_toko, spesialisasi, status_verifikasi, alasan_penangguhan)")
      .eq("id_user", userData.id_user);

    if (!shopAdminError && shopAdminList && shopAdminList.length > 0) {
      const shopAdmin = shopAdminList[0];
      const shop = Array.isArray(shopAdmin.shops)
        ? shopAdmin.shops[0]
        : shopAdmin.shops;
      if (shop) {
        return {
          ...safeUser,
          id_shops_admin: shopAdmin.id_shops_admin,
          id_shops: shop?.id_shops,
          shop,
          has_pending_shop: true,
        };
      }
    }
  }

  return safeUser;
};

exports.updateProfilePhoto = async (idUser, file) => {
  if (!file) {
    throw new Error("Foto profil wajib diunggah");
  }

  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    throw new Error("File harus berupa gambar");
  }

  if (file.size > MAX_PROFILE_PHOTO_SIZE) {
    throw new Error("Ukuran foto maksimal 5MB");
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id_user, path_gambar")
    .eq("id_user", idUser)
    .single();

  if (userError || !userData) {
    throw new Error("User tidak ditemukan");
  }

  const filePath = `profile/${idUser}/${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const oldFilePath = getStoragePathFromPublicUrl(userData.path_gambar);

  if (oldFilePath && oldFilePath !== filePath) {
    const { error: removeError } = await supabase.storage
      .from(PROFILE_BUCKET)
      .remove([oldFilePath]);

    if (removeError) {
      console.warn("Gagal menghapus foto profil lama:", removeError.message);
    }
  }

  const { data: publicUrlData } = supabase.storage
    .from(PROFILE_BUCKET)
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("users")
    .update({ path_gambar: publicUrl })
    .eq("id_user", idUser);

  if (updateError) {
    await supabase.storage.from(PROFILE_BUCKET).remove([filePath]);
    throw new Error(updateError.message);
  }

  return {
    foto_profil: publicUrl,
  };
};
