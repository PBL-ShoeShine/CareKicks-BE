const supabase = require('../../../core/db');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET;

exports.updateProfile = async (req, res) => {
  const id_user = req.body.id_user || 1; 
  const { nama, no_hp, email } = req.body;

  try {
    // 1. Ambil email lama dari Supabase
    const { data: user, error: errCek } = await supabase
      .from('users')
      .select('email')
      .eq('id_user', id_user)
      .single();

    if (errCek || !user) return res.status(404).json({ message: "User tidak ditemukan" });
    const currentEmail = user.email;

    // 2. Update nama dan no_hp di Supabase
    const { error: errUpdate } = await supabase
      .from('users')
      .update({ nama: nama, no_hp: no_hp })
      .eq('id_user', id_user);

    if (errUpdate) throw errUpdate;

    // 3. Jika email berubah, kirim verifikasi
    if (email && email !== currentEmail) {
      const token = jwt.sign({ id_user, email_baru: email }, JWT_SECRET, { expiresIn: '1h' });
      

      const verificationLink = `http://10.85.113.20:3000/api/v1/admin/profile/verify-email?token=${token}`; 

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'emailtesting@gmail.com', pass: 'password_app_gmail' } 
      });

      await transporter.sendMail({
        from: '"CareKicks" <emailtesting@gmail.com>',
        to: email, 
        subject: "Verifikasi Email Baru",
        html: `<p>Klik link ini untuk verifikasi email baru kamu:</p>
               <a href="${verificationLink}">Verifikasi Email</a>`
      });

      return res.status(200).json({ message: "Profil diperbarui! Cek email untuk verifikasi." });
    }

    return res.status(200).json({ message: "Profil berhasil diperbarui." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Token tidak ada!");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Update email utama di DB setelah verifikasi sukses
    await supabase
      .from('users')
      .update({ email: decoded.email_baru })
      .eq('id_user', decoded.id_user);

    return res.status(200).send("<h1>Email Berhasil Diperbarui! Silakan kembali ke aplikasi.</h1>");
  } catch (error) {
    return res.status(400).send("<h1>Link kedaluwarsa atau tidak valid!</h1>");
  }
};

exports.changePassword = async (req, res) => {
  const id_user = req.body.id_user || 1;
  const { old_password, new_password } = req.body;

  try {
    const { data: user, error: errCek } = await supabase
      .from('users')
      .select('password')
      .eq('id_user', id_user)
      .single();

    if (errCek || !user) return res.status(404).json({ message: "User tidak ditemukan" });

    // Pengecekan password lama
    if (old_password !== user.password) {
      return res.status(400).json({ message: "Kata sandi lama salah!" });
    }

    // Update ke password baru
    const { error: errUpdate } = await supabase
      .from('users')
      .update({ password: new_password })
      .eq('id_user', id_user);

    if (errUpdate) throw errUpdate;

    return res.status(200).json({ message: "Kata sandi berhasil diubah." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};