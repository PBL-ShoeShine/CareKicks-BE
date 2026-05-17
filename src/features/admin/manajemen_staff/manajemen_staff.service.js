const supabase = require("../../../core/config/supabase");

class StaffService {
  /**
   * 1. Tambah Staff Baru (ID User Incremental)
   */
  async registerStaff(payload) {
    // Terima password dan status
    const { nama, email, no_hp, id_shops, role, password, status } = payload;

    // STEP 1: Cari id_user terbesar yang ada di tabel staff
    const { data: lastStaffs, error: fetchError } = await supabase
      .from("staff")
      .select("id_user")
      .order("id_user", { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    const nextIdUser = (lastStaffs && lastStaffs.length > 0) 
      ? lastStaffs[0].id_user + 1 
      : 1;

    // STEP 2: Simpan ke staff_profile beserta password dan status
    const { data: profileData, error: profileError } = await supabase
      .from("staff_profile")
      .insert([{ nama, email, no_hp, id_shops, role, password, status }])
      .select("id_staff_profile")
      .single();

    if (profileError) throw profileError;

    // STEP 3: Hubungkan ke tabel staff
    const { data: staffData, error: staffError } = await supabase
      .from("staff")
      .insert([
        {
          id_staff_profile: profileData.id_staff_profile,
          id_user: nextIdUser 
        },
      ])
      .select()
      .single();

    if (staffError) throw staffError;

    return { ...staffData, ...profileData, role, status };
  }

  /**
   * 2. Ambil Semua Staff
   */
  async getAllStaff(search) {
    // PERHATIAN: Gunakan !inner setelah nama relasi (staff_profile!inner)
    // Ini memastikan Supabase hanya mengembalikan baris yang cocok dengan kondisi filter di dalamnya.
    // Tambahkan juga field 'status' di select
    let query = supabase.from("staff").select(`
      id_staff,
      id_user,
      id_staff_profile,
      staff_profile!inner (
        id_staff_profile,
        nama,
        email,
        no_hp,
        id_shops,
        role,
        status
      )
    `);

    if (search) {
      // Logika search: mencari di kolom 'nama' ATAU 'role'
      // Catatan: Jika kolom role di Supabase diset sebagai text[] (array), 
      // gunakan operator .cs (contains). Jika berupa JSON/String biasa, gunakan .ilike
      // Asumsi tipe data role adalah text[] atau teks biasa yang dilempar dari front-end.
      query = query.or(`nama.ilike.%${search}%,role.ilike.%${search}%`, { foreignTable: "staff_profile" });
    }

    const { data, error } = await query.order("id_staff", { ascending: false });
    if (error) throw error;
    return data;
  }

  /**
   * 3. Ambil Detail Staff
   */
  async getStaffById(id_profile) {
    const { data, error } = await supabase
      .from("staff")
      .select(`
        *,
        staff_profile (*)
      `)
      .eq("id_staff_profile", id_profile)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 4. Update Profile Staff
   */
  async updateStaffProfile(id_profile, updateData) {
    const { data, error } = await supabase
      .from("staff_profile")
      .update(updateData) // Akan otomatis mengupdate field apapun yang dikirim (termasuk status/role baru)
      .eq("id_staff_profile", id_profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 5. Hapus Staff
   */
  async deleteStaff(id_profile) {
    const { error } = await supabase
      .from("staff_profile")
      .delete()
      .eq("id_staff_profile", id_profile);

    if (error) throw error;
    return { message: "Data staff dan profil berhasil dihapus" };
  }
}

module.exports = new StaffService();