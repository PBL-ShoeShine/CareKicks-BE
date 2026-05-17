const express = require("express");
const router = express.Router();
const multer = require("multer");
const inputoffController = require("./inputoff_controller");
const authMiddleware = require("../../../core/services/auth.middleware");

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/v1/admin/inputoff
router.post(
  "/",
  authMiddleware,
  upload.single("foto_sebelum"),
  inputoffController.createOfflineOrder,
);
// GET /api/v1/admin/inputoff/services
router.get("/services", authMiddleware, inputoffController.getServices);

module.exports = router;
