const supabase = require("../../../core/config/supabase");

const getRiwayat = async (customerId, { status, search }) => {
  let query = supabase
    .from("orders")
    .select(
      `
      id_orders,
      kode_order,
      metode_order,
      status_order,
      tgl_order,
      total_ongkir,
      metode_bayar,
      status_pembayaran,
      shops (
        nm_toko
      ),
      detail_orders (
        id_detail_orders,
        total_harga
      )
    `,
    )
    .eq("id_customer", customerId)
    .order("tgl_order", { ascending: false });

  if (status) {
    query = query.eq("status_order", status);
  }

  if (search) {
    query = query.or(
      `kode_order.ilike.%${search}%,metode_order.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data;
};

module.exports = { getRiwayat };
