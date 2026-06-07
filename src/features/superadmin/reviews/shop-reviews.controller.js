const shopReviewsService = require("./shop-reviews.service");

const handleError = (res, error) => {
  const status = error.code === "PGRST116" ? 404 : error.status || 400;

  return res.status(status).json({
    success: false,
    message: error.message || "Terjadi kesalahan",
  });
};

exports.getReviewShops = async (req, res) => {
  try {
    const data = await shopReviewsService.getReviewShops(req.query);

    return res.status(200).json({
      success: true,
      message: "Data review toko berhasil diambil",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getReviewShopDetail = async (req, res) => {
  try {
    const data = await shopReviewsService.getReviewShopDetail(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Detail review toko berhasil diambil",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.suspendShop = async (req, res) => {
  try {
    const data = await shopReviewsService.suspendShop(
      req.params.id,
      req.user.id_user,
      req.body.alasan_penangguhan,
    );

    return res.status(200).json({
      success: true,
      message: "Toko berhasil ditangguhkan",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.activateShop = async (req, res) => {
  try {
    const data = await shopReviewsService.activateShop(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Toko berhasil diaktifkan kembali",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
