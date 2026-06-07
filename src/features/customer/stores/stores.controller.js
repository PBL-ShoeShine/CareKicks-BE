const storesService = require("./stores.service");

const handleError = (res, error) => {
  const status = error.status || (error.code === "PGRST116" ? 404 : 400);

  return res.status(status).json({
    success: false,
    message: error.message || "Terjadi kesalahan",
    data: error.data,
  });
};

exports.registerStore = async (req, res) => {
  try {
    const data = await storesService.registerStore(req.user.id_user, req.body, req.files || {});

    return res.status(201).json({
      success: true,
      message: "Pendaftaran toko berhasil dikirim",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getMyRegistration = async (req, res) => {
  try {
    const data = await storesService.getMyRegistration(req.user.id_user);

    return res.status(200).json({
      success: true,
      message: data ? "Data pendaftaran toko berhasil diambil" : "Belum ada pendaftaran toko",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
