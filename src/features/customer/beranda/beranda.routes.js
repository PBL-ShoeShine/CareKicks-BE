const express = require("express");
const router = express.Router();
const { getBerandaHandler } = require("./beranda.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

// Middleware untuk memastikan hanya role customer yang bisa akses
const isCustomer = (req, res, next) => {
  // Payload JWT menggunakan key 'role', bukan 'jenis_role'
  if (req.user && req.user.role === "customer") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya untuk Customer.",
    });
  }
};

// Endpoint: GET /api/v1/customer/beranda
router.get("/", authMiddleware, isCustomer, getBerandaHandler);

module.exports = router;
