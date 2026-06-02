const express = require("express");
const router = express.Router();

// PATH YANG BENAR SESUAI STRUKTUR FOLDERMU:
// Mundur ke features (../) -> masuk ke admin -> masuk ke edit_profile
const editProfileController = require("../admin/edit_profile/edit_profile.controller");

// =====================================================================
// RUTE VERIFIKASI EMAIL (Diakses dari link di Email)
// TIDAK BOLEH pakai authMiddleware karena dipanggil via browser biasa
// =====================================================================
router.get("/verify-email", editProfileController.verifyEmail);

module.exports = router;