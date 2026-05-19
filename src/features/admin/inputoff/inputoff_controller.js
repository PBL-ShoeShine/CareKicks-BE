const inputoffService = require("./inputoff_service");

exports.createOfflineOrder = async (req, res) => {
  try {
    const userId = req.user.id_user;

    const {
      nama_customer,
      nomor_telepon,
      jenis_sepatu,
      merk,
      warna,
      catatan,
      metode_bayar,
    } = req.body;

    let services = req.body.services;

    // Parse services kalau dikirim dari Postman form-data
    if (typeof services === "string") {
      try {
        services = JSON.parse(services);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message:
            'Format services tidak valid. Gunakan format JSON array, contoh: [{"id_services":1,"price":30000}]',
        });
      }
    }

    // Validate required fields
    if (
      !nama_customer ||
      !nomor_telepon ||
      !jenis_sepatu ||
      !services ||
      !Array.isArray(services) ||
      services.length === 0 ||
      !metode_bayar
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: nama_customer, nomor_telepon, jenis_sepatu, services, metode_bayar",
      });
    }

    // Validate isi services
    for (const service of services) {
      if (!service.id_services || !service.price) {
        return res.status(400).json({
          success: false,
          message: "Setiap services wajib punya id_services dan price",
        });
      }
    }

    // Validate payment method
    if (!["tunai", "qris"].includes(metode_bayar.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "metode_bayar must be 'tunai' or 'qris'",
      });
    }

    // Validate shoe type
    if (!["Sneakers", "Leather", "Canvas"].includes(jenis_sepatu)) {
      return res.status(400).json({
        success: false,
        message: "jenis_sepatu must be 'Sneakers', 'Leather', or 'Canvas'",
      });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "foto_sebelum file is required",
      });
    }

    const result = await inputoffService.createOfflineOrder({
      userId,
      authUser: req.user,
      nama_customer,
      nomor_telepon,
      jenis_sepatu,
      services,
      merk,
      warna,
      catatan,
      metode_bayar: metode_bayar.toLowerCase(),
      fotoSebelumFile: req.file,
    });

    return res.status(201).json({
      success: true,
      message: "Order offline berhasil dibuat",
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

exports.getServices = async (req, res) => {
  try {
    const result = await inputoffService.getServices(req.user);

    return res.status(200).json({
      success: true,
      message: "Layanan berhasil diambil",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
