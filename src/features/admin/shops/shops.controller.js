const shopsService = require("./shops.service");

exports.getStores = async (req, res, next) => {
  try {
    const { search, page, limit, status } = req.query;
    const data = await shopsService.getStores({
      search: search || "",
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      status: status || ""
    });
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

exports.getStoreDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await shopsService.getStoreDetail(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Toko tidak ditemukan"
      });
    }
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyStore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status_verifikasi, alasan_penangguhan } = req.body;

    if (!["approved", "rejected", "suspended", "appealed"].includes(status_verifikasi)) {
      return res.status(400).json({
        success: false,
        message: "Status verifikasi harus 'approved', 'rejected', 'suspended', atau 'appealed'"
      });
    }

    const data = await shopsService.verifyStore(id, { status_verifikasi, alasan_penangguhan });
    return res.status(200).json({
      success: true,
      message: `Toko berhasil diperbarui menjadi ${status_verifikasi}`,
      data
    });
  } catch (error) {
    next(error);
  }
};
