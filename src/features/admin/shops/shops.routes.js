const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../core/services/auth.middleware");
const shopsController = require("./shops.controller");

const superAdminOnly = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();

  if (role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Hanya SuperAdmin yang dapat mengakses fitur ini",
    });
  }

  return next();
};

router.use(authMiddleware, superAdminOnly);

router.get("/", shopsController.getShops);
router.get("/:id", shopsController.getShopDetail);

module.exports = router;
