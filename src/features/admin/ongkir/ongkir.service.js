const supabase = require("../../../core/config/supabase");
const shopAccess = require("../../../core/services/shop-access.service");

// ─── GET pengaturan ongkir toko milik admin yang login ────────────────────
exports.getOngkirSetting = async (authUser) => {
  const shopData = await shopAccess.getShopForUser(authUser);
  
  const { data: shop, error } = await supabase
    .from("shops")
    .select(
      "id_shops, nm_toko, jarak_gratis_km, tarif_per_km, jarak_maksimal_km, tarif_per_km_luar_radius",
    )
    .eq("id_shops", shopData.id_shops)
    .single();

  if (error || !shop) {
    throw new Error("Toko tidak ditemukan untuk admin ini");
  }

  return shop;
};

// ─── UPDATE pengaturan ongkir toko milik admin yang login ─────────────────
exports.updateOngkirSetting = async (
  authUser,
  {
    jarak_gratis_km,
    tarif_per_km,
    jarak_maksimal_km,
    tarif_per_km_luar_radius,
  },
) => {
  const shopData = await shopAccess.getShopForUser(authUser);

  const { data, error } = await supabase
    .from("shops")
    .update({
      jarak_gratis_km,
      tarif_per_km,
      jarak_maksimal_km,
      tarif_per_km_luar_radius,
    })
    .eq("id_shops", shopData.id_shops)
    .select(
      "id_shops, nm_toko, jarak_gratis_km, tarif_per_km, jarak_maksimal_km, tarif_per_km_luar_radius",
    )
    .single();

  if (error) throw new Error(error.message);

  return data;
};
