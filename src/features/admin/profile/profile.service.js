const supabase = require("../../../core/config/supabase");
const shopAccess = require("../../../core/services/shop-access.service");

exports.getProfileData = async (authUser) => {
  const idUser = shopAccess.getUserId(authUser);

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id_user", idUser)
    .single();

  if (userError) throw userError;
  if (!userData) throw new Error("User tidak ditemukan");

  let shop = null;
  try {
    shop = (await shopAccess.getShopForUser(authUser)).shop || null;
  } catch (_) {
    shop = null;
  }

  return { user: userData, shop };
};

exports.updateProfileData = async (idUser, { nama, no_hp, email }) => {
  const updateData = {};

  if (nama) updateData.nama = nama;
  if (no_hp) updateData.no_hp = no_hp;
  if (email) updateData.email = email;

  if (Object.keys(updateData).length === 0) {
    throw new Error("Tidak ada data yang diperbarui");
  }

  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id_user", idUser)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// ✅ FIX: Ganti foto_profil → path_gambar (sesuai kolom di tabel users)
exports.updateProfilePicture = async (idUser, imageUrl) => {
  const { data, error } = await supabase
    .from("users")
    .update({ path_gambar: imageUrl })
    .eq("id_user", idUser)
    .select()
    .single();

  if (error) throw error;

  return data;
};