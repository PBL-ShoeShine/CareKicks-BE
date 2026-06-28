const crypto = require('crypto');
const bcrypt = require('bcrypt');
const supabase = require('../../../core/config/supabase');

const { realMailer, dummyMailer } = require('../../../core/config/mailer');

// =========================================================================
// HELPER: PENGIRIMAN EMAIL AUTO-PILOT (GMAIL & MAILTRAP)
// =========================================================================
const sendVerificationEmail = async (targetEmail, token) => {
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
      </div>
    `,
  };

  let activeMailer;
  if (targetEmail.endsWith('@mail.com') || targetEmail.endsWith('@test.com')) {
    console.log(`🟡 [TESTING] Mengirim Link Verifikasi ke ${targetEmail} via Mailtrap`);
    activeMailer = dummyMailer;
  } else {
    console.log(`🟢 [REAL] Mengirim Link Verifikasi ke ${targetEmail} via Gmail`);
    activeMailer = realMailer;
  }

  await activeMailer.sendMail(mailOptions);
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
      if (!id_user) return res.status(401).json({ success: false, message: "Sesi tidak valid." });

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id_user', id_user)
        .single();

      if (error || !userData) return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });

      return res.status(200).json({ success: true, data: userData });
    } catch (error) {
      console.error("Error getProfile:", error);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
  },

  // -------------------------------------------------------------------
  // 2. UPDATE PROFIL (Nama, No HP, & Email)
  // -------------------------------------------------------------------
  updateProfil: async (req, res) => {
    try {
      const id_user = req.user?.id_user || req.user?.id;
      const { nama, noHp, email, password, isRequestEmailOnly } = req.body;

      if (!id_user) return res.status(401).json({ success: false, message: "Sesi tidak valid." });

      if (isRequestEmailOnly === true || (email && !nama && !noHp)) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id_user')
          .eq('email', email.trim())
          .single();

        if (existingUser) return res.status(400).json({ success: false, message: "Email sudah digunakan oleh akun lain." });

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000);

        const { error: updateTokenError } = await supabase.from('users').update({
          temp_email: email.trim(),
          email_verification_token: token,
          email_token_expires_at: expiresAt.toISOString()
        }).eq('id_user', id_user);

        if (updateTokenError) throw new Error("Gagal menyimpan token.");

        await sendVerificationEmail(email.trim(), token);

        return res.status(200).json({
          success: true,
          message: "Tautan verifikasi telah dikirim ke email baru! Berlaku selama 1 jam.",
          isWaitingVerification: true
        });
      }

      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id_user', id_user)
        .single();

      if (dbError || !userData) return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });

      if (noHp && password) {
        const isPasswordMatch = await bcrypt.compare(password, userData.password);
        if (!isPasswordMatch) return res.status(400).json({ success: false, message: "Kata sandi salah." });
      }

      const updateData = {};
      if (nama) updateData.nama = nama;
      if (noHp) updateData.no_hp = noHp;

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id_user', id_user);
        if (updateError) throw updateError;
      }

      // Sync nama ke staff_profile jika user adalah staff
      if (nama) {
        await supabase
          .from('staff_profile')
          .update({ nama })
          .eq('id_user', id_user);
      }

      return res.status(200).json({ success: true, message: "Perubahan profil berhasil disimpan." });

    } catch (error) {
      console.error("Error updateProfil:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // -------------------------------------------------------------------
  // 3. VERIFIKASI EMAIL DARI LINK
  // -------------------------------------------------------------------
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) return res.status(400).send("Tautan tidak valid.");

      const { data: user, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email_verification_token', token)
        .single();

      if (!user || findError) return res.status(400).send("Tautan tidak valid atau sudah digunakan.");

      const now = new Date();
      let expireString = user.email_token_expires_at;
      if (!expireString.endsWith('Z')) expireString += 'Z';

      if (now > new Date(expireString)) return res.status(400).send("Tautan sudah kedaluwarsa.");

      const { error: updateError } = await supabase.from('users').update({
        email: user.temp_email,
        temp_email: null,
        email_verification_token: null,
        email_token_expires_at: null
      }).eq('id_user', user.id_user);

      if (updateError) return res.status(500).send("Gagal memverifikasi email.");

      return res.send("<h3>Berhasil!</h3><p>Email akun Anda telah diperbarui. Silakan kembali ke aplikasi CareKicks.</p>");
    } catch (error) {
      console.error("Error verifyEmail:", error);
      return res.status(500).send("Terjadi kesalahan sistem saat memverifikasi email.");
    }
  },

  // -------------------------------------------------------------------
  // 4. UPLOAD FOTO PROFIL KE SUPABASE STORAGE
  // -------------------------------------------------------------------
  updateProfilePicture: async (req, res) => {
    try {
      const id_user = req.user?.id_user || req.user?.id;
      if (!id_user) return res.status(401).json({ success: false, message: "Sesi tidak valid." });

      if (!req.file) {
        return res.status(400).json({ success: false, message: "Tidak ada file gambar yang dikirim dari aplikasi." });
      }

      const file = req.file;
      const fileExt = file.originalname.split('.').pop() || 'jpg';
      const filePath = `profile/${id_user}/${Date.now()}.${fileExt}`;

      // ✅ FIX: Pakai file.buffer (memory storage), hapus fs.readFileSync
      const { error: uploadError } = await supabase.storage
        .from('services') // ✅ Bucket 'services' sesuai URL yang sudah berjalan
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        throw new Error("Gagal mengunggah gambar: " + uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from('services')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // ✅ FIX: Update kolom path_gambar (bukan foto_profil)
      const { error: updateDbError } = await supabase
        .from('users')
        .update({ path_gambar: publicUrl })
        .eq('id_user', id_user);

      if (updateDbError) throw new Error("Gagal menyimpan URL ke database: " + updateDbError.message);

      return res.status(200).json({
        success: true,
        message: "Foto profil berhasil diperbarui.",
        url: publicUrl,
      });

    } catch (error) {
      console.error("Error upload foto:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = editProfileController;