const supabase = require("../../../core/supabase"); // sesuaikan path supabase client kamu

const getRiwayat = async (customerId, { status, search }) => {
  let query = supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      service_type,
      status,
      date,
      total_price,
      created_at,
      order_items (
        product_name,
        quantity
      )
    `,
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  // filter status kalau ada
  if (status) {
    query = query.eq("status", status);
  }

  // filter search kalau ada
  if (search) {
    query = query.or(
      `order_number.ilike.%${search}%,service_type.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data;
};

module.exports = { getRiwayat };
