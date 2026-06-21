const supabase = require("../../../core/config/supabase");

const getAverageRating = async (shopId) => {
  const { data, error } = await supabase
    .from("ulasan")
    .select("rating")
    .eq("id_shops", shopId);

  if (error || !data || data.length === 0) return 0.0;

  const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
  return Number((totalRating / data.length).toFixed(1));
};

exports.getServiceDetail = async (serviceId) => {
  // 1. Ambil detail layanan dan relasi toko
  const { data: service, error } = await supabase
    .from("services")
    .select(`
      id_services,
      nama_layanan,
      harga,
      estimasi_waktu,
      deskripsi,
      foto_layanan,
      is_active,
      id_shops,
      shops!inner (
        id_shops,
        nm_toko,
        alamat_toko,
        foto_toko,
        spesialisasi,
        status_verifikasi
      )
    `)
    .eq("id_services", serviceId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Layanan tidak ditemukan");
    }
    throw error;
  }

  // 2. Validasi status aktif layanan dan verifikasi toko
  const shop = Array.isArray(service.shops) ? service.shops[0] : service.shops;
  const activeShopStatuses = ["approved", "aktif", "active", "verified", "terverifikasi"];

  if (!service.is_active || !activeShopStatuses.includes(String(shop?.status_verifikasi || "").toLowerCase())) {
    throw new Error("Layanan tidak tersedia saat ini");
  }

  // 3. Ambil rating toko & Jam Operasional
  const avgRating = await getAverageRating(shop.id_shops);
  
  const { data: operatingHours } = await supabase
    .from("shop_operating_hours")
    .select("day_of_week, is_open, open_time, close_time")
    .eq("id_shops", shop.id_shops);

  // Hitung status buka/tutup
  const now = new Date();
  const jsDay = now.getDay();
  const todayDayOfWeek = jsDay === 0 ? 7 : jsDay;
  const currentTime = now.getHours() * 100 + now.getMinutes();
  
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(":");
    return parseInt(parts[0]) * 100 + parseInt(parts[1]);
  };

  const todayHours = (operatingHours || []).find(h => h.day_of_week === todayDayOfWeek);
  let isOpen = false;
  if (todayHours && todayHours.is_open) {
    const jamBuka = parseTime(todayHours.open_time);
    const jamTutup = parseTime(todayHours.close_time);
    if (jamBuka !== null && jamTutup !== null) {
      if (jamTutup < jamBuka) {
        isOpen = currentTime >= jamBuka || currentTime <= jamTutup;
      } else {
        isOpen = currentTime >= jamBuka && currentTime <= jamTutup;
      }
    }
  }

  // 4. (Opsional) Ambil rekomendasi layanan lain dari toko yang sama
  const { data: recommendations } = await supabase
    .from("services")
    .select("id_services, nama_layanan, harga, foto_layanan")
    .eq("id_shops", shop.id_shops)
    .eq("is_active", true)
    .neq("id_services", serviceId)
    .limit(5);

  return {
    id_services: service.id_services,
    nama_layanan: service.nama_layanan,
    harga: Number(service.harga),
    estimasi_waktu: service.estimasi_waktu,
    deskripsi: service.deskripsi,
    foto_layanan: service.foto_layanan,
    toko: {
      id_shops: shop.id_shops,
      nm_toko: shop.nm_toko,
      alamat_toko: shop.alamat_toko,
      foto_toko: shop.foto_toko,
      spesialisasi: shop.spesialisasi,
      rating: avgRating,
      is_open: isOpen,
    },
    rekomendasi: recommendations || [],
  };
};
