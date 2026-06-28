const supabase = require("../config/supabase");

const EXPIRE_HOURS = 24;
const EXPIRE_STATUSES = ["pending", "menunggu_pembayaran", "menunggu_konfirmasi"];

const cancelExpiredOrders = async (filters = {}) => {
  const cutoff = new Date(Date.now() - EXPIRE_HOURS * 60 * 60 * 1000);
  let query = supabase
    .from("orders")
    .update({ status_order: "dibatalkan" })
    .in("status_order", EXPIRE_STATUSES)
    .lt("tgl_order", cutoff.toISOString());

  if (filters.id_orders) query = query.eq("id_orders", filters.id_orders);
  if (filters.id_shops) query = query.eq("id_shops", filters.id_shops);
  if (filters.id_customer) query = query.eq("id_customer", filters.id_customer);

  const { error } = await query;
  if (error) throw new Error(error.message);
};

const startOrderExpirationJob = () => {
  const run = async () => {
    try {
      await cancelExpiredOrders();
    } catch (error) {
      console.error("Order expiration job error:", error.message);
    }
  };

  run();
  return setInterval(run, 15 * 60 * 1000);
};

module.exports = { cancelExpiredOrders, startOrderExpirationJob };
