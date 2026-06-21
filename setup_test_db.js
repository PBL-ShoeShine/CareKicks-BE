const supabase = require("./src/core/config/supabase");
const bcrypt = require("bcrypt");

async function setup() {
  console.log("=== RESETTING DATABASE FOR TESTING ===");
  const passwordHash = await bcrypt.hash("12345678", 10);

  // 1. Setup Super Admin
  const { data: saUser } = await supabase
    .from("users")
    .select("id_user")
    .eq("email", "superadmin@mail.com")
    .maybeSingle();

  if (saUser) {
    await supabase
      .from("users")
      .update({ password: passwordHash, jenis_role: "superadmin" })
      .eq("id_user", saUser.id_user);
    console.log("Superadmin password updated");
  }

  // Find Nisa
  const { data: nisaUser } = await supabase
    .from("users")
    .select("id_user")
    .eq("email", "nisa@mail.com")
    .maybeSingle();

  let nisaUserId = nisaUser?.id_user;

  if (!nisaUser) {
    const { data: insertedNisa } = await supabase
      .from("users")
      .insert({
        nama: "Nisa Customer",
        email: "nisa@mail.com",
        username: "nisa",
        password: passwordHash,
        jenis_role: "customer",
        no_hp: "081234567891"
      })
      .select()
      .single();
    nisaUserId = insertedNisa.id_user;
    console.log("Nisa customer created fresh");
  } else {
    // Reset Nisa's role to customer
    await supabase
      .from("users")
      .update({ password: passwordHash, jenis_role: "customer" })
      .eq("id_user", nisaUserId);
    console.log("Nisa role reset to customer");

    // Clean up Nisa's previous shops and shops_admin mappings
    const { data: nisaAdmins } = await supabase
      .from("shops_admin")
      .select("id_shops_admin")
      .eq("id_user", nisaUserId);

    if (nisaAdmins && nisaAdmins.length > 0) {
      const saIds = nisaAdmins.map(a => a.id_shops_admin);
      
      // Delete shops pointing to these shops_admins
      const { error: delShopsErr } = await supabase
        .from("shops")
        .delete()
        .in("id_shops_admin", saIds);
      console.log("Deleted Nisa's shops:", delShopsErr ? delShopsErr.message : "Success");

      // Delete shops_admins
      const { error: delSAErr } = await supabase
        .from("shops_admin")
        .delete()
        .in("id_shops_admin", saIds);
      console.log("Deleted Nisa's shops_admins:", delSAErr ? delSAErr.message : "Success");
    }
  }

  // 3. Reset Ganang (shops_admin)
  const { data: ganangUser } = await supabase
    .from("users")
    .select("id_user")
    .eq("email", "ganang@mail.com")
    .maybeSingle();

  if (ganangUser) {
    await supabase
      .from("users")
      .update({ password: passwordHash, jenis_role: "shops_admin" })
      .eq("id_user", ganangUser.id_user);
    console.log("Ganang user updated to shops_admin role");

    // Reset TOKO ganang verification status to approved and nullify reasons
    const { data: ganangAdmins } = await supabase
      .from("shops_admin")
      .select("id_shops_admin")
      .eq("id_user", ganangUser.id_user);

    if (ganangAdmins && ganangAdmins.length > 0) {
      const saIds = ganangAdmins.map(a => a.id_shops_admin);
      const { error: updateShopErr } = await supabase
        .from("shops")
        .update({
          status_verifikasi: "approved",
          alasan_penangguhan: null,
          suspended_at: null,
          suspended_by: null
        })
        .in("id_shops_admin", saIds);
      console.log("Reset TOKO ganang status to approved:", updateShopErr ? updateShopErr.message : "Success");
    }
  }
}

setup();
