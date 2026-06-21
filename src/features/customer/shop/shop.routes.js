const express = require("express");
const router = express.Router();
const shopController = require("./shop.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

// GET /api/v1/customer/shops/:idShops
router.get("/:idShops", authMiddleware, shopController.getShopProfile);

module.exports = router;
