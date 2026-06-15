const supabase = require("../../../core/config/supabase");

/**
 * Cek apakah toko sedang buka berdasarkan jam operasional
 */
const checkIsTokoBuka = (jamBuka, jamTutup) => {
  if (!jamBuka || !jamTutup) return false;

  const now = new Date();
  const [bukaH, bukaM] = jamBuka.split(":").map(Number);
  const [tutupH, tutupM] = jamTutup.split(":").map(Number);

  const currentTime = now.getHours() * 60 + now.getMinutes();
  const startTime = bukaH * 60 + bukaM;
  const endTime = tutupH * 60 + tutupM;

  // Jika jam tutup melewati tengah malam (misal 22:00 - 02:00)
  if (endTime < startTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }

  return currentTime >= startTime && currentTime <= endTime;
};

/**
 * Mengambil rata-rata rating untuk semua toko yang terlibat
 */
const getAverageRatings = async (shopIds) => {
  if (!shopIds.length) return {};

  const { data, error } = await supabase
    .from("ulasan")
    .select("id_shops, rating")
    .in("id_shops", shopIds);

  if (error) return {};

  const ratingsMap = {};
  data.forEach((u) => {
    if (!ratingsMap[u.id_shops]) {
      ratingsMap[u.id_shops] = { total: 0, count: 0 };
    }
    ratingsMap[u.id_shops].total += u.rating;
    ratingsMap[u.id_shops].count += 1;
  });

  const finalRatings = {};
  Object.keys(ratingsMap).forEach((id) => {
    finalRatings[id] = Number((ratingsMap[id].total / ratingsMap[id].count).toFixed(1));
  });

  return finalRatings;
};

exports.getBerandaServices = async ({
  search = "",
  minPrice,
  maxPrice,
  spesialisasi,
  minRating,
  sortBy = "harga",
  sortOrder = "asc",
  page = 1,
  limit = 10,
}) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.max(Number(limit) || 10, 1);
  const from = (currentPage - 1) * currentLimit;
  const to = from + currentLimit - 1;

  // 1. Persiapkan filter pencarian (jika ada)
  let matchedShopIds = [];
  const searchTerm = search?.trim();

  if (searchTerm) {
    // Cari toko yang namanya mengandung searchTerm (case-insensitive)
    const { data: shops } = await supabase
      .from("shops")
      .select("id_shops")
      .ilike("nm_toko", `%${searchTerm}%`);
    
    if (shops) {
      matchedShopIds = shops.map(s => s.id_shops);
    }
  }

  // 2. Query dasar: Jasa (services) join dengan Toko (shops)
  let query = supabase
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
        lat_toko,
        long_toko,
        foto_toko,
        spesialisasi,
        jam_buka,
        jam_tutup,
        status_verifikasi
      )
    `, { count: "exact" });

  // 3. Terapkan Filter

  // Hanya ambil layanan yang aktif
  query = query.eq("is_active", true);

  // Hanya ambil toko yang statusnya aktif/approved/verified
  const activeShopStatuses = ["approved", "aktif", "active", "verified", "terverifikasi"];
  query = query.in("shops.status_verifikasi", activeShopStatuses);

  // Filter Pencarian (Nama Layanan ATAU Nama Toko via ID yang sudah dicari)
  if (searchTerm) {
    const filters = [`nama_layanan.ilike.%${searchTerm}%`];
    if (matchedShopIds.length > 0) {
      filters.push(`id_shops.in.(${matchedShopIds.join(",")})`);
    }
    query = query.or(filters.join(","));
  }

  // Filter Harga
  if (minPrice) query = query.gte("harga", minPrice);
  if (maxPrice) query = query.lte("harga", maxPrice);

  // Filter Spesialisasi Toko
  if (spesialisasi) {
    query = query.eq("shops.spesialisasi", spesialisasi);
  }

  // 3. Sorting (Sebelum Paginasi)
  // Default sorting adalah harga terendah
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // 4. Eksekusi Query dengan Paginasi
  const { data: services, count, error } = await query.range(from, to);

  if (error) throw error;

  if (!services || services.length === 0) {
    return {
      services: [],
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  // 5. Post-Processing (Rating & Status Buka)
  const shopIds = [...new Set(services.map((s) => s.id_shops))];
  const ratings = await getAverageRatings(shopIds);

  const formattedServices = services
    .map((item) => {
      // Supabase terkadang mengembalikan join sebagai array [ { ... } ]
      const shop = Array.isArray(item.shops) ? item.shops[0] : item.shops;

      // Jika karena suatu hal data toko tidak ada, lewati item ini
      if (!shop) return null;

      const avgRating = ratings[shop.id_shops] || 0;

      return {
        id_services: item.id_services,
        nama_layanan: item.nama_layanan,
        harga: Number(item.harga),
        estimasi_waktu: item.estimasi_waktu,
        deskripsi: item.deskripsi,
        foto_layanan: item.foto_layanan,
        toko: {
          id_shops: shop.id_shops,
          nm_toko: shop.nm_toko,
          alamat_toko: shop.alamat_toko,
          foto_toko: shop.foto_toko,
          spesialisasi: shop.spesialisasi,
          rating: avgRating,
          is_open: checkIsTokoBuka(shop.jam_buka, shop.jam_tutup),
        },
      };
    })
    .filter(Boolean); // Hapus item null

  // 6. Filter tambahan berdasarkan Rating (karena rating dihitung di level aplikasi)
  let finalData = formattedServices;
  if (minRating) {
    finalData = formattedServices.filter((s) => s.toko.rating >= Number(minRating));
  }

  return {
    services: finalData,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / currentLimit),
    },
  };
};
