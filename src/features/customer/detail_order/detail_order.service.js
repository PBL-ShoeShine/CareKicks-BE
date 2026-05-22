const supabase = require("../../../core/supabase");

const getDetailOrder = async (orderId, customerId) => {
  // ambil data order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("customer_id", customerId) // pastikan order milik customer ini
    .single();

  if (orderError) throw new Error(orderError.message);
  if (!order) throw new Error("Pesanan tidak ditemukan");

  // ambil order items
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) throw new Error(itemsError.message);

  // ambil payment
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (paymentError && paymentError.code !== "PGRST116") {
    // PGRST116 = not found, payment mungkin belum ada
    throw new Error(paymentError.message);
  }

  return { order, items, payment: payment || null };
};

module.exports = { getDetailOrder };