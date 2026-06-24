const supabase = require("./src/core/config/supabase");

async function check() {
  const { data: shops, error } = await supabase
    .from("shops")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error fetching shops:", error);
  } else {
    console.log("=== SHOPS COLUMNS ===");
    if (shops && shops.length > 0) {
      console.log(Object.keys(shops[0]));
      console.log("Sample shops data:", shops[0]);
    } else {
      console.log("No shops data found.");
    }
  }
}

check();
