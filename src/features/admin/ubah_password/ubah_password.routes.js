const express = require('express');
const router = express.Router();

// ---> PERUBAHAN 1: Kita panggil juga ipKeyGenerator bawaan library-nya
const { rateLimit, ipKeyGenerator } = require('express-rate-limit'); 

const passwordController = require('./ubah_password.controller'); 
const authMiddleware = require('../../../core/services/auth.middleware'); 

// ==========================================
// 🛡️ LIMITER 1: KATA SANDI (Max 5x, 15 Menit)
// ==========================================
const passwordAttemptLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    keyGenerator: (req, res) => {
        return req.user ? `sandi_${req.user.id_user}` : ipKeyGenerator(req, res);
    },
    // Handler dinamis untuk menghitung sisa waktu
    handler: (req, res) => {
        const resetTime = req.rateLimit.resetTime; 
        const remainingMs = resetTime.getTime() - Date.now(); 

        const remainingMinutes = Math.floor(remainingMs / 1000 / 60);
        const remainingSeconds = Math.floor((remainingMs / 1000) % 60);

        let timeText = "";
        if (remainingMinutes > 0) timeText += `${remainingMinutes} menit `;
        if (remainingSeconds > 0) timeText += `${remainingSeconds} detik`;
        if (timeText === "") timeText = "beberapa saat";

        return res.status(429).json({ 
            success: false, 
            message: `Terlalu banyak percobaan. Silakan coba lagi dalam ${timeText.trim()}.` 
        });
    }
});

// ==========================================
// 🛡️ LIMITER 2: REQUEST OTP (Max 3x, 1 Jam)
// ==========================================
const otpRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 3, 
    keyGenerator: (req, res) => {
        // ---> PERUBAHAN 3: Sama seperti di atas
        return req.user ? `otp_${req.user.id_user}` : (req.body.email || ipKeyGenerator(req, res));
    },
    handler: (req, res) => {
        const resetTime = req.rateLimit.resetTime;
        const remainingMs = resetTime.getTime() - Date.now();

        const remainingMinutes = Math.floor(remainingMs / 1000 / 60);
        
        let timeText = `${remainingMinutes} menit`;
        if (remainingMinutes >= 60) timeText = "1 jam"; 

        return res.status(429).json({ 
            success: false, 
            message: `Batas permintaan OTP tercapai. Silakan coba lagi dalam ${timeText}.` 
        });
    }
});

// ==========================================
// RUTE VALIDASI (Pengecekan di awal halaman)
// ==========================================
router.post('/profile/verify-old-password', authMiddleware, passwordAttemptLimiter, passwordController.verifyOldPassword);

router.post('/profile/verify-otp', (req, res, next) => {
    if (req.headers.authorization) return authMiddleware(req, res, next);
    next();
}, passwordAttemptLimiter, passwordController.verifyOtpCode);


// ==========================================
// RUTE AKSI (Penyimpanan akhir)
// ==========================================
router.put('/profile/change-password-direct', authMiddleware, passwordController.changePasswordDirect);

router.post('/profile/request-otp', (req, res, next) => {
    if (req.headers.authorization) return authMiddleware(req, res, next);
    next();
}, otpRequestLimiter, passwordController.requestPasswordOtp);

router.put('/profile/change-password-otp', (req, res, next) => {
    if (req.headers.authorization) return authMiddleware(req, res, next);
    next();
}, passwordController.verifyOtpAndResetPassword);

module.exports = router;