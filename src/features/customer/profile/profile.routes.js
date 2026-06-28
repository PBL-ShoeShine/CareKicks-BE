const express = require("express");
const router = express.Router();
const multer = require("multer");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const profileController = require("./profile.controller");
const passwordController = require("./password.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

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

// =========================================================================
// RATE LIMITER — percobaan password (5x per 15 menit)
// =========================================================================
const passwordAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req, res) =>
    req.user ? `cust_sandi_${req.user.id_user}` : ipKeyGenerator(req, res),
  handler: (req, res) => {
    const remainingMs = req.rateLimit.resetTime.getTime() - Date.now();
    const min = Math.floor(remainingMs / 60000);
    const sec = Math.floor((remainingMs % 60000) / 1000);
    const timeText = min > 0 ? `${min} menit ${sec} detik` : `${sec} detik`;
    return res.status(429).json({
      success: false,
      message: `Terlalu banyak percobaan. Coba lagi dalam ${timeText}.`,
    });
  },
});

// =========================================================================
// RATE LIMITER — request OTP (3x per jam)
// =========================================================================
const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req, res) =>
    req.user ? `cust_otp_${req.user.id_user}` : ipKeyGenerator(req, res),
  handler: (req, res) => {
    const remainingMs = req.rateLimit.resetTime.getTime() - Date.now();
    const min = Math.floor(remainingMs / 60000);
    return res.status(429).json({
      success: false,
      message: `Batas permintaan OTP tercapai. Coba lagi dalam ${min >= 60 ? "1 jam" : `${min} menit`}.`,
    });
  },
});

// =========================================================================
// PROFILE ROUTES
// =========================================================================
router.get("/", authMiddleware, profileController.getProfile);
router.put("/", authMiddleware, profileController.updateProfile);
router.put(
  "/picture",
  authMiddleware,
  upload.single("image"),
  profileController.updateProfilePicture,
);
router.post(
  "/request-email-change",
  authMiddleware,
  profileController.requestEmailChange,
);
router.put(
  "/phone",
  authMiddleware,
  passwordAttemptLimiter,
  profileController.updateNoHp,
);

// =========================================================================
// PASSWORD ROUTES
// FIX: semua endpoint password wajib pakai authMiddleware
// (sebelumnya /request-otp dan /change-password-otp tidak ada authMiddleware)
// =========================================================================
router.post(
  "/verify-old-password",
  authMiddleware,
  passwordAttemptLimiter,
  passwordController.verifyOldPassword,
);
router.put(
  "/change-password-direct",
  authMiddleware,
  passwordController.changePasswordDirect,
);
router.post(
  "/request-otp",
  authMiddleware,
  otpRequestLimiter,
  passwordController.requestPasswordOtp,
); // ✅ FIX: tambah authMiddleware
router.post(
  "/verify-otp",
  authMiddleware,
  passwordAttemptLimiter,
  passwordController.verifyOtpCode,
);
router.put(
  "/change-password-otp",
  authMiddleware,
  passwordController.changePasswordOtp,
); // ✅ FIX: tambah authMiddleware

module.exports = router;
