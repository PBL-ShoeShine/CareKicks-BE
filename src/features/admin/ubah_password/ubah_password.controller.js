const passwordService = require('./ubah_password.service'); 

// 1. UBAH LANGSUNG
const changePasswordDirect = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) return res.status(400).json({ success: false, message: "Semua field wajib diisi." });
        if (newPassword.length < 8) return res.status(400).json({ success: false, message: "Kata sandi baru minimal 8 karakter." });

        const message = await passwordService.changePasswordDirectService(req.user.id_user, oldPassword, newPassword);
        return res.status(200).json({ success: true, message });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// 2. REQUEST OTP
const requestPasswordOtp = async (req, res) => {
    try {
        const userId = req.user ? req.user.id_user : null;
        const message = await passwordService.requestOtpService(req.body.email, userId);
        return res.status(200).json({ success: true, message });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// 3. VERIFIKASI OTP & UBAH
const verifyOtpAndResetPassword = async (req, res) => {
    try {
        const userId = req.user ? req.user.id_user : null;
        const message = await passwordService.verifyOtpAndResetService(req.body.email, req.body.otpCode, req.body.newPassword, userId);
        return res.status(200).json({ success: true, message });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// FUNGSI BARU UNTUK VALIDASI (HALAMAN 1 & 2)
// ==========================================

// 4. CEK SANDI LAMA 
const verifyOldPassword = async (req, res) => {
    try {
        await passwordService.verifyOldPasswordService(req.user.id_user, req.body.oldPassword);
        return res.status(200).json({ success: true, message: "Kata sandi lama cocok." });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// 5. CEK KODE OTP
const verifyOtpCode = async (req, res) => {
    try {
        const userId = req.user ? req.user.id_user : null;
        await passwordService.verifyOtpCodeService(req.body.email, req.body.otpCode, userId);
        return res.status(200).json({ success: true, message: "Kode OTP valid." });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { 
    changePasswordDirect, 
    requestPasswordOtp, 
    verifyOtpAndResetPassword,
    verifyOldPassword,  
    verifyOtpCode      
};