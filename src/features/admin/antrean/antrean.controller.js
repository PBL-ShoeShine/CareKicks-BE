const antreanService = require("./antrean.service");

// GET /api/v1/admin/antrean?status=pending
exports.getAllAntrean = async (req, res) => {
  try {
    const { tab, metode_order } = req.query; // ← ganti status jadi tab
    const data = await antreanService.getAllAntrean(req.user, tab, metode_order);
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
    const data = await antreanService.getTotalAntrean(req.user);
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

    const data = await antreanService.getAntreanById(req.user, id);
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
    const { status, keterangan } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Field 'status' wajib diisi",
      });
    }

    if (status === "menunggu_pembayaran" && !keterangan?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Alasan penolakan pembayaran wajib diisi",
      });
    }

    const data = await antreanService.updateStatus(
      req.user,
      id,
      status,
      keterangan?.trim() || null,
    );
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
