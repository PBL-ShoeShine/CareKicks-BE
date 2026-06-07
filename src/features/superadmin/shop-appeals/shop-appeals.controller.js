const shopAppealsService = require("./shop-appeals.service");

const handleError = (res, error) => {
  const status = error.code === "PGRST116" ? 404 : error.status || 400;

  return res.status(status).json({
    success: false,
    message: error.message || "Terjadi kesalahan",
  });
};

exports.getAppeals = async (req, res) => {
  try {
    const data = await shopAppealsService.getAppeals(req.query);

    return res.status(200).json({
      success: true,
      message: "Data pengajuan banding toko berhasil diambil",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getAppealDetail = async (req, res) => {
  try {
    const data = await shopAppealsService.getAppealDetail(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Detail pengajuan banding toko berhasil diambil",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.approveAppeal = async (req, res) => {
  try {
    const data = await shopAppealsService.approveAppeal(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: "Banding toko berhasil disetujui",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.rejectAppeal = async (req, res) => {
  try {
    const data = await shopAppealsService.rejectAppeal(
      req.params.id,
      req.user,
      req.body.rejection_reason,
    );

    return res.status(200).json({
      success: true,
      message: "Banding toko berhasil ditolak",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
