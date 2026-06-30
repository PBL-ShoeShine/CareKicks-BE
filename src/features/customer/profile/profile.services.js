const crypto = require("crypto");
const bcrypt = require("bcrypt");
const supabase = require("../../../core/config/supabase");
const { realMailer, dummyMailer } = require("../../../core/config/mailer");

const sendVerificationEmail = async (targetEmail, token) => {
  const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/api/v1/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: '"CareKicks" <security.carekicks@gmail.com>',
    to: targetEmail,
    subject: "Verifikasi Email Baru Anda - CareKicks",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eeeeee; border-radius: 10px;">
        <h2 style="color: #0087FF; text-align: center;">Verifikasi Email Baru</h2>
        <p>Halo,</p>
        <p>Kami menerima permintaan perubahan alamat email untuk akun CareKicks Anda. Tautan ini berlaku selama <strong>1 jam</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #0087FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Verifikasi Email Sekarang
          </a>
        </div>
      </div>
    `,
  };

  const activeMailer =
    targetEmail.endsWith("@mail.com") || targetEmail.endsWith("@test.com")
      ? dummyMailer
      : realMailer;

  await activeMailer.sendMail(mailOptions);
};

class CustomerProfileService {
  // =========================================================================
  // GET PROFILE — join users + customers
  // =========================================================================
  async getProfile(id_user) {
    const { data, error } = await supabase
      .from("users")
      .select("*, customers(*)")
      .eq("id_user", id_user)
      .single();

    if (error) throw new Error("Gagal mengambil data profil: " + error.message);

    const customerData = Array.isArray(data.customers)
      ? (data.customers[0] ?? {})
      : (data.customers ?? {});

    return {
      id_user: data.id_user,
      nama: data.nama,
      email: data.email,
      no_hp: data.no_hp,
      path_gambar: data.path_gambar,
      gender: customerData.gender ?? null,
      birthday: customerData.birthday ?? null,
    };
  }

  // =========================================================================
  // UPDATE PROFILE (nama, gender, birthday)
  // =========================================================================
  async updateProfile(id_user, payload) {
    const { nama, gender, birthday } = payload;

    // 1. Update tabel users (hanya nama)
    if (nama !== undefined && nama !== null) {
      const { error: errUsers } = await supabase
        .from("users")
        .update({ nama })
        .eq("id_user", id_user);
      if (errUsers) throw new Error("Gagal update users: " + errUsers.message);
    }

    // 2. Cek eksistensi di tabel customers
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id_user")
      .eq("id_user", id_user)
      .maybeSingle();

    // 3. Siapkan payload untuk tabel customers
    const customerPayload = {};
    if (gender !== undefined) customerPayload.gender = gender;

    if (birthday !== undefined) {
      customerPayload.birthday = birthday === "" ? null : birthday;
    }

    // Sinkronisasikan juga nama ke tabel customers
    if (nama !== undefined && nama !== null) customerPayload.nama = nama;

    // 4. Eksekusi Update atau Insert
    if (Object.keys(customerPayload).length > 0) {
      if (existingCustomer) {
        // Lakukan UPDATE jika user sudah ada
        const { error: errUpdate } = await supabase
          .from("customers")
          .update(customerPayload)
          .eq("id_user", id_user);
        if (errUpdate)
          throw new Error("Gagal update customers: " + errUpdate.message);
      } else {
        // Lakukan INSERT jika user benar-benar baru
        customerPayload.id_user = id_user;
        const { error: errInsert } = await supabase
          .from("customers")
          .insert([customerPayload]);
        if (errInsert)
          throw new Error("Gagal insert customers: " + errInsert.message);
      }
    }

    return { success: true, message: "Profil berhasil diperbarui" };
  }

  // =========================================================================
  // REQUEST EMAIL CHANGE
  // =========================================================================
  async requestEmailChange(id_user, email) {
    const trimmedEmail = email.trim();

    const { data: existingUser } = await supabase
      .from("users")
      .select("id_user")
      .eq("email", trimmedEmail)
      .neq("id_user", id_user)
      .maybeSingle();

    if (existingUser) {
      throw new Error("Email sudah digunakan oleh akun lain.");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000);

    const { error: updateTokenError } = await supabase
      .from("users")
      .update({
        temp_email: trimmedEmail,
        email_verification_token: token,
        email_token_expires_at: expiresAt.toISOString(),
      })
      .eq("id_user", id_user);

    if (updateTokenError) throw new Error("Gagal menyimpan token verifikasi.");

    await sendVerificationEmail(trimmedEmail, token);

    return {
      success: true,
      message:
        "Tautan verifikasi telah dikirim ke email baru! Berlaku selama 1 jam.",
    };
  }

  // =========================================================================
  // UPDATE NO HP
  // =========================================================================
  async updateNoHp(id_user, no_hp, password) {
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("id_user", id_user)
      .single();

    if (dbError || !userData) throw new Error("Pengguna tidak ditemukan.");

    const isPasswordMatch = await bcrypt.compare(password, userData.password);
    if (!isPasswordMatch) throw new Error("Kata sandi salah.");

    const { data: duplicatePhone } = await supabase
      .from("users")
      .select("id_user")
      .eq("no_hp", no_hp)
      .neq("id_user", id_user)
      .maybeSingle();

    if (duplicatePhone) {
      throw new Error("Nomor telepon sudah digunakan oleh akun lain.");
    }

    // Update tabel users
    const { error: updateError } = await supabase
      .from("users")
      .update({ no_hp })
      .eq("id_user", id_user);

    if (updateError) throw new Error("Gagal memperbarui nomor telepon.");

    // ✅ FIX: Sinkronisasi update nomor telepon ke tabel customers
    const { error: updateCustomerError } = await supabase
      .from("customers")
      .update({ nomor_hp: no_hp })
      .eq("id_user", id_user);

    if (updateCustomerError) {
      console.warn(
        "Peringatan: Gagal sinkronisasi no_hp ke tabel customers:",
        updateCustomerError.message,
      );
    }

    return { success: true, message: "Nomor telepon berhasil diperbarui." };
  }
}

module.exports = new CustomerProfileService();
