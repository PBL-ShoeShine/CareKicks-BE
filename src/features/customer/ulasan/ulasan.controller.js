const ulasanService = require("./ulasan.service");
const supabase = require("../../../core/config/supabase");

/**
 * Get all reviews with filters (id_shops, id_services, rating)
 */
exports.getAllUlasan = async (req, res) => {
  try {
    const { id_shops, id_services, rating } = req.query;
    const data = await ulasanService.getAllUlasan({ id_shops, id_services, rating });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil ulasan",
      data,
    });
  } catch (error) {
    console.error("Error in getAllUlasan controller:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil ulasan",
      error: error.message,
    });
  }
};

/**
 * Create a new review with multiple photos
 */
exports.createUlasan = async (req, res) => {
  try {
    const id_user = req.user.id_user || req.user.id;
    let { id_orders, id_shops, id_services, rating, ulasan } = req.body;
    const files = req.files; // Karena pakai upload.array(), files ini adalah sebuah Array

    // Bersihkan data jika dikirim sebagai string kosong, "null", "undefined", atau "0"
    if (id_orders === "" || id_orders === "null" || id_orders === "undefined" || id_orders == 0) id_orders = null;
    if (id_shops === "" || id_shops === "null" || id_shops === "undefined" || id_shops == 0) id_shops = null;
    if (id_services === "" || id_services === "null" || id_services === "undefined" || id_services == 0) id_services = null;

    if (!rating || !ulasan) {
      return res.status(400).json({
        success: false,
        message: "Rating dan ulasan wajib diisi",
      });
    }

    if (!id_shops && !id_orders) {
       return res.status(400).json({
        success: false,
        message: "Harus menyertakan id_shops (untuk ulasan toko) atau id_orders (untuk ulasan transaksi)",
      });
    }

    // 1. Get id_customers from id_user
    let { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id_customers")
      .eq("id_user", id_user)
      .maybeSingle();

    if (!customer && req.user.role === "customer") {
      console.log(`Customer record not found for user ${id_user}, creating one...`);
      
      const { data: userData } = await supabase
        .from("users")
        .select("nama, no_hp")
        .eq("id_user", id_user)
        .single();

      const { data: newCustomer, error: createError } = await supabase
        .from("customers")
        .insert({
          id_user: id_user,
          nama: userData?.nama || "User",
          nomor_hp: userData?.no_hp || null
        })
        .select("id_customers")
        .single();

      if (createError) {
        console.error("Gagal membuat data customer otomatis:", createError);
        return res.status(500).json({
          success: false,
          message: "Gagal menginisialisasi data customer",
        });
      }
      customer = newCustomer;
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Data customer tidak ditemukan. Pastikan Anda login sebagai pelanggan.",
      });
    }

    // 2. Upload photos if any
    let foto_ulasan = [];
    if (files && files.length > 0) {
      try {
        // Langsung lempar array files ke service
        foto_ulasan = await ulasanService.uploadUlasanImages(files);
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Gagal mengupload foto ulasan",
          error: uploadError.message,
        });
      }
    }

    // 3. Create review in DB
    const newUlasan = await ulasanService.createUlasan({
      id_orders,
      id_shops,
      id_services,
      id_customers: customer.id_customers,
      rating,
      ulasan,
      foto_ulasan, // Berisi array URL ["https://...", "https://..."]
    });

    return res.status(201).json({
      success: true,
      message: "Ulasan berhasil dikirim",
      data: newUlasan,
    });
  } catch (error) {
    console.error("Error in createUlasan controller:", error);
    
    const isBadRequest = error.message.includes("sudah memberikan") || 
                         error.message.includes("tidak ditemukan") ||
                         error.message.includes("wajib diisi");
    const status = isBadRequest ? 400 : 500;
                   
    return res.status(status).json({
      success: false,
      message: error.message || "Terjadi kesalahan saat mengirim ulasan",
    });
  }
};