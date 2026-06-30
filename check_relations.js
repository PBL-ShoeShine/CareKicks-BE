const supabase = require("./src/core/config/supabase");

async function check() {
  const { data: shops, error: errShops } = await supabase
    .from("shops")
    .select("id_shops, nm_toko, id_shops_admin, status_verifikasi");
  console.log("SHOPS:", shops);

  const { data: shopsAdmin, error: errShopsAdmin } = await supabase
    .from("shops_admin")
    .select("*");
  console.log("SHOPS ADMIN:", shopsAdmin);

  const { data: users, error: errUsers } = await supabase
    .from("users")
    .select("id_user, email, jenis_role")
    .in("email", ["ganang@mail.com", "nisa@mail.com", "superadmin@mail.com"]);
  console.log("USERS:", users);
}

check();
