const supabase = require("../../../core/config/supabase");

const getDetailOrder = async (orderId, customerId) => {
  // Ambil data order (beserta data pembayaran yang sudah ada di tabel ini)
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

  // Ambil item detail order
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

  // Ambil timeline dari order_status_history
  const { data: timeline, error: timelineError } = await supabase
    .from("order_status_history")
    .select(
      `
      id_history,
      status,
      keterangan,
      changed_by_role,
      created_at,
      staff (
        id_staff,
        staff_profile (
          nama
        )
      )
    `,
    )
    .eq("id_orders", orderId)
    .order("created_at", { ascending: true });

  if (timelineError) throw new Error(timelineError.message);

  // Normalisasi: ambil nama dari staff → staff_profile → nama
  const timelineNormalized = (timeline || []).map((item) => ({
    id_history: item.id_history,
    status: item.status,
    keterangan: item.keterangan,
    changed_by_role: item.changed_by_role,
    created_at: item.created_at,
    // staff.id_staff_profile adalah FK ke staff_profile
    nama_staff: item.staff?.staff_profile?.nama ?? null,
  }));

  // Susun data untuk dikirim ke frontend
  return {
    order,
    items,
    timeline: timelineNormalized,
    // Ambil data payment langsung dari kolom tabel orders
    payment: {
      status_pembayaran: order.status_pembayaran ?? null,
      metode_pembayaran: order.metode_bayar ?? null,
      bukti_pembayaran: order.upload_bkt_byr ?? null,
    },
  };
};

module.exports = { getDetailOrder };
