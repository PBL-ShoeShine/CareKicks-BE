const supabase = require("../../../core/config/supabase");

/**
 * Get all reviews with filters
 * @param {Object} filters - Filter criteria (id_shops, id_services, rating)
 */
exports.getAllUlasan = async (filters = {}) => {
  const { id_shops, id_services, rating } = filters;

  try {
    let query = supabase
      .from("ulasan")
      .select(
        `
        id_ulasan,
        id_orders,
        id_shops,
        id_services,
        rating,
        ulasan,
        foto_ulasan,
        created_at,
        customers (
          nama,
          foto,
          users (
            path_gambar,
            nama
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (id_shops) {
      query = query.eq("id_shops", id_shops);
    }

    if (id_services) {
      query = query.eq("id_services", id_services);
    }

    if (rating && rating !== "Semua") {
      query = query.eq("rating", parseInt(rating));
    }

    const { data, error } = await query;

    if (error) throw error;

    // Format data to match UI needs
    return data.map((item) => ({
      id_ulasan: item.id_ulasan,
      id_orders: item.id_orders,
      id_shops: item.id_shops,
      id_services: item.id_services,
      rating: item.rating,
      ulasan: item.ulasan,
      foto_ulasan: item.foto_ulasan || [],
      created_at: item.created_at,
      user: {
        // DIBALIK: Prioritaskan nama customer (sebagai pembeli), bukan nama users (yang mungkin sudah jadi nama toko)
        nama: item.customers?.nama || item.customers?.users?.nama || "User",
        foto:
          item.customers?.foto || item.customers?.users?.path_gambar || null,
      },
    }));
  } catch (error) {
    console.error("Error in getAllUlasan:", error);
    throw error;
  }
};

/**
 * Upload multiple images for review
 * @param {Array} files - Array of files from multer
 */
exports.uploadUlasanImages = async (files) => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map(async (file) => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `ulasan_${timestamp}_${randomStr}.${fileExtension}`;

    const { error } = await supabase.storage
      .from("ulasan")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from("ulasan")
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  });

  return Promise.all(uploadPromises);
};

/**
 * Create a new review
 * @param {Object} reviewData - Review data (id_orders, id_shops, id_services, id_customers, rating, ulasan, foto_ulasan)
 */
exports.createUlasan = async (reviewData) => {
  const {
    id_orders,
    id_shops,
    id_services,
    id_customers,
    rating,
    ulasan,
    foto_ulasan,
  } = reviewData;

  try {
    let final_id_shops = id_shops;

    // 1. If id_orders is provided, validate it
    if (id_orders) {
      if (!id_services) {
        throw new Error("id_services wajib diisi jika mengulas dari pesanan");
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id_orders, id_customer, id_shops")
        .eq("id_orders", id_orders)
        .eq("id_customer", id_customers)
        .single();

      if (orderError || !order) {
        throw new Error(
          "Pesanan tidak ditemukan atau Anda tidak memiliki akses",
        );
      }

      // Pastikan layanan benar-benar ada di pesanan tersebut
      const { data: detailOrder, error: detailError } = await supabase
        .from("detail_orders")
        .select("id_detail_orders")
        .eq("id_orders", id_orders)
        .eq("id_services", id_services)
        .maybeSingle();

      if (!detailOrder) {
        throw new Error(
          "Layanan tersebut tidak ditemukan di dalam pesanan ini",
        );
      }

      // Use id_shops from order if not explicitly provided
      final_id_shops = order.id_shops;

      // 2. Check if already reviewed for this order AND this service
      const { data: existing, error: existingError } = await supabase
        .from("ulasan")
        .select("id_ulasan")
        .eq("id_orders", id_orders)
        .eq("id_services", id_services)
        .maybeSingle();

      if (existing) {
        throw new Error(
          "Anda sudah memberikan ulasan untuk layanan ini pada pesanan tersebut",
        );
      }
    } else {
      // If no id_orders, id_shops must be provided
      if (!final_id_shops) {
        throw new Error("id_shops wajib diisi untuk ulasan toko");
      }
      // Shop reviews shouldn't have specific services attached usually,
      // but if the schema allows it, we ensure the service belongs to the shop
      if (id_services) {
        const { data: serviceCheck } = await supabase
          .from("services")
          .select("id_services")
          .eq("id_services", id_services)
          .eq("id_shops", final_id_shops)
          .maybeSingle();
        if (!serviceCheck)
          throw new Error("Layanan tidak ditemukan di toko ini");
      }

      // Optional: Check if shop exists
      const { data: shop, error: shopError } = await supabase
        .from("shops")
        .select("id_shops")
        .eq("id_shops", final_id_shops)
        .single();

      if (shopError || !shop) {
        throw new Error("Toko tidak ditemukan");
      }
    }

    // 3. Insert review
    const { data, error } = await supabase
      .from("ulasan")
      .insert({
        id_orders: id_orders || null,
        id_shops: final_id_shops,
        id_services: id_services || null,
        id_customers,
        rating: parseInt(rating),
        ulasan,
        foto_ulasan: foto_ulasan || [],
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error in createUlasan:", error);
    throw error;
  }
};
