const supabase = require("../config/supabase");

const normalizeShop = (shop) => (Array.isArray(shop) ? shop[0] : shop);

const getUserId = (authUser) => authUser?.id_user || authUser?.id;

exports.getUserId = getUserId;

exports.getShopForUser = async (authUser) => {
  const userId = getUserId(authUser);
  const role = authUser?.role;

  if (!userId) {
    throw new Error("User token tidak valid");
  }

  if (role === "staff") {
    const { data, error } = await supabase
      .from("staff")
      .select(
        `
        id_staff,
        id_user,
        id_staff_profile,
        staff_profile!inner (
          id_staff_profile,
          id_shops,
          role,
          status,
          shops (
            id_shops,
            nm_toko,
            saldo_toko,
            desk_toko,
            alamat_toko,
            lat_toko,
            long_toko,
            foto_toko,
            spesialisasi,
            tgl_berdiri,
            status_verifikasi,
            alasan_penangguhan
          )
        )
      `,
      )
      .eq("id_user", userId)
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data?.staff_profile?.id_shops) {
      throw new Error("Toko tidak ditemukan untuk staff ini");
    }

    const shop = normalizeShop(data.staff_profile.shops);
    return {
      id_shops: data.staff_profile.id_shops,
      id_staff: data.id_staff,
      id_staff_profile: data.id_staff_profile,
      shop,
      staff: data,
    };
  }

  // For shops_admin AND customer (who may have a pending shop registration)
  const { data, error } = await supabase
    .from("shops_admin")
    .select(
      `
      id_shops_admin,
      id_user,
      shops (
        id_shops,
        nm_toko,
        saldo_toko,
        desk_toko,
        alamat_toko,
        lat_toko,
        long_toko,
        foto_toko,
        spesialisasi,
        tgl_berdiri,
        status_verifikasi,
        alasan_penangguhan,
        jam_buka,
        jam_tutup
      )
    `,
    )
    .eq("id_user", userId)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const shop = normalizeShop(data?.shops);
  if (!shop?.id_shops) {
    throw new Error("Toko tidak ditemukan untuk user ini");
  }

  return {
    id_shops: shop.id_shops,
    id_shops_admin: data.id_shops_admin,
    shop,
  };
};

exports.getShopIdForUser = async (authUser) => {
  const access = await exports.getShopForUser(authUser);
  return access.id_shops;
};
