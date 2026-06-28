const express = require("express");
const router = express.Router();

const ulasanController = require("./ulasan.controller");
const authMiddleware = require("../../../core/services/auth.middleware");
const upload = require("../../../core/services/upload.middleware");

// GET /api/v1/customer/ulasan - Get all reviews with optional filters (id_shops, rating)
router.get("/", ulasanController.getAllUlasan);

// POST /api/v1/customer/ulasan - Create a new review with multiple photos (max 5)
router.post(
  "/",
  authMiddleware,
  upload.array("foto_ulasan", 5), // Memastikan multer memproses ini sebagai array
  ulasanController.createUlasan
);

module.exports = router;