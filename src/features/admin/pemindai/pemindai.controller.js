const pemindaiService = require("./pemindai.service");

exports.verifyQR = async (req, res) => {
  try {
    const { qr_code } = req.body;

    if (!qr_code) {
      return res.status(400).json({
        success: false,
        message: "QR Code tidak boleh kosong",
      });
    }

    const data = await pemindaiService.getDetailByQR(qr_code);

    return res.status(200).json({
      success: true,
      message: "Data pemindai berhasil ditemukan",
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Terjadi kesalahan pada server",
    });
  }
};