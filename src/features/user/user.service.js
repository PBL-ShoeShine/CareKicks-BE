const bcrypt = require("bcrypt");
const supabase = require("../../core/config/supabase");
const jwtService = require("../../core/services/jwt.service");
const { realMailer, dummyMailer } = require("../../core/config/mailer");

const PROFILE_BUCKET = "services";
const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024;

const getStoragePathFromPublicUrl = (publicUrl) => {
  if (!publicUrl) return null;
  const marker = `/storage/v1/object/public/${PROFILE_BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex !== -1) {
    return decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
  }
  if (publicUrl.startsWith("profile/")) return publicUrl;
  return null;
};

// --- FUNGSI HELPER: KIRIM OTP REGISTRASI ---
const sendRegisterOtpEmail = async (targetEmail, otpCode, nama) => {
  const mailOptions = {
    from: '"CareKicks Admin" <admin@carekicks.com>',
    to: targetEmail,
    subject: 'Kode OTP Verifikasi Pendaftaran - CareKicks',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eeeeee; border-radius: 10px;">
        <h2 style="color: #0087FF; text-align: center;">Verifikasi Email Anda</h2>
        <p>Halo ${nama},</p>
        <p>Terima kasih telah mendaftar di CareKicks! Untuk mengaktifkan akun Anda, silakan masukkan kode OTP berikut di aplikasi:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #f8f9fa; color: #0087FF; padding: 15px 30px; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 6px; border: 2px dashed #0087FF;">
            ${otpCode}
          </span>
        </div>
        <p style="color: red; font-size: 13px; text-align: center;">Kode ini akan kedaluwarsa dalam <strong>15 Menit</strong>. Jangan berikan kode ini kepada siapa pun!</p>
      </div>
    `,
  };

  let activeMailer;
  if (targetEmail.endsWith('@mail.com') || targetEmail.endsWith('@test.com')) {
    console.log(`\n🟡 [TESTING] Mengirim OTP Registrasi ke ${targetEmail} via Mailtrap`);
    activeMailer = dummyMailer;
  } else {
    console.log(`\n🟢 [REAL] Mengirim OTP Registrasi ke ${targetEmail} via Gmail`);
    activeMailer = realMailer;
  }

  await activeMailer.sendMail(mailOptions);
};

// --- 1. PROSES REGISTRASI (SIMPAN DATA & KIRIM OTP) ---
exports.register = async ({ nama, no_hp, email, password }) => {
  const username = email.split("@")[0];
  const hashed = await bcrypt.hash(password, 10);

  // Buat OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        username,
        nama,
        no_hp,
        email,
        password: hashed,
        jenis_role: "customer",
        otp_code: otpCode,
        otp_expires_at: expiresAt,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Kirim email OTP
  await sendRegisterOtpEmail(email, otpCode, nama);
  // Buat record di tabel customers agar fitur cart dan order bisa digunakan
  const { error: custError } = await supabase
    .from("customers")
    .insert([{ id_user: data.id_user, nama, nomor_hp: no_hp }]);

  if (custError) {
    console.error("Gagal membuat record customer:", custError.message);
    // Jangan throw — user sudah berhasil dibuat, hanya log warning
  }

  const token = jwtService.signToken({
    id: data.id_user,
    id_user: data.id_user,
    role: data.jenis_role,
  });

  const { password: _password, ...safeUser } = data;

  // Kita TIDAK MERETURN TOKEN, melainkan pesan bahwa OTP telah dikirim
  return {
    success: true,
    message: "OTP_SENT",
    user: safeUser,
  };
};

// --- 2. VERIFIKASI OTP REGISTRASI ---
exports.verifyRegisterOtp = async ({ email, otpCode }) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.trim())
    .single();

  if (error || !user) throw new Error("Pengguna tidak ditemukan.");
  if (user.otp_code !== otpCode.trim()) throw new Error("Kode OTP salah.");

  const now = new Date();
  let expireString = user.otp_expires_at;
  if (!expireString.endsWith('Z')) expireString += 'Z'; 
  if (now > new Date(expireString)) {
    throw new Error("Kode OTP sudah kedaluwarsa. Silakan minta kode baru.");
  }

  // Jika sukses, bersihkan OTP
  const { error: updateError } = await supabase
    .from('users')
    .update({ otp_code: null, otp_expires_at: null })
    .eq('id_user', user.id_user);

  if (updateError) throw new Error("Gagal mengupdate status verifikasi user.");

  // Berikan Token JWT karena sekarang akun resmi diaktifkan
  const token = jwtService.signToken({
    id: user.id_user,
    id_user: user.id_user,
    role: user.jenis_role,
  });

  const { password: _p, ...safeUser } = user;
  
  return {
    success: true,
    message: "Registrasi berhasil dan email terverifikasi!",
    token,
    user: safeUser
  };
};

// --- 3. KIRIM ULANG OTP REGISTRASI ---
exports.resendRegisterOtp = async ({ email }) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id_user, nama')
    .eq('email', email.trim())
    .single();

  if (error || !user) throw new Error("Pengguna tidak ditemukan.");

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await supabase
    .from('users')
    .update({ otp_code: otpCode, otp_expires_at: expiresAt })
    .eq('id_user', user.id_user);

  await sendRegisterOtpEmail(email.trim(), otpCode, user.nama);

  return { success: true, message: "OTP berhasil dikirim ulang." };
};

exports.login = async ({ email, password }) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .or(`email.eq.${email},username.eq.${email}`)
    .maybeSingle();

  if (error || !data) throw new Error("User tidak ditemukan");
  
  // Opsional: Jika kamu ingin melarang user login yang belum verifikasi OTP
  // if (data.otp_code !== null) throw new Error("Selesaikan verifikasi OTP terlebih dahulu");

  const isMatch = await bcrypt.compare(password, data.password);
  if (!isMatch) throw new Error("Password salah");

  const safeUserPayload = await buildLoginUserPayload(data);

  const token = jwtService.signToken({
    id: data.id_user,
    id_user: data.id_user,
    role: data.jenis_role,
    id_shops: safeUserPayload.id_shops,
    id_staff: safeUserPayload.id_staff,
  });

  return { message: "Login berhasil", token, user: safeUserPayload };
};

const buildLoginUserPayload = async (userData) => {
  const { password: _password, ...safeUser } = userData;

  if (userData.jenis_role === "staff") {
    const { data: staffData, error: staffError } = await supabase
      .from("staff")
      .select(`
        id_staff,
        id_staff_profile,
        staff_profile!inner (
          id_staff_profile, id_shops, role, status,
          shops ( id_shops, nm_toko, desk_toko, alamat_toko, foto_toko, spesialisasi )
        )
      `)
      .eq("id_user", userData.id_user)
      .maybeSingle();

    if (staffError) throw new Error(staffError.message);
    if (!staffData?.staff_profile?.id_shops) throw new Error("Relasi staff ke toko belum lengkap");

    const shop = Array.isArray(staffData.staff_profile.shops) ? staffData.staff_profile.shops[0] : staffData.staff_profile.shops;

    return {
      ...safeUser,
      id_staff: staffData.id_staff,
      id_staff_profile: staffData.id_staff_profile,
      id_shops: staffData.staff_profile.id_shops,
      staff_profile: {
        id_staff_profile: staffData.staff_profile.id_staff_profile,
        role: staffData.staff_profile.role,
        status: staffData.staff_profile.status,
      },
      shop,
    };
  }

  if (userData.jenis_role === "shops_admin") {
    const { data: shopAdminList, error: shopAdminError } = await supabase
      .from("shops_admin")
      .select("id_shops_admin, shops(id_shops, nm_toko, desk_toko, alamat_toko, foto_toko, spesialisasi, status_verifikasi, alasan_penangguhan)")
      .eq("id_user", userData.id_user);

    if (!shopAdminError && shopAdminList && shopAdminList.length > 0) {
      const shopAdmin = shopAdminList[0];
      const shop = Array.isArray(shopAdmin.shops) ? shopAdmin.shops[0] : shopAdmin.shops;
      return {
        ...safeUser,
        id_shops_admin: shopAdmin.id_shops_admin,
        id_shops: shop?.id_shops,
        shop,
      };
    }
  }

  if (userData.jenis_role === "customer") {
    const { data: shopAdminList, error: shopAdminError } = await supabase
      .from("shops_admin")
      .select("id_shops_admin, shops(id_shops, nm_toko, desk_toko, alamat_toko, foto_toko, spesialisasi, status_verifikasi, alasan_penangguhan)")
      .eq("id_user", userData.id_user);

    if (!shopAdminError && shopAdminList && shopAdminList.length > 0) {
      const shopAdmin = shopAdminList[0];
      const shop = Array.isArray(shopAdmin.shops) ? shopAdmin.shops[0] : shopAdmin.shops;
      if (shop) {
        return {
          ...safeUser,
          id_shops_admin: shopAdmin.id_shops_admin,
          id_shops: shop?.id_shops,
          shop,
          has_pending_shop: true,
        };
      }
    }
  }

  return safeUser;
};

exports.updateProfilePhoto = async (idUser, file) => {
  if (!file) throw new Error("Foto profil wajib diunggah");
  if (!file.mimetype || !file.mimetype.startsWith("image/")) throw new Error("File harus berupa gambar");
  if (file.size > MAX_PROFILE_PHOTO_SIZE) throw new Error("Ukuran foto maksimal 5MB");

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id_user, path_gambar")
    .eq("id_user", idUser)
    .single();

  if (userError || !userData) throw new Error("User tidak ditemukan");

  const filePath = `profile/${idUser}/${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from(PROFILE_BUCKET)
    .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const oldFilePath = getStoragePathFromPublicUrl(userData.path_gambar);
  if (oldFilePath && oldFilePath !== filePath) {
    const { error: removeError } = await supabase.storage.from(PROFILE_BUCKET).remove([oldFilePath]);
    if (removeError) console.warn("Gagal menghapus foto profil lama:", removeError.message);
  }

  const { data: publicUrlData } = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(filePath);
  const publicUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("users")
    .update({ path_gambar: publicUrl })
    .eq("id_user", idUser);

  if (updateError) {
    await supabase.storage.from(PROFILE_BUCKET).remove([filePath]);
    throw new Error(updateError.message);
  }

  return { foto_profil: publicUrl };
};