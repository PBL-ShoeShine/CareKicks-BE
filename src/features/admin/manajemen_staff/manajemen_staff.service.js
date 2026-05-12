const supabase = require("../../../core/config/supabase");

class StaffService {
  /**
   * 1. Tambah Staff Baru (ID User Incremental)
   */
  async registerStaff(payload) {
    const { nama, email, no_hp, id_shops, role } = payload;

    // STEP 1: Cari id_user terbesar yang ada di tabel staff
    // Kita ambil 1 data terakhir, urutkan dari yang paling besar
    const { data: lastStaffs, error: fetchError } = await supabase
      .from("staff")
      .select("id_user")
      .order("id_user", { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    // Jika ada data, ambil id_user-nya lalu tambah 1. 
    // Jika tabel kosong, kita mulai dari angka 1.
    const nextIdUser = (lastStaffs && lastStaffs.length > 0) 
      ? lastStaffs[0].id_user + 1 
      : 1;

    // STEP 2: Simpan ke staff_profile
    const { data: profileData, error: profileError } = await supabase
      .from("staff_profile")
      .insert([{ nama, email, no_hp, id_shops, role }])
      .select("id_staff_profile")
      .single();

    if (profileError) throw profileError;

    // STEP 3: Hubungkan ke tabel staff dengan id_user yang sudah urut
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

    return { ...staffData, ...profileData, role };
  }

  /**
   * 2. Ambil Semua Staff
   */
  async getAllStaff(search) {
    let query = supabase.from("staff").select(`
      id_staff,
      id_user,
      id_staff_profile,
      staff_profile (
        id_staff_profile,
        nama,
        email,
        no_hp,
        id_shops,
        role
      )
    `);

    if (search) {
      query = query.ilike("staff_profile.nama", `%${search}%`);
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
      .update(updateData)
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