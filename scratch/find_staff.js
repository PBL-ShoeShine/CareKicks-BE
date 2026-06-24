const supabase = require("../src/core/config/supabase");

async function check() {
  const { data: staff, error } = await supabase
    .from("staff")
    .select(`
      id_staff,
      id_user,
      staff_profile (
        id_shops,
        shops (
          nm_toko,
          status_verifikasi
        )
      )
    `);
  console.log("STAFF:", JSON.stringify(staff, null, 2));
}

check();
