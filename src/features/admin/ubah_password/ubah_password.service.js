const bcrypt = require('bcrypt');
const supabase = require('../../../core/config/supabase');

// ---> Import kedua mesin email <---
const { realMailer, dummyMailer } = require('../../../core/config/mailer');

// 1. Logika Ubah Sandi Langsung
const changePasswordDirectService = async (id_user, oldPassword, newPassword) => {
    const { data: user, error: findError } = await supabase
        .from('users')
        .select('password')
        .eq('id_user', id_user)
        .single();

    if (findError || !user) throw new Error("User tidak ditemukan.");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Kata sandi lama Anda salah.");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id_user', id_user);
    
    if (updateError) throw updateError;
    return "Kata sandi berhasil diperbarui.";
};

// 2. Logika Minta Kode OTP
const requestOtpService = async (email, userId) => {
    let userEmail = email;
    
    if (userId) {
        const { data: user } = await supabase
            .from('users')
            .select('email')
            .eq('id_user', userId)
            .single();
        if (user) userEmail = user.email;
    }
    
    if (!userEmail) throw new Error("Email tidak ditemukan.");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); 

    const { error: dbError } = await supabase
        .from('users')
        .update({ otp_code: otp, otp_expires_at: expiresAt })
        .eq('email', userEmail);
        
    if (dbError) throw dbError;

    // ---> Logika Filter Otomatis (Auto-Pilot) <---
    let activeMailer;
    
    // Mengecek apakah email berakhiran @mail.com ATAU @test.com
    if (userEmail.endsWith('@mail.com') || userEmail.endsWith('@test.com')) {
        console.log(`🟡 [TESTING] Mengirim OTP ke ${userEmail} via Mailtrap`);
        activeMailer = dummyMailer;
    } else {
        console.log(`🟢 [REAL] Mengirim OTP ke ${userEmail} via Gmail`);
        activeMailer = realMailer;
    }

    // Kirim Email menggunakan mesin yang terpilih
    await activeMailer.sendMail({
        from: '"CareKicks Security" <security.carekicks@gmail.com>',
        to: userEmail,
        subject: 'Kode OTP Reset Kata Sandi Account Anda',
        html: `<h3>Kode OTP Anda adalah: <b style="color:#4A90E2; font-size:24px;">${otp}</b></h3>
               <p>Kode ini hanya berlaku selama 5 menit. Kode ini bersifat rahasia, mohon jangan bagikan kode ini kepada siapa pun.</p>`
    });

    return "Kode OTP berhasil dikirim ke email.";
};

// 3. Logika Verifikasi & Reset
const verifyOtpAndResetService = async (email, otpCode, newPassword, userId) => {
    let userEmail = email;
    if (userId) {
        const { data: user } = await supabase.from('users').select('email').eq('id_user', userId).single();
        if (user) userEmail = user.email;
    }
    
    if (!userEmail || !otpCode || !newPassword) throw new Error("Data tidak lengkap.");

    const { data: user, error: findError } = await supabase
        .from('users')
        .select('otp_code, otp_expires_at')
        .eq('email', userEmail)
        .single();

    if (findError || !user || user.otp_code !== otpCode) throw new Error("Kode OTP salah atau tidak valid.");
    if (new Date() > new Date(user.otp_expires_at)) throw new Error("Kode OTP telah kedaluwarsa.");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const { error: updateError } = await supabase
        .from('users')
        .update({ 
            password: hashedPassword, 
            otp_code: null, 
            otp_expires_at: null 
        })
        .eq('email', userEmail);

    if (updateError) throw updateError;
    return "Kata sandi Anda berhasil diperbarui!";
};


// ========================================================
// FITUR TAMBAHAN: VERIFIKASI SEBELUM GANTI SANDI
// ========================================================

// 4. Cek Sandi Lama (Tanpa mengganti sandi)
const verifyOldPasswordService = async (id_user, oldPassword) => {
    const { data: user, error } = await supabase
        .from('users')
        .select('password')
        .eq('id_user', id_user)
        .single();
        
    if (error || !user) throw new Error("User tidak ditemukan.");
    
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Kata sandi lama Anda salah.");
    
    return true; // Lolos verifikasi
};

// 5. Cek Kode OTP (Tanpa mengganti sandi)
const verifyOtpCodeService = async (email, otpCode, userId) => {
    let userEmail = email;
    if (userId) {
        const { data: user } = await supabase
            .from('users')
            .select('email')
            .eq('id_user', userId)
            .single();
        if (user) userEmail = user.email;
    }
    
    const { data: user, error } = await supabase
        .from('users')
        .select('otp_code, otp_expires_at')
        .eq('email', userEmail)
        .single();
    
    if (error || !user || user.otp_code !== otpCode) throw new Error("Kode OTP salah atau tidak valid.");
    if (new Date() > new Date(user.otp_expires_at)) throw new Error("Kode OTP telah kedaluwarsa.");
    
    return true; // Lolos verifikasi
};


module.exports = { 
    changePasswordDirectService, 
    requestOtpService, 
    verifyOtpAndResetService,
    verifyOldPasswordService, 
    verifyOtpCodeService      
};