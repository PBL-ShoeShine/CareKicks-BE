const pemindaiService = require("./pemindai.service");
const shopAccess = require("../../../core/services/shop-access.service");

// Helper: Verifikasi dan Ambil ID Toko dari Admin/Staff yang sedang scan
const getShopId = async (req) => {
  const shopData = await shopAccess.getShopForUser(req.user);
  if (!shopData || !shopData.shop) {
    throw new Error("Anda tidak memiliki akses ke toko mana pun.");
  }
  return shopData.shop.id_shops;
};

exports.verifyQR = async (req, res) => {
  try {
    const { qr_code } = req.body;
    
    // Ambil ID Toko milik Admin/Staff
    const idShopsAdmin = await getShopId(req); 

    // Passing ID Toko tersebut ke pencarian untuk divalidasi
    const data = await pemindaiService.getDetailByQR(qr_code, idShopsAdmin);

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
    const status_baru = req.body.status_baru || req.body.status || req.body.status_order;

    const idStaff = 
      req.user?.id_user || 
      req.user?.id_staff || 
      req.user?.id || 
      req.user?.userId || 
      null;

    // Ambil ID Toko milik Admin/Staff
    const idShopsAdmin = await getShopId(req); 

    if (!kode_order) {
      return res.status(400).json({ success: false, message: "Gagal: kode_order tidak ditemukan." });
    }
    if (!status_baru) {
      return res.status(400).json({ success: false, message: "Gagal: Parameter status baru tidak terdeteksi." });
    }

    const data = await pemindaiService.updateStatusOrder(
      kode_order,
      status_baru,
      idStaff,
      idShopsAdmin // Oper ke service untuk validasi sebelum update
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