const express = require("express");
const router = express.Router();
const antreanController = require("./antrean.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

// GET  /api/v1/admin/antrean              → semua antrean (?status=pending/diproses/selesai)
router.get("/", authMiddleware, antreanController.getAllAntrean);

// GET  /api/v1/admin/antrean/total        → total antrean + selisih kemarin
router.get("/total", authMiddleware, antreanController.getTotalAntrean);

// GET  /api/v1/admin/antrean/:id          → detail satu order
router.get("/:id", authMiddleware, antreanController.getAntreanById);

// PATCH /api/v1/admin/antrean/:id/status  → update status order
router.patch("/:id/status", authMiddleware, antreanController.updateStatus);

module.exports = router;