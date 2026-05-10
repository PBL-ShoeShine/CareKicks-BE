const antreanService = require("./antrean.service");

// GET /api/v1/admin/antrean?status=pending
exports.getAllAntrean = async (req, res) => {
  try {
    const { status } = req.query;
    const idUser = req.user.id; // dari JWT token

    const data = await antreanService.getAllAntrean(idUser, status);
    return res.status(200).json({
      success: true,
      message: "Data antrean berhasil diambil",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/admin/antrean/total
exports.getTotalAntrean = async (req, res) => {
  try {
    const idUser = req.user.id;

    const data = await antreanService.getTotalAntrean(idUser);
    return res.status(200).json({
      success: true,
      message: "Total antrean berhasil diambil",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/admin/antrean/:id
exports.getAntreanById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await antreanService.getAntreanById(id);
    return res.status(200).json({
      success: true,
      message: "Detail antrean berhasil diambil",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/v1/admin/antrean/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Field 'status' wajib diisi",
      });
    }

    const data = await antreanService.updateStatus(id, status);
    return res.status(200).json({
      success: true,
      message: `Status berhasil diubah ke '${status}'`,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};