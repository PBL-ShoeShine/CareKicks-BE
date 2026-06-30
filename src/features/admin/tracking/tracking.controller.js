const trackingService = require("./tracking.service");
const shopAccess = require("../../../core/services/shop-access.service");

const getShopIdByUser = (authUser) => shopAccess.getShopIdForUser(authUser);

exports.getAllTracking = async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;

    const shopId = await getShopIdByUser(req.user);

    const orders = await trackingService.getAllTracking(shopId, search, status);

    return res.status(200).json({
      success: true,
      message: "Tracking orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getTrackingDetail = async (req, res) => {
  try {
    const { id_orders } = req.params;

    const shopId = await getShopIdByUser(req.user);
    const detail = await trackingService.getTrackingDetail(id_orders, shopId);

    return res.status(200).json({
      success: true,
      message: "Tracking detail retrieved successfully",
      data: detail,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getLatestLocation = async (req, res) => {
  try {
    const { id_orders } = req.params;

    const shopId = await getShopIdByUser(req.user);
    const detail = await trackingService.getLatestLocation(id_orders, shopId);

    return res.status(200).json({
      success: true,
      message: "Latest tracking retrieved successfully",
      data: detail,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateTrackingStatus = async (req, res) => {
  try {
    const { id_orders } = req.params;
    const {
      status,
      keterangan,
      latitude,
      longitude,
      id_staff,
      id_detail_orders,
      foto_type,
      is_validation, // Flag if this is a validation/delivery photo
    } = req.body;
    const file = req.file;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const shopId = await getShopIdByUser(req.user);

    let fotoUrl = null;
    if (file) {
      fotoUrl = await trackingService.uploadImage(file);
    }

    // PENTING: prioritaskan id_staff dari JWT token (pasti milik akun yang login),
    // baru fallback ke id_staff dari body request (dari Flutter).
    const idStaff = req.user?.id_user ?? null;

    const updatedOrder = await trackingService.updateStatus(id_orders, shopId, {
      status,
      keterangan,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      id_staff: idStaff,
      id_detail_orders,
      foto_type,
      foto_url: fotoUrl,
      is_validation: is_validation === "true" || is_validation === true,
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { id_orders } = req.params;
    const { latitude, longitude, id_staff, status } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const shopId = await getShopIdByUser(req.user);
    await trackingService.updateLocation(id_orders, shopId, {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      id_staff,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
