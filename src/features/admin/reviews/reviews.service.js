const supabase = require("../../../core/config/supabase");

exports.getReviews = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const offset = (page - 1) * limit;

    const { data: reviewsRaw, count, error } = await supabase
      .from("detail_orders")
      .select(`
        id_detail_orders,
        review,
        total_harga,
        merk,
        jenis_sepatu,
        warna,
        orders (
          id_orders,
          kode_order,
          tgl_order,
          id_customer,
          id_shops,
          customers (
            nama,
            foto
          ),
          shops (
            nm_toko
          )
        )
      `, { count: "exact" })
      .not("review", "is", null)
      .range(offset, offset + limit - 1)
      .order("id_detail_orders", { ascending: false });

    if (error) throw error;

    const reviews = (reviewsRaw || []).map(r => {
      const order = r.orders || {};
      const customer = order.customers || {};
      const shop = order.shops || {};
      
      return {
        id_detail_orders: r.id_detail_orders,
        review: r.review,
        total_harga: r.total_harga,
        merk: r.merk,
        jenis_sepatu: r.jenis_sepatu,
        warna: r.warna,
        order_code: order.kode_order || "-",
        order_date: order.tgl_order,
        customer_name: customer.nama || "Pelanggan",
        customer_foto: customer.foto || null,
        shop_name: shop.nm_toko || "-"
      };
    });

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: totalPages || 1
      }
    };
  } catch (error) {
    console.error("Error in getReviews service:", error);
    throw error;
  }
};
