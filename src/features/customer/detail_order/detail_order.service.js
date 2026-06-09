const supabase = require("../../../core/config/supabase");

const getDetailOrder = async (orderId, customerId) => {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      *,
      shops (
        id_shops,
        nm_toko,
        alamat_toko,
        lat_toko,
        long_toko
      )
    `,
    )
    .eq("id_orders", orderId)
    .eq("id_customer", customerId)
    .single();

  if (orderError) throw new Error(orderError.message);
  if (!order) throw new Error("Pesanan tidak ditemukan");

  const { data: items, error: itemsError } = await supabase
    .from("detail_orders")
    .select(
      `
      *,
      services (
        id_services,
        nama_layanan,
        harga
      )
    `,
    )
    .eq("id_orders", orderId);

  if (itemsError) throw new Error(itemsError.message);

  return { order, items, payment: null };
};

module.exports = { getDetailOrder };
