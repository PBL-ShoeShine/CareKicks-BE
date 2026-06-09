const supabase = require('../../../core/config/supabase');
const bcrypt = require('bcrypt');
const { realMailer, dummyMailer } = require('../../../core/config/mailer'); // ✅ Import konfigurasi Mailer

// =========================================================================
// FUNGSI HELPER: Kirim Email OTP
// =========================================================================
const sendOtpEmail = async (targetEmail, otpCode) => {
  const mailOptions = {
    from: '"CareKicks Support" <security.carekicks@gmail.com>',
    to: targetEmail,
    subject: 'Kode OTP Pemulihan Kata Sandi - CareKicks',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eeeeee; border-radius: 10px;">
        <h2 style="color: #0087FF; text-align: center;">Pemulihan Kata Sandi</h2>
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun CareKicks Anda. Berikut adalah kode OTP Anda:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #f4f4f4; color: #333; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #777; font-size: 14px;">Kode ini hanya berlaku selama <strong>15 menit</strong>. Jangan berikan kode ini kepada siapa pun untuk alasan keamanan.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">Jika Anda tidak meminta kode OTP ini, silakan abaikan email ini.</p>
      </div>
    `,
  };

  // Dual-mode Mailer: Kalau pakai @mail.com/@test.com masuk Mailtrap, selain itu masuk Gmail asli
  const activeMailer =
    targetEmail.endsWith('@mail.com') || targetEmail.endsWith('@test.com')
      ? dummyMailer
      : realMailer;

  await activeMailer.sendMail(mailOptions);
};

// =========================================================================
// SERVICES
// =========================================================================
const verifyOldPassword = async (id_user, oldPassword) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('password')
    .eq('id_user', id_user)
    .single();

  if (error || !user) throw new Error('Pengguna tidak ditemukan.');
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  return isMatch;
};

const changePasswordDirect = async (id_user, oldPassword, newPassword) => {
  const isMatch = await verifyOldPassword(id_user, oldPassword);
  if (!isMatch) throw new Error('Password lama tidak sesuai.');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const { error } = await supabase
    .from('users')
    .update({ password: hashedPassword })
    .eq('id_user', id_user);

  if (error) throw new Error('Gagal memperbarui password di database.');
  return true;
};

const requestPasswordOtp = async (id_user) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id_user, nama, email')
    .eq('id_user', id_user)
    .single();

  if (error || !user) throw new Error('Pengguna tidak ditemukan.');

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiredAt = new Date();
  expiredAt.setMinutes(expiredAt.getMinutes() + 15);

  const { error: updateError } = await supabase
    .from('users')
    .update({
      otp_code: otpCode,
      otp_expires_at: expiredAt.toISOString()
    })
    .eq('id_user', id_user);

  if (updateError) throw new Error('Gagal membuat permintaan OTP.');

  // ✅ FIX: Panggil fungsi pengirim email (Mailtrap / Gmail)
  await sendOtpEmail(user.email, otpCode);

  console.log(`[TEST OTP] Kode OTP untuk ${user.email} adalah: ${otpCode}`);
  return true;
};

const verifyOtpCode = async (id_user, otp) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('otp_code, otp_expires_at')
    .eq('id_user', id_user)
    .single();

  if (error || !user) throw new Error('Pengguna tidak ditemukan.');
  if (!user.otp_code || new Date() > new Date(user.otp_expires_at)) return false;

  return user.otp_code === otp;
};

const changePasswordOtp = async (id_user, otp, newPassword) => {
  const isValid = await verifyOtpCode(id_user, otp);
  if (!isValid) throw new Error('Kode OTP tidak valid atau telah kedaluwarsa.');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const { error } = await supabase
    .from('users')
    .update({
      password: hashedPassword,
      otp_code: null,
      otp_expires_at: null
    })
    .eq('id_user', id_user);

  if (error) throw new Error('Gagal mereset password.');
  return true;
};

module.exports = {
  verifyOldPassword,
  changePasswordDirect,
  requestPasswordOtp,
  verifyOtpCode,
  changePasswordOtp
};