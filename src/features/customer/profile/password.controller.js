const passwordService = require('./password.services');

const verifyOldPassword = async (req, res) => {
  try {
    const id_user = req.user?.id_user;
    const { old_password } = req.body; // Harus old_password (Snake Case)

    if (!id_user) return res.status(401).json({ success: false, message: 'Sesi tidak valid.' });
    if (!old_password) return res.status(400).json({ success: false, message: 'Password lama wajib diisi.' });

    const isValid = await passwordService.verifyOldPassword(id_user, old_password);
    if (!isValid) return res.status(400).json({ success: false, message: 'Password lama tidak sesuai.' });

    return res.status(200).json({ success: true, message: 'Password lama sesuai.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const changePasswordDirect = async (req, res) => {
  try {
    const id_user = req.user?.id_user;
    const { old_password, new_password } = req.body;

    if (!id_user) return res.status(401).json({ success: false, message: 'Sesi tidak valid.' });
    if (!old_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' });
    }

    await passwordService.changePasswordDirect(id_user, old_password, new_password);
    return res.status(200).json({ success: true, message: 'Password berhasil diubah.' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const requestPasswordOtp = async (req, res) => {
  try {
    const id_user = req.user?.id_user; // Ambil ID dari token
    if (!id_user) return res.status(401).json({ success: false, message: 'Sesi tidak valid.' });

    await passwordService.requestPasswordOtp(id_user);
    return res.status(200).json({ success: true, message: 'Kode OTP telah dikirim ke email Anda.' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const verifyOtpCode = async (req, res) => {
  try {
    const id_user = req.user?.id_user;
    const { otp } = req.body;

    if (!id_user) return res.status(401).json({ success: false, message: 'Sesi tidak valid.' });
    if (!otp) return res.status(400).json({ success: false, message: 'Email dan OTP wajib diisi.' });

    const isValid = await passwordService.verifyOtpCode(id_user, otp);
    if (!isValid) return res.status(400).json({ success: false, message: 'Kode OTP tidak valid atau kedaluwarsa.' });

    return res.status(200).json({ success: true, message: 'OTP valid.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const changePasswordOtp = async (req, res) => {
  try {
    const id_user = req.user?.id_user;
    const { otp, new_password } = req.body;
    
    if (!id_user) return res.status(401).json({ success: false, message: 'Sesi tidak valid.' });
    if (!otp || !new_password) {
      return res.status(400).json({ success: false, message: 'Email, OTP, dan password baru wajib diisi.' });
    }

    await passwordService.changePasswordOtp(id_user, otp, new_password);
    return res.status(200).json({ success: true, message: 'Password berhasil diatur ulang.' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  verifyOldPassword,
  changePasswordDirect,
  requestPasswordOtp,
  verifyOtpCode,
  changePasswordOtp
};