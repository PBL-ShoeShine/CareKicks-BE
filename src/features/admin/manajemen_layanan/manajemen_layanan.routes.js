const express = require("express");
const router = express.Router();

const manajemenLayananController = require("./manajemen_layanan.controller");
const authMiddleware = require("../../../core/services/auth.middleware");
const upload = require("../../../core/services/upload.middleware");

// GET all services
router.get("/", authMiddleware, manajemenLayananController.getServices);

// CREATE service + upload image
router.post(
  "/",
  authMiddleware,
  upload.single("foto"),
  manajemenLayananController.createService,
);

// UPDATE service status
router.patch(
  "/:id/status",
  authMiddleware,
  manajemenLayananController.updateServiceStatus,
);

// UPDATE service + optional new image
router.patch(
  "/:id",
  authMiddleware,
  upload.single("foto"),
  manajemenLayananController.updateService,
);

// DELETE service
router.delete("/:id", authMiddleware, manajemenLayananController.deleteService);

module.exports = router;
