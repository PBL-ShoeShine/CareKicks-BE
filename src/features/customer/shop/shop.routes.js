const express = require("express");
const router = express.Router();
const shopController = require("./shop.controller");
const authMiddleware = require("../../../core/services/auth.middleware");
const upload = require("../../../core/services/upload.middleware");

// GET /api/v1/customer/shops/:idShops
router.get("/:idShops", authMiddleware, shopController.getShopProfile);

// POST /api/v1/customer/shops/register
router.post(
  "/register",
  authMiddleware,
  upload.fields([
    { name: "foto_toko", maxCount: 1 },
    { name: "foto_ktp", maxCount: 1 }
  ]),
  shopController.registerShop
);

module.exports = router;
