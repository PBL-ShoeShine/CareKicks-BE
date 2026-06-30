const express = require("express");
const router = express.Router();
const multer = require("multer");

const authMiddleware = require("../../../core/services/auth.middleware");
const editProfileController = require("../edit_profile/edit_profile.controller");
const profileController = require("./profile.controller");

// ✅ Memory storage — file tidak disimpan ke disk, langsung pakai buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Maks 5MB
});

// =====================================================================
// RUTE: /api/v1/admin/profile
// =====================================================================

// 1. Ambil Data Profil
router.get(
  "/",
  authMiddleware,
  editProfileController.getProfile || profileController.getProfileAdmin
);

// 2. Simpan Perubahan Profil (Nama, No HP, Email)
router.put("/", authMiddleware, editProfileController.updateProfil);

// 3. ✅ FIX: POST, pakai multer, arahkan ke editProfileController
router.post(
  "/picture",
  authMiddleware,
  upload.single("image"),
  editProfileController.updateProfilePicture
);

// 4. Verifikasi Email dari link
router.get("/verify-email", editProfileController.verifyEmail);

// 5. Ganti Password
if (editProfileController.changePassword) {
  router.put(
    "/change-password",
    authMiddleware,
    editProfileController.changePassword
  );
}

module.exports = router;