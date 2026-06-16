const express = require("express");
const router = express.Router();
const konfirmasiController = require("./konfirmasi_pesanan.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

// GET /api/v1/admin/konfirmasi_pesanan?tab=pembayaran
// GET /api/v1/admin/konfirmasi_pesanan?tab=pesanan_baru
router.get("/", authMiddleware, konfirmasiController.getOrders);

// PATCH /api/v1/admin/konfirmasi_pesanan/pembayaran/:id_orders
router.patch("/pembayaran/:id_orders", authMiddleware, konfirmasiController.confirmPayment);

// PATCH /api/v1/admin/konfirmasi_pesanan/pesanan/:id_orders
router.patch("/pesanan/:id_orders", authMiddleware, konfirmasiController.confirmOrder);

module.exports = router;
