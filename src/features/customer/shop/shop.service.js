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

const uploadImageToSupabase = async (file, prefix = "shop") => {
  if (!file) return null;

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const fileExtension = file.originalname.split(".").pop();
  const fileName = `${prefix}_${timestamp}_${randomStr}.${fileExtension}`;
  const filePath = `shops/${fileName}`;

  const { error } = await supabase.storage
    .from("services")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  const { data: publicData } = supabase.storage
    .from("services")
    .getPublicUrl(filePath);

  return publicData.publicUrl;
};

exports.registerShop = async (id_user, payload, { foto_toko_file, foto_ktp_file }) => {
  const {
    nm_toko,
    desk_toko,
    alamat_toko,
    spesialisasi,
    jam_buka = "08:00:00",
    jam_tutup = "20:00:00",
    upload_qris = "https://images.unsplash.com/photo-1595079676339-1534801ad6cf"
  } = payload;

  if (!nm_toko || !alamat_toko || !spesialisasi) {
    throw new Error("Nama toko, alamat, dan spesialisasi wajib diisi");
  }

  // Upload files to Supabase
  const foto_toko = await uploadImageToSupabase(foto_toko_file, "foto_toko");
  const foto_ktp = await uploadImageToSupabase(foto_ktp_file, "foto_ktp");

  // 1. Insert into shops_admin
  const { data: adminData, error: adminErr } = await supabase
    .from("shops_admin")
    .insert({ id_user })
    .select()
    .single();

  if (adminErr) throw adminErr;

  // 2. Insert into shops
  const { data: shopData, error: shopErr } = await supabase
    .from("shops")
    .insert({
      nm_toko,
      desk_toko,
      alamat_toko,
      spesialisasi,
      jam_buka,
      jam_tutup,
      foto_toko,
      foto_ktp,
      upload_qris,
      status_verifikasi: "pending",
      id_shops_admin: adminData.id_shops_admin,
      saldo_toko: 0
    })
    .select()
    .single();

  if (shopErr) {
    // Rollback shops_admin insert if shop insert fails
    await supabase.from("shops_admin").delete().eq("id_shops_admin", adminData.id_shops_admin);
    throw shopErr;
  }

  // NOTE: User role stays as 'customer' until SuperAdmin approves the shop.
  // The role upgrade to 'shops_admin' happens in verifyStore when status becomes 'approved'.

  return {
    shop: shopData,
    id_shops_admin: adminData.id_shops_admin
  };
};

