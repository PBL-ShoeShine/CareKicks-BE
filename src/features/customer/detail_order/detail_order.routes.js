const express = require("express");
const router = express.Router();
const { getDetailOrderHandler } = require("./detail_order.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

router.get("/:orderId", authMiddleware, getDetailOrderHandler);

module.exports = router;
