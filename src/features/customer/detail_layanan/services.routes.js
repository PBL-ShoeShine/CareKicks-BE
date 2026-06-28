const express = require("express");
const router = express.Router();
const { getServiceDetailHandler } = require("./services.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

// Middleware untuk memastikan hanya role customer yang bisa akses
const isCustomer = (req, res, next) => {
  if (req.user && req.user.role === "customer") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya untuk Customer.",
    });
  }
};

// Endpoint: GET /api/v1/customer/services/:id
router.get("/:id", authMiddleware, isCustomer, getServiceDetailHandler);

module.exports = router;
