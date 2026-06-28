const pemindaiService = require("./pemindai.service");

exports.verifyQR = async (req, res) => {
  try {
    const { qr_code } = req.body;
    const data = await pemindaiService.getDetailByQR(qr_code);

    return res.status(200).json({
      success: true,
      message: "Data ditemukan",
      data,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const kode_order = req.body.kode_order;
    const status_baru =
      req.body.status_baru || req.body.status || req.body.status_order;

    // --- PERBAIKAN SUPER AMAN: Menangkap semua kemungkinan nama ID ---
    const idStaff = 
      req.user?.id_user || 
      req.user?.id_staff || 
      req.user?.id || 
      req.user?.userId || 
      null;

    console.log(
      `\n[REQUEST UPDATE STATUS]: Order #${kode_order} -> Menuju Status: ${status_baru} oleh Staff ID: ${idStaff}`
    );
    
    // Bantuan log jika ternyata masih null
    if (!idStaff) {
      console.log("[DEBUG] Isi dari req.user adalah:", req.user);
    }

    if (!kode_order) {
      return res.status(400).json({
        success: false,
        message: "Gagal: kode_order tidak ditemukan.",
      });
    }

    if (!status_baru) {
      return res.status(400).json({
        success: false,
        message: "Gagal: Parameter status baru tidak terdeteksi oleh backend.",
      });
    }

    // Mengirim idStaff ke file pemindai.service.js
    const data = await pemindaiService.updateStatusOrder(
      kode_order,
      status_baru,
      idStaff 
    );

    return res.status(200).json({
      success: true,
      message: "Status berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.log("[ERROR UPDATE BACKEND]:", error.message);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};