const konfirmasiService = require("./konfirmasi_pesanan.service");
const shopAccess = require("../../../core/services/shop-access.service");
const { resolveStaffIds } = require("../../../core/services/resolve-staff-id");

exports.getOrders = async (req, res) => {
  try {
    const id_shops = await shopAccess.getShopIdForUser(req.user);
    const { tab, metode_order } = req.query;

    const orders = await konfirmasiService.getOrdersToConfirm(
      id_shops,
      tab,
      metode_order,
    );

    res.status(200).json({
      success: true,
      message: `Daftar antrean ${tab || "pembayaran"} berhasil diambil`,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const id_shops = await shopAccess.getShopIdForUser(req.user);
    const { id_orders } = req.params;
    const { action, reason } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action harus 'approve' atau 'reject'",
      });
    }

    // FIX: ambil id_user dari JWT saja, pass id_shops agar tidak nyasar ke staff toko lain
    const resolved = await resolveStaffIds(req.user?.id_user, id_shops);
    const id_staff = resolved.id_staff; // null jika admin toko (tidak ada di tabel staff)

    const updatedOrder = await konfirmasiService.confirmPayment(
      id_orders,
      id_shops,
      { action, reason, id_staff },
    );

    res.status(200).json({
      success: true,
      message: `Pembayaran berhasil ${action === "approve" ? "diterima" : "ditolak"}`,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.confirmOrder = async (req, res) => {
  try {
    const id_shops = await shopAccess.getShopIdForUser(req.user);
    const { id_orders } = req.params;
    const { action, reason } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action harus 'approve' atau 'reject'",
      });
    }

    // FIX: ambil id_user dari JWT saja, pass id_shops agar tidak nyasar ke staff toko lain
    const resolved = await resolveStaffIds(req.user?.id_user, id_shops);
    const id_staff = resolved.id_staff; // null jika admin toko (tidak ada di tabel staff)

    const updatedOrder = await konfirmasiService.confirmOrder(
      id_orders,
      id_shops,
      { action, reason, id_staff },
    );

    res.status(200).json({
      success: true,
      message: `Pesanan berhasil ${action === "approve" ? "diterima" : "ditolak"}`,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
