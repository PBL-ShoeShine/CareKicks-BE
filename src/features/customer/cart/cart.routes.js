const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../../../core/services/auth.middleware");
const { getCartHandler, addToCartHandler, updateCartItemHandler, deleteCartItemHandler } = require("./cart.controller");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar yang diperbolehkan!"), false);
    }
  },
});

router.get("/", authMiddleware, getCartHandler);
router.post("/", authMiddleware, upload.array("foto_sebelum", 5), addToCartHandler);
router.patch("/item/:id", authMiddleware, upload.array("foto_sebelum", 5), updateCartItemHandler);
router.delete("/item/:id", authMiddleware, deleteCartItemHandler);

module.exports = router;
