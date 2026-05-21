const express = require("express");
const router = express.Router();

// 1. PATH MIDDLEWARE YANG BENAR (Dari file aslimu)
const authMiddleware = require("../../../core/services/auth.middleware");

// 2. PATH CONTROLLER YANG BENAR (Dari file aslimu)
const editProfileController = require("../edit_profile/edit_profile.controller");
const profileController = require("./profile.controller");

// =====================================================================
// RUTE: /api/v1/admin/profile
// =====================================================================

// 1. Ambil Data Profil (Mencegah profil kosong)
// Kita utamakan fungsi getProfile dari kode baru, kalau tidak ada fallback ke kode lama
router.get("/", authMiddleware, editProfileController.getProfile || profileController.getProfileAdmin);

// 2. Simpan Perubahan Profil (Nama, No HP) & Request Ganti Email
router.put("/", authMiddleware, editProfileController.updateProfil);

// 3. Ganti Foto Profil (Tetap menggunakan controller lamamu agar aman)
if (profileController && profileController.updateProfilePicture) {
    router.put("/picture", authMiddleware, profileController.updateProfilePicture);
}

// 4. Ganti Password
if (editProfileController.changePassword) {
    router.put("/change-password", authMiddleware, editProfileController.changePassword);
}

module.exports = router;