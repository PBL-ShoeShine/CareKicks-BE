const supabase = require("../src/core/config/supabase");

async function check() {
  const { data: users, error } = await supabase
    .from("users")
    .select("id_user, email, jenis_role");
  console.log("ALL USERS:", users);
}

check();
