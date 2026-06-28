const express = require("express");
const router = express.Router();
const shopsController = require("./shops.controller");
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

router.get("/", authMiddleware, superadminOnly, shopsController.getStores);
router.get("/:id", authMiddleware, superadminOnly, shopsController.getStoreDetail);
router.put("/:id/verify", authMiddleware, superadminOnly, shopsController.verifyStore);

module.exports = router;
