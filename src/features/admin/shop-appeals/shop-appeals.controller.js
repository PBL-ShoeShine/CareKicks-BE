const shopAppealsService = require("./shop-appeals.service");

const handleError = (res, error) => {
  const status = error.code === "PGRST116" ? 404 : error.status || 400;

  return res.status(status).json({
    success: false,
    message: error.message || "Terjadi kesalahan",
  });
};

exports.getMyAppeals = async (req, res) => {
  try {
    const data = await shopAppealsService.getMyAppeals(req.user);

    return res.status(200).json({
      success: true,
      message: "Riwayat banding berhasil diambil",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.createAppeal = async (req, res) => {
  try {
    const data = await shopAppealsService.createAppeal(req.user, {
      description: req.body.description,
      files: [
        ...(req.files?.evidence_images || []),
        ...(req.files?.["evidence_images[]"] || []),
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Pengajuan banding berhasil dikirim",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
