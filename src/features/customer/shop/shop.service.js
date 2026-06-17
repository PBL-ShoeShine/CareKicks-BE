const supabase = require("../../../core/config/supabase");

exports.getShopProfile = async (idShops) => {
  // 1. Fetch Profil Toko
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("*")
    .eq("id_shops", idShops)
    .single();

  if (shopError || !shop) {
    throw new Error("Toko tidak ditemukan");
  }

  // 2. Fetch Semua Layanan Aktif
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id_services, nama_layanan, harga, foto_layanan, estimasi_waktu, deskripsi")
    .eq("id_shops", idShops)
    .eq("is_active", true)
    .order("harga", { ascending: true });

  if (servicesError) throw servicesError;

  // 3. Fetch 5 Ulasan Terbaru Lintas Layanan
  const { data: recentReviews, error: reviewsError } = await supabase
    .from("ulasan")
    .select(`
      id_ulasan,
      rating,
      ulasan,
      foto_ulasan,
      created_at,
      customers (
        nama,
        foto
      ),
      services (
        nama_layanan
      )
    `)
    .eq("id_shops", idShops)
    .order("created_at", { ascending: false })
    .limit(5);

  if (reviewsError) throw reviewsError;

  // 4. Hitung Statistik Rating (Avg & Count)
  const { data: ratingStats, error: statsError } = await supabase
    .from("ulasan")
    .select("rating")
    .eq("id_shops", idShops);

  if (statsError) throw statsError;

  let ratingAvg = 0;
  let totalReviews = 0;

  if (ratingStats && ratingStats.length > 0) {
    totalReviews = ratingStats.length;
    const sum = ratingStats.reduce((acc, curr) => acc + curr.rating, 0);
    ratingAvg = parseFloat((sum / totalReviews).toFixed(1));
  }

  return {
    shop: {
      ...shop,
      rating_avg: ratingAvg,
      total_reviews: totalReviews,
    },
    services: services || [],
    recent_reviews: recentReviews || [],
    operating_hours: (await supabase
      .from("shop_operating_hours")
      .select("day_of_week, is_open, open_time, close_time")
      .eq("id_shops", idShops)
      .order("day_of_week", { ascending: true })).data || [],
  };
};
