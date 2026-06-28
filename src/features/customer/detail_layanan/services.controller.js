const { getServiceDetail } = require("./services.service");

exports.getServiceDetailHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "ID layanan tidak valid",
      });
    }

    const data = await getServiceDetail(id);

    res.status(200).json({
      success: true,
      message: "Detail layanan berhasil diambil",
      data,
    });
  } catch (error) {
    console.error("Error in getServiceDetailHandler:", error);
    const statusCode = error.message.includes("tidak ditemukan") || error.message.includes("tidak tersedia") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Gagal mengambil detail layanan",
    });
  }
};
