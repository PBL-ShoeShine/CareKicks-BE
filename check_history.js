const supabase = require("./src/core/config/supabase");

async function check() {
  const { data, error } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("id_orders", 71);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("History data:", JSON.stringify(data, null, 2));
  }
}

check();
