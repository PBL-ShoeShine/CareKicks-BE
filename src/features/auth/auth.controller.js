// const supabase = require('../../../core/config/supabase'); // Sesuaikan dengan path config Supabase kamu

const authController = {
  
  /**
   * Memproses Konfirmasi Klik Link Verifikasi Email dari Mailtrap
   */
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.query; // Menangkap ?token=... dari URL browser

      console.log("=== MEMPROSES VERIFIKASI EMAIL DARI BROWSER ===");
      console.log("Token masuk:", token);

      if (!token) {
        return res.status(400).send(`
          <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
            <h1 style="color: #dc3545;">❌ Verifikasi Gagal</h1>
            <p style="font-size: 16px; color: #333;">Token verifikasi tidak valid atau tidak ditemukan.</p>
          </div>
        `);
      }

      // 1. Ambil data user dari Supabase yang token verifikasinya cocok
      // const { data: user, error } = await supabase
      //   .from('users')
      //   .select('*')
      //   .eq('email_verification_token', token)
      //   .single();

      // JIKA USER TIDAK DITEMUKAN / ERROR
      // if (error || !user) {
      //   return res.status(404).send(`
      //     <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
      //       <h1 style="color: #dc3545;">❌ Verifikasi Gagal</h1>
      //       <p style="font-size: 16px; color: #333;">Tautan tidak valid, atau email ini sudah pernah diverifikasi sebelumnya.</p>
      //     </div>
      //   `);
      // }

      // 2. Periksa apakah tokennya sudah expired (Lebih dari 1 jam)
      // const now = new Date();
      // if (new Date(user.email_token_expires_at) < now) {
      //   return res.send(`
      //     <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
      //       <h1 style="color: #ffc107;">⚠️ Tautan Kedaluwarsa</h1>
      //       <p style="font-size: 16px; color: #333;">Masa berlaku tautan (1 jam) telah habis.</p>
      //       <p style="color: #777;">Silakan lakukan permintaan ubah email kembali dari aplikasi CareKicks.</p>
      //     </div>
      //   `);
      // }

      // 3. Pindahkan temp_email ke kolom email utama, lalu bersihkan seluruh data token sementara
      // await supabase
      //   .from('users')
      //   .update({
      //     email: user.temp_email, // Email baru resmi dipindahkan ke kolom utama
      //     temp_email: null,       // Hapus email cadangan sementara
      //     email_verification_token: null,
      //     email_token_expires_at: null
      //   })
      //   .eq('id_user', user.id_user);

      // 4. Respons tampilan sukses halaman web HTML yang estetik ke browser user
      return res.send(`
        <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 80px; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eef2f5;">
            <h1 style="color: #0087FF; font-size: 48px; margin-bottom: 10px;">控制</h1>
            <h2 style="color: #28a745; margin-top: 0;">✅ Verifikasi Berhasil!</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Alamat email akun <strong>CareKicks</strong> Anda telah resmi diperbarui di database.</p>
            <p style="color: #777; font-size: 14px; margin-top: 25px;">Silakan buka kembali atau refresh aplikasi Flutter kamu untuk melihat pembaruan data profil.</p>
          </div>
        </div>
      `);

    } catch (error) {
      console.error("Error pada fungsi verifyEmail:", error);
      return res.status(500).send("<h1>Error</h1><p>Terjadi kesalahan internal pada server.</p>");
    }
  }
};

module.exports = authController;