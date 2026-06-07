const shopVerificationsService = require("./shop-verifications.service");

const handleError = (res, error) => {
  const status = error.code === "PGRST116" ? 404 : error.status || 400;

  return res.status(status).json({
    success: false,
    message: error.message || "Terjadi kesalahan",
  });
};

exports.getShopVerifications = async (req, res) => {
  try {
    const data = await shopVerificationsService.getShopVerifications(req.query);

    return res.status(200).json({
      success: true,
      message: "Data verifikasi toko berhasil diambil",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getShopVerificationDetail = async (req, res) => {
  try {
    const data = await shopVerificationsService.getShopVerificationDetail(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Detail verifikasi toko berhasil diambil",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.updateShopVerificationStatus = async (req, res) => {
  try {
    const data = await shopVerificationsService.updateShopVerificationStatus(
      req.params.id,
      req.body.status,
    );

    return res.status(200).json({
      success: true,
      message: "Status verifikasi toko berhasil diperbarui",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
