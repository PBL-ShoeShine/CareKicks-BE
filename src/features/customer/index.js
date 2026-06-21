const express = require("express");
const router = express.Router();

// 1. Customer Beranda routes
router.use("/beranda", require("./beranda/beranda.routes"));

// 2. Customer Detail Layanan (Services) routes
router.use("/services", require("./detail_layanan/services.routes"));

// 3. Customer Order (Buat Pesanan Online) routes
router.use("/order", require("./order/order.routes"));

// 4. Customer Riwayat routes (Sudah disamakan ke /riwayat agar cocok dengan Swagger)
router.use("/riwayat", require("./riwayat/riwayat.routes"));

// 5. Customer Detail Order routes
router.use("/detail-order", require("./detail_order/detail_order.routes"));

// 6. Customer Payment routes
router.use("/payment", require("./payment/payment.routes"));

// 7. Customer Profile routes
router.use("/profile", require("./profile/profile.routes"));

// 8. Customer Alamat routes
router.use("/addresses", require("./profile/alamat.routes"));

// 9. Customer Notifications routes
router.use("/notifications", require("./notifications/notifications.routes"));

// 10. Customer Ulasan routes
router.use("/ulasan", require("./ulasan/ulasan.routes"));

// 11. Customer Shop Profile routes
router.use("/shops", require("./shop/shop.routes"));
// 12. Customer Cart routes
router.use("/cart", require("./cart/cart.routes"));

module.exports = router;
