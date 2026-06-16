const konfirmasiService = require("./konfirmasi_pesanan.service");
const shopAccess = require("../../../core/services/shop-access.service");

/**
 * Controller untuk Konfirmasi Pesanan Admin
 */

exports.getOrders = async (req, res) => {
  try {
    const id_shops = await shopAccess.getShopIdForUser(req.user);
    const { tab } = req.query; // 'pembayaran' atau 'pesanan_baru'

    const orders = await konfirmasiService.getOrdersToConfirm(id_shops, tab);

    res.status(200).json({
      success: true,
      message: `Daftar antrean ${tab || 'pembayaran'} berhasil diambil`,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const id_shops = await shopAccess.getShopIdForUser(req.user);
    const { id_orders } = req.params;
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action harus 'approve' atau 'reject'",
      });
    }

    const updatedOrder = await konfirmasiService.confirmPayment(id_orders, id_shops, { action, reason });

    res.status(200).json({
      success: true,
      message: `Pembayaran berhasil ${action === 'approve' ? 'diterima' : 'ditolak'}`,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.confirmOrder = async (req, res) => {
  try {
    const id_shops = await shopAccess.getShopIdForUser(req.user);
    const { id_orders } = req.params;
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action harus 'approve' atau 'reject'",
      });
    }

    const updatedOrder = await konfirmasiService.confirmOrder(id_orders, id_shops, { action, reason });

    res.status(200).json({
      success: true,
      message: `Pesanan berhasil ${action === 'approve' ? 'diterima' : 'ditolak'}`,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
