const express = require("express");
const router = express.Router();
const pemindaiController = require("./pemindai.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

// --- PERBAIKAN: Wajib pakai authMiddleware di kedua rute ini ---
router.post("/verify", authMiddleware, pemindaiController.verifyQR);
router.put("/update-status", authMiddleware, pemindaiController.changeStatus);

module.exports = router;