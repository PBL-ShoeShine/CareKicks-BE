const express = require("express");
const router = express.Router();

// 1. Customer Riwayat routes
router.use("/orders", require("./riwayat/riwayat.routes"));

// 2. Customer Detail Order routes
router.use("/orders", require("./detail_order/detail_order.routes"));

// 3. Customer Payment routes
router.use("/payments", require("./payment/payment.routes"));

// 4. Customer store registration routes
router.use("/stores", require("./stores/stores.routes"));

module.exports = router;
