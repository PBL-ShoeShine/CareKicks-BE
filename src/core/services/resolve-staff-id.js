const supabase = require("../config/supabase");

exports.resolveStaffIds = async (anyId, idShops = null) => {
  if (!anyId) return { id_user: null, id_staff: null, nama: null };

  // anyId selalu id_user dari JWT — langsung cari by id_user
  const { data: byUserList } = await supabase
    .from("staff")
    .select("id_staff, id_user, staff_profile(nama, id_shops)")
    .eq("id_user", anyId);

  if (byUserList && byUserList.length > 0) {
    // Prioritaskan yang id_shops-nya match, hindari nyasar ke staff toko lain
    const matched = idShops
      ? byUserList.find((s) => s.staff_profile?.id_shops === idShops)
      : byUserList[0];

    const chosen = matched ?? byUserList[0];
    return {
      id_user: chosen.id_user,
      id_staff: chosen.id_staff,
      nama: chosen.staff_profile?.nama ?? null,
    };
  }

  // Tidak ditemukan di staff — berarti admin toko atau superadmin
  return { id_user: anyId, id_staff: null, nama: null };
};
