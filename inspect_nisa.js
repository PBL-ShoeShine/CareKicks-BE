const supabase = require("./src/core/config/supabase");

async function check() {
  const { data: user, error: errUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", "nisa@mail.com")
    .single();
  console.log("USER nisa:", user);

  if (user) {
    const { data: shopAdmin, error: errSA } = await supabase
      .from("shops_admin")
      .select("*")
      .eq("id_user", user.id_user);
    console.log("SHOPS ADMIN rows for nisa:", shopAdmin, "error:", errSA);

    if (shopAdmin && shopAdmin.length > 0) {
      const ids = shopAdmin.map(sa => sa.id_shops_admin);
      const { data: shops, error: errShops } = await supabase
        .from("shops")
        .select("*")
        .in("id_shops_admin", ids);
      console.log("SHOPS rows for nisa's admin:", shops, "error:", errShops);
    }
  }
}

check();
