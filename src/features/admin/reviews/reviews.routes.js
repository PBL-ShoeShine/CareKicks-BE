const express = require("express");
const router = express.Router();
const reviewsController = require("./reviews.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

const superadminOnly = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak: Hanya SuperAdmin yang diizinkan."
    });
  }
};

router.get("/", authMiddleware, superadminOnly, reviewsController.getReviews);

module.exports = router;
