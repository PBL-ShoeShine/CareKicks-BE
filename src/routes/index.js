const express = require("express");
const router = express.Router();

// 1. User routes
router.use("/user", require("../features/user/user.routes"));

// 2. Admin routes (Mencakup rute profile, antrean, inventaris, dll)
router.use("/admin", require("../features/admin"));

// 3. Auth routes (RUTE BARU: Untuk handle verifikasi email dari browser)
// Mengarah ke file auth.routes.js yang memproses token email 1 jam kamu
router.use("/auth", require("../features/auth/auth.routes"));

module.exports = router;