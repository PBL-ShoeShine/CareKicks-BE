const pemindaiService = require("./pemindai.service");

exports.verifyQR = async (req, res) => {
  try {
    const { qr_code } = req.body;
    
    console.log("\n[SCAN MASUK]:", qr_code);

    const data = await pemindaiService.getDetailByQR(qr_code);
    
    return res.status(200).json({
      success: true,
      message: "Data ditemukan",
      data,
    });
  } catch (error) {
    console.log("[ERROR BACKEND]:", error.message);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    // SINKRONISASI CERDAS: Menerima kunci parameter apa pun yang dikirimkan oleh Flutter
    const kode_order = req.body.kode_order;
    const status_baru = req.body.status_baru || req.body.status || req.body.status_order;

    console.log(`\n[REQUEST UPDATE STATUS]: Order #${kode_order} -> Menuju Status: ${status_baru}`);

    if (!status_baru) {
      return res.status(400).json({
        success: false,
        message: "Gagal: Parameter status baru tidak terdeteksi oleh backend.",
      });
    }

    const data = await pemindaiService.updateStatusOrder(kode_order, status_baru);
    
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