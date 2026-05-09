const inputoffService = require("./inputoff_service");

exports.createOfflineOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      nama_customer,
      nomor_telepon,
      jenis_sepatu,
      services,
      merk,
      warna,
      catatan,
      metode_bayar,
      foto_sebelum_url,
    } = req.body;

    // Validate required fields
    if (
      !nama_customer ||
      !nomor_telepon ||
      !jenis_sepatu ||
      !services ||
      services.length === 0 ||
      !metode_bayar
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: nama_customer, nomor_telepon, jenis_sepatu, services, metode_bayar",
      });
    }

    // Validate payment method
    if (!["tunai", "qris"].includes(metode_bayar.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "metode_bayar must be 'tunai' or 'qris'",
      });
    }

    // Validate shoe type
    if (
      !["Sneakers", "Leather", "Canvas"].includes(jenis_sepatu)
    ) {
      return res.status(400).json({
        success: false,
        message: "jenis_sepatu must be 'Sneakers', 'Leather', or 'Canvas'",
      });
    }

    const result = await inputoffService.createOfflineOrder({
      userId,
      nama_customer,
      nomor_telepon,
      jenis_sepatu,
      services,
      merk,
      warna,
      catatan,
      metode_bayar: metode_bayar.toLowerCase(),
      foto_sebelum_url,
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
