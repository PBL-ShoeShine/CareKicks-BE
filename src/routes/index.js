const express = require("express");
const router = express.Router();

// 1. User routes
router.use("/user", require("../features/user/user.routes"));

// 2. Admin routes (Mencakup rute profile, antrean, inventaris, dll)
router.use("/admin", require("../features/admin"));

// --- TAMBAHAN RUTE UBAH PASSWORD ---
// Mengarahkan ke file ubah_password.routes.js yang ada di folder password
router.use("/admin", require("../features/admin/ubah_password/ubah_password.routes"));
// -----------------------------------

// 3. Auth routes (RUTE BARU: Untuk handle verifikasi email dari browser)
// Mengarah ke file auth.routes.js yang memproses token email 1 jam kamu
router.use("/auth", require("../features/auth/auth.routes"));

// 4. Customer routes 
router.use("/customer", require("../features/customer"));

module.exports = router;