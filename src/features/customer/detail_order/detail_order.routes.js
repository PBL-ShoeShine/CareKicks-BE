const express = require("express");
const router = express.Router();
const { getDetailOrderHandler } = require("./detail_order.controller");
const authMiddleware = require("../../../core/middlewares/authMiddleware");

router.get("/:orderId", authMiddleware, getDetailOrderHandler);

module.exports = router;
