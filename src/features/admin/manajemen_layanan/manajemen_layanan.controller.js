const manajemenLayananService = require("./manajemen_layanan.service");
const supabase = require("../../../core/config/supabase");

// helper ambil shop id admin
// helper ambil shop id dari user admin
const getShopIdByUser = async (userId) => {
  // cari shops_admin dulu
  const { data: shopAdmin, error: adminError } = await supabase
    .from("shops_admin")
    .select("id_shops_admin")
    .eq("id_user", userId)
    .single();

  if (adminError || !shopAdmin) {
    throw new Error("Shop admin not found for this user");
  }

  // cari toko berdasarkan id_shops_admin
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id_shops")
    .eq("id_shops_admin", shopAdmin.id_shops_admin)
    .single();

  if (shopError || !shop) {
    throw new Error("Shop not found for this admin user");
  }

  return shop.id_shops;
};

exports.getServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search = "", category = "" } = req.query;

    const shopId = await getShopIdByUser(userId);

    const services = await manajemenLayananService.getServices(
      shopId,
      search,
      category,
    );

    return res.status(200).json({
      success: true,
      message: "Services retrieved successfully",
      data: services,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createService = async (req, res) => {
  try {
    const userId = req.user.id;

    const { nama_layanan, harga, estimasi_waktu, deskripsi } = req.body || {};

    const file = req.file;

    // validasi required field
    if (!nama_layanan || harga === undefined || !estimasi_waktu) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: nama_layanan, harga, estimasi_waktu",
      });
    }

    // multipart/form-data bikin harga jadi string
    const parsedHarga = Number(harga);

    if (isNaN(parsedHarga) || parsedHarga < 0) {
      return res.status(400).json({
        success: false,
        message: "harga must be a positive number",
      });
    }

    const shopId = await getShopIdByUser(userId);

    // upload foto jika ada
    let fotoUrl = null;

    if (file) {
      fotoUrl = await manajemenLayananService.uploadServiceImage(file);
    }

    const newService = await manajemenLayananService.createService(shopId, {
      nama_layanan,
      harga: parsedHarga,
      estimasi_waktu,
      deskripsi,
      foto_layanan: fotoUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: newService,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateServiceStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be a boolean value",
      });
    }

    const shopId = await getShopIdByUser(userId);

    const updatedService = await manajemenLayananService.updateServiceStatus(
      id,
      shopId,
      is_active,
    );

    return res.status(200).json({
      success: true,
      message: "Service status updated successfully",
      data: updatedService,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateService = async (req, res) => {
  try {
    const userId = req.user.id;

    const { id } = req.params;

    const { nama_layanan, harga, estimasi_waktu, deskripsi } = req.body || {};

    const file = req.file;

    const shopId = await getShopIdByUser(userId);

    let parsedHarga;

    // validasi harga jika diisi
    if (harga !== undefined) {
      parsedHarga = Number(harga);

      if (isNaN(parsedHarga) || parsedHarga < 0) {
        return res.status(400).json({
          success: false,
          message: "harga must be a positive number",
        });
      }
    }

    let fotoUrl = undefined;

    // upload gambar baru
    if (file) {
      // ambil gambar lama
      const { data: existingService } = await supabase
        .from("services")
        .select("foto_layanan")
        .eq("id_services", id)
        .eq("id_shops", shopId)
        .single();

      // hapus gambar lama
      if (existingService?.foto_layanan) {
        await manajemenLayananService.deleteServiceImage(
          existingService.foto_layanan,
        );
      }

      // upload gambar baru
      fotoUrl = await manajemenLayananService.uploadServiceImage(file);
    }

    const updatedService = await manajemenLayananService.updateService(
      id,
      shopId,
      {
        nama_layanan,
        harga: parsedHarga,
        estimasi_waktu,
        deskripsi,
        foto_layanan: fotoUrl,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const userId = req.user.id;

    const { id } = req.params;

    const shopId = await getShopIdByUser(userId);

    const result = await manajemenLayananService.deleteService(id, shopId);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
