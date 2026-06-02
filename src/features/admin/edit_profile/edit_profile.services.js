const supabase = require('../../../core/db');

class EditProfileService {
  async update(id_user, data) {
    // 1. Logika Validasi Unik (Mencegah email/no_hp ganda)
    // Gunakan .or() untuk mengecek salah satu saja yang terpakai
    const { data: duplicateCheck, error: checkError } = await supabase
      .from('users')
      .select('id_user')
      .or(`email.eq.${data.email},no_hp.eq.${data.no_hp}`)
      .neq('id_user', id_user); // Pastikan tidak mengecek milik user itu sendiri

    if (checkError) throw new Error("Gagal validasi database: " + checkError.message);
    if (duplicateCheck && duplicateCheck.length > 0) {
      throw new Error("Email atau Nomor Telepon sudah digunakan oleh akun lain.");
    }

    // 2. Eksekusi Update
    const { error } = await supabase
      .from('users')
      .update({ 
        nama: data.nama, 
        no_hp: data.no_hp,
        email: data.email 
      })
      .eq('id_user', id_user);

    if (error) throw new Error("Gagal update profil: " + error.message);
    
    return { success: true, message: "Profil berhasil diperbarui." };
  }

  // ... (fungsi changePassword tetap sama)
}

module.exports = { EditProfileService };