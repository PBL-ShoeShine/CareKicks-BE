const express = require("express");
const router = express.Router();

const trackingController = require("./tracking.controller");
const authMiddleware = require("../../../core/services/auth.middleware");
const upload = require("../../../core/services/upload.middleware");

// GET all tracking orders for admin shop
router.get("/", authMiddleware, trackingController.getAllTracking);

// GET latest tracking log for an order (MUST come before /:id_orders)
router.get("/:id_orders/latest", authMiddleware, trackingController.getLatestLocation);

// GET tracking detail history for an order
router.get("/:id_orders", authMiddleware, trackingController.getTrackingDetail);

// UPDATE tracking status and add log
router.post(
  "/:id_orders",
  authMiddleware,
  upload.single("foto"),
  trackingController.updateTrackingStatus,
);

// UPDATE courier location only
router.patch(
  "/:id_orders/location",
  authMiddleware,
  trackingController.updateLocation,
);

module.exports = router;
