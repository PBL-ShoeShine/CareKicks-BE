const { getBerandaServices } = require("./beranda.service");

exports.getBerandaHandler = async (req, res) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      spesialisasi,
      minRating,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;

    const result = await getBerandaServices({
      search,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      spesialisasi,
      minRating,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: "Data beranda berhasil diambil",
      data: result.services,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in getBerandaHandler:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data beranda",
      error: error.message,
    });
  }
};
