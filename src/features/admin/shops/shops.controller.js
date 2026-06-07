const shopsService = require("./shops.service");

const handleError = (res, error) => {
  const status = error.code === "PGRST116" ? 404 : error.status || 400;

  return res.status(status).json({
    success: false,
    message: error.message || "Terjadi kesalahan",
  });
};

exports.getShops = async (req, res) => {
  try {
    const data = await shopsService.getShops(req.query);

    return res.status(200).json({
      success: true,
      message: "Data toko berhasil diambil",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getShopDetail = async (req, res) => {
  try {
    const data = await shopsService.getShopDetail(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Detail toko berhasil diambil",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
