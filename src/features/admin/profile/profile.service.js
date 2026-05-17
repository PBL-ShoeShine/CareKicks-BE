const supabase = require("../../../core/config/supabase");

exports.getProfileData = async (idUser) => {
  // Get user data
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id_user", idUser)
    .single();

  if (userError) {
    throw userError;
  }

  if (!userData) {
    throw new Error("User tidak ditemukan");
  }

  // Get admin shop data
  const { data: adminData, error: adminError } = await supabase
    .from("shops_admin")
    .select(
      `
      id_shops_admin,
      shops (
        id_shops,
        nm_toko,
        alamat_toko,
        jam_buka,
        jam_tutup,
        saldo_toko,
        foto_toko,
        desk_toko
      )
    `,
    )
    .eq("id_user", idUser)
    .single();

  if (adminError && adminError.code !== "PGRST116") {
    throw adminError;
  }

  const shop = adminData?.shops || null;

  return {
    user: userData,
    shop: shop,
  };
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

  if (error) {
    throw error;
  }

  return data;
};

exports.updateProfilePicture = async (idUser, imageUrl) => {
  const { data, error } = await supabase
    .from("users")
    .update({ foto_profil: imageUrl })
    .eq("id_user", idUser)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
