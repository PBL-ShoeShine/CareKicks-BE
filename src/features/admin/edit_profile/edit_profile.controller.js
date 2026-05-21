const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const supabase = require('../../../core/config/supabase'); 

// =========================================================================
// HELPER: PENGIRIMAN EMAIL VIA NODEMAILER (MAILTRAP)
// =========================================================================
const sendVerificationEmail = async (targetEmail, token) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
    port: parseInt(process.env.SMTP_PORT || "587"), 
    auth: {
      user: process.env.SMTP_USER, 
      pass: process.env.SMTP_PASS, 
    },
  });

  const verificationUrl = `http://localhost:3000/api/v1/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: '"CareKicks Admin" <admin@carekicks.com>',
    to: targetEmail,
    subject: 'Verifikasi Email Baru Anda - CareKicks',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eeeeee; border-radius: 10px;">
        <h2 style="color: #0087FF; text-align: center;">Verifikasi Email Baru</h2>
        <p>Halo,</p>
        <p>Kami menerima permintaan perubahan alamat email untuk akun CareKicks Anda. Tautan ini berlaku selama <strong>1 jam</strong>. Silakan klik tombol di bawah ini untuk memverifikasi alamat email baru Anda:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #0087FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Verifikasi Email Sekarang
          </a>
        </div>
        <p style="color: #555555; font-size: 13px;">Jika tombol tidak berfungsi, salin tautan di bawah ini:</p>
        <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 12px; word-break: break-all; color: #0087FF;">
          ${verificationUrl}
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// =========================================================================
// CONTROLLER UTAMA
// =========================================================================
const editProfileController = {

  // -------------------------------------------------------------------
  // 1. GET PROFIL
  // -------------------------------------------------------------------
  getProfile: async (req, res) => {
    try {
      const id_user = req.user?.id_user || req.user?.id;
      
      if (!id_user) {
        return res.status(401).json({ success: false, message: "Sesi tidak valid." });
      }

      // KEMBALI MENGAMBIL DATA DARI TABEL 'users'
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id_user', id_user)
        .single();

      if (error || !userData) {
        return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
      }

      return res.status(200).json({
        success: true,
        data: userData
      });
    } catch (error) {
      console.error("Error getProfile:", error);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
  },

  // -------------------------------------------------------------------
  // 2. UPDATE PROFIL (Kirim Email & Update Nama/No HP)
  // -------------------------------------------------------------------
  updateProfil: async (req, res) => {
    try {
      const id_user = req.user?.id_user || req.user?.id; 
      const { nama, noHp, email, password, isRequestEmailOnly } = req.body;

      if (!id_user) {
        return res.status(401).json({ success: false, message: "Sesi tidak valid atau kedaluwarsa." });
      }

      // KEMBALI MENGGUNAKAN TABEL 'users'
      const targetTable = 'users';

      if (isRequestEmailOnly === true || (email && !nama && !noHp)) {
        
        const { data: existingUser } = await supabase.from(targetTable).select('id_user').eq('email', email.trim()).single();
        if (existingUser) { 
            return res.status(400).json({ success: false, message: "Email sudah digunakan oleh akun lain." }); 
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); 

        const { error: updateTokenError } = await supabase.from(targetTable).update({
          temp_email: email.trim(),
          email_verification_token: token,
          email_token_expires_at: expiresAt.toISOString()
        }).eq('id_user', id_user); 

        if(updateTokenError) throw new Error("Gagal menyimpan token: " + updateTokenError.message);

        await sendVerificationEmail(email.trim(), token);

        return res.status(200).json({
          success: true,
          message: "Tautan verifikasi telah dikirim ke email baru! Berlaku selama 1 jam.",
          isWaitingVerification: true 
        });
      }

      const { data: userData, error: dbError } = await supabase.from(targetTable).select('*').eq('id_user', id_user).single();
      
      if(dbError || !userData) {
          return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
      }

      // VALIDASI KATA SANDI 
      if (noHp) {
        if (!password) {
          return res.status(400).json({ success: false, message: "Kata sandi diperlukan." });
        }

        const isPasswordMatch = await bcrypt.compare(password, userData.password);
        
        if (!isPasswordMatch) {
          return res.status(400).json({ success: false, message: "Kata sandi salah." });
        }
      }
      
      const updateData = {};
      if (nama) updateData.nama = nama;
      if (noHp) updateData.no_hp = noHp;

      if(Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase.from(targetTable).update(updateData).eq('id_user', id_user);
          if(updateError) throw updateError;
      }

      return res.status(200).json({
        success: true,
        message: "Perubahan profil berhasil disimpan.",
      });

    } catch (error) {
      console.error("Error updateProfil:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // -------------------------------------------------------------------
  // 3. VERIFIKASI EMAIL
  // -------------------------------------------------------------------
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.query;

      if (!token) return res.status(400).send("Tautan tidak valid.");

      const { data: user, error: findError } = await supabase
        .from('users') // KEMBALI KE TABEL users
        .select('*')
        .eq('email_verification_token', token)
        .single();

      if (!user || findError) return res.status(400).send("Tautan tidak valid atau sudah digunakan.");

      const now = new Date();
      
      // FIX ZONA WAKTU: Tambahkan 'Z' agar Node.js tahu ini adalah waktu UTC
      let expireString = user.email_token_expires_at;
      if (!expireString.endsWith('Z')) {
          expireString += 'Z';
      }
      const expiresAt = new Date(expireString);
      
      // Cek kedaluwarsa
      if (now > expiresAt) return res.status(400).send("Tautan sudah kedaluwarsa.");

      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: user.temp_email,
          temp_email: null,
          email_verification_token: null,
          email_token_expires_at: null
        })
        .eq('id_user', user.id_user);

      if (updateError) return res.status(500).send("Gagal memverifikasi email.");

      return res.send("<h3>Berhasil!</h3><p>Email akun Anda telah diperbarui. Silakan kembali ke aplikasi CareKicks.</p>");
    } catch (error) {
      console.error("Error verifyEmail:", error);
      return res.status(500).send("Terjadi kesalahan sistem saat memverifikasi email.");
    }
  },

  changePassword: async (req, res) => {}
};

module.exports = editProfileController;