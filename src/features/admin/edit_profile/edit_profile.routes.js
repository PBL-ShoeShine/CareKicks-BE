const express = require("express");
const router = express.Router();
const editProfileController = require("./edit_profile.controller");

// Route untuk update nama & no_hp, serta trigger email baru (PUT)
router.put("/update", editProfileController.updateProfile);

// Route untuk verifikasi tautan yang diklik dari email (GET)
router.get("/verify-email", editProfileController.verifyEmail);

// Route untuk ubah kata sandi (PUT)
router.put("/change-password", editProfileController.changePassword);

module.exports = router;