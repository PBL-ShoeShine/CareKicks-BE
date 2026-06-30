const supabase = require("./src/core/config/supabase");

async function check() {
  const { data: shopsAdmin, error: errShopsAdmin } = await supabase
    .from("shops_admin")
    .select("*")
    .limit(1);

  if (errShopsAdmin) {
    console.error("Error fetching shops admin:", errShopsAdmin);
  } else {
    console.log("=== SHOPS ADMIN ROW ===");
    console.log(shopsAdmin);
  }

  // Let's also check if there is a table for appeal/banding
  // Let's list all table names in Supabase if we can, or query a potential table
  const { data: tables, error: errTables } = await supabase
    .from("appeals")
    .select("*")
    .limit(1);
  console.log("appeals table check:", errTables ? errTables.message : "exists", tables);

  const { data: banding, error: errBanding } = await supabase
    .from("banding")
    .select("*")
    .limit(1);
  console.log("banding table check:", errBanding ? errBanding.message : "exists", banding);

  const { data: shop_appeals, error: errShopAppeals } = await supabase
    .from("shop_appeals")
    .select("*")
    .limit(1);
  console.log("shop_appeals table check:", errShopAppeals ? errShopAppeals.message : "exists", shop_appeals);
}

check();
