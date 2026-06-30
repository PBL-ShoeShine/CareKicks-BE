const bcrypt = require('bcrypt');
const supabase = require('../../core/config/supabase'); 
// Sesuaikan letak path 'mailer' milikmu di bawah ini:
const { realMailer, dummyMailer } = require('../../core/config/mailer');

// =========================================================================
// HELPER: PENGIRIMAN EMAIL OTP (DUAL-MODE)
// =========================================================================
const sendOtpEmail = async (targetEmail, otpCode) => {
    const mailOptions = {
        from: '"CareKicks Admin" <admin@carekicks.com>',
        to: targetEmail,
        subject: 'Kode OTP Lupa Password - CareKicks',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eeeeee; border-radius: 10px;">
            <h2 style="color: #0087FF; text-align: center;">Reset Kata Sandi</h2>
            <p>Halo,</p>
            <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun CareKicks Anda. Berikut adalah kode rahasia OTP Anda:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="background-color: #f8f9fa; color: #0087FF; padding: 15px 30px; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 6px; border: 2px dashed #0087FF;">
                ${otpCode}
              </span>
            </div>
            <p style="color: red; font-size: 13px; text-align: center;">Kode ini akan kedaluwarsa dalam <strong>15 Menit</strong>. Jangan berikan kode ini kepada siapa pun!</p>
          </div>
        `,
    };

    // Filter Auto-Pilot (Mailtrap untuk email .com / test, Gmail untuk email asli)
    let activeMailer;
    if (targetEmail.endsWith('@mail.com') || targetEmail.endsWith('@test.com')) {
        console.log(`🟡 [TESTING] Mengirim OTP Reset Password ke ${targetEmail} via Mailtrap`);
        activeMailer = dummyMailer;
    } else {
        console.log(`🟢 [REAL] Mengirim OTP Reset Password ke ${targetEmail} via Gmail`);
        activeMailer = realMailer;
    }

    await activeMailer.sendMail(mailOptions);
};

// =========================================================================
// CONTROLLER UTAMA
// =========================================================================
const forgotPasswordController = {

    // 1. REQUEST OTP
    requestOtp: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ success: false, message: "Email wajib diisi." });

            // Cek apakah email terdaftar di database
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id_user')
                .eq('email', email.trim())
                .single();

            if (userError || !user) {
                return res.status(404).json({ success: false, message: "Email tidak terdaftar di sistem." });
            }

            // Generate OTP Acak 6 Digit (contoh: 849201)
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Set batas waktu kedaluwarsa: 15 menit dari sekarang
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

            // Simpan OTP ke database
            const { error: updateError } = await supabase
                .from('users')
                .update({ 
                    otp_code: otpCode, 
                    otp_expires_at: expiresAt 
                })
                .eq('id_user', user.id_user);

            if (updateError) throw new Error("Gagal menyimpan OTP ke database.");

            // Eksekusi pengiriman email
            await sendOtpEmail(email.trim(), otpCode);

            return res.status(200).json({ 
                success: true, 
                message: "Kode OTP berhasil dikirim ke email Anda." 
            });

        } catch (error) {
            console.error("Error requestOtp:", error);
            return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
        }
    },

    // 2. VERIFIKASI OTP
    verifyOtp: async (req, res) => {
        try {
            const { email, otpCode } = req.body;
            if (!email || !otpCode) return res.status(400).json({ success: false, message: "Email dan OTP wajib diisi." });

            const { data: user, error } = await supabase
                .from('users')
                .select('otp_code, otp_expires_at')
                .eq('email', email.trim())
                .single();

            if (error || !user) return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });

            // Pengecekan kecocokan kode
            if (user.otp_code !== otpCode.trim()) {
                return res.status(400).json({ success: false, message: "Kode OTP salah." });
            }

            // Pengecekan waktu kedaluwarsa (Fix Timezone dengan 'Z')
            const now = new Date();
            let expireString = user.otp_expires_at;
            if (!expireString.endsWith('Z')) expireString += 'Z'; 
            
            if (now > new Date(expireString)) {
                return res.status(400).json({ success: false, message: "Kode OTP sudah kedaluwarsa. Silakan minta kode baru." });
            }

            // Jika sukses, kita biarkan OTP tetap di database sampai user benar-benar mengubah passwordnya
            return res.status(200).json({ success: true, message: "Kode OTP valid." });

        } catch (error) {
            console.error("Error verifyOtp:", error);
            return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
        }
    },

    // 3. RESET PASSWORD BARU
    resetPassword: async (req, res) => {
        try {
            const { email, otpCode, newPassword } = req.body;
            if (!email || !otpCode || !newPassword) return res.status(400).json({ success: false, message: "Data tidak lengkap." });

            // VALIDASI ULANG: Pastikan OTP belum diakali oleh hacker
            const { data: user, error } = await supabase
                .from('users')
                .select('id_user, otp_code, otp_expires_at')
                .eq('email', email.trim())
                .single();

            if (error || !user || user.otp_code !== otpCode.trim()) {
                return res.status(400).json({ success: false, message: "Permintaan tidak valid. Kode OTP salah." });
            }

            // Cek kedaluwarsa lagi
            const now = new Date();
            let expireString = user.otp_expires_at;
            if (!expireString.endsWith('Z')) expireString += 'Z';
            if (now > new Date(expireString)) return res.status(400).json({ success: false, message: "Kode OTP sudah kedaluwarsa." });

            // Enkripsi (Hash) password baru dengan tingkat keamanan 10 (standar industri)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update password baru & "SAPU BERSIH" jejak OTP dari database
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    password: hashedPassword,
                    otp_code: null,
                    otp_expires_at: null
                })
                .eq('id_user', user.id_user);

            if (updateError) throw updateError;

            return res.status(200).json({ success: true, message: "Kata sandi berhasil direset! Silakan login." });

        } catch (error) {
            console.error("Error resetPassword:", error);
            return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
        }
    }
};

module.exports = forgotPasswordController;