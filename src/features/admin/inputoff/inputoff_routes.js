const express = require("express");
const router = express.Router();
const inputoffController = require("./inputoff_controller");
const authMiddleware = require("../../../core/services/auth.middleware");

// POST /api/v1/admin/inputoff
router.post("/", authMiddleware, inputoffController.createOfflineOrder);

module.exports = router;
