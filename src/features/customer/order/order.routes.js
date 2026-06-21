const express = require("express");
const router = express.Router();
const multer = require("multer");
const orderController = require("./order.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // Maks 3MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar yang diperbolehkan (JPG/PNG)"), false);
    }
  },
});

// POST /api/v1/customer/order
// → Customer buat pesanan online baru
router.post(
  "/",
  authMiddleware,
  upload.array("foto_sepatu", 5),
  orderController.createOnlineOrder,
);

// GET /api/v1/customer/order/services/:idShops
// → Ambil daftar layanan aktif dari toko tertentu (untuk dropdown form)
// POST /api/v1/customer/order/from-cart
// → Buat pesanan dari item keranjang yang dipilih
router.post(
  "/from-cart",
  authMiddleware,
  orderController.createOnlineOrderFromCart,
);

router.get(
  "/services/:idShops",
  authMiddleware,
  orderController.getServicesByShop,
);

module.exports = router;
