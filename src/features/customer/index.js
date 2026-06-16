const express = require("express");
const router = express.Router();
// 1. Customer Riwayat routes
router.use("/orders", require("./riwayat/riwayat.routes"));
// 2. Customer Detail Order routes
router.use("/orders", require("./detail_order/detail_order.routes"));
// 3. Customer Payment routes
router.use("/payments", require("./payment/payment.routes"));
// 4. Customer Profile routes
router.use("/profile", require("./profile/profile.routes"));
// 5. Customer Alamat routes
router.use("/addresses", require("./profile/alamat.routes"));
// 6. Customer Notifications routes
router.use("/notifications", require("./notifications/notifications.routes"));
// 7. Customer Beranda routes
router.use("/beranda", require("./beranda/beranda.routes"));
// 8. Customer Detail Layanan (Services) routes
router.use("/services", require("./detail_layanan/services.routes"));
// 9. Customer Ulasan routes
router.use("/ulasan", require("./ulasan/ulasan.routes"));
// 10. Customer Order (Buat Pesanan Online) routes
router.use("/order", require("./order/order.routes"));
module.exports = router;
