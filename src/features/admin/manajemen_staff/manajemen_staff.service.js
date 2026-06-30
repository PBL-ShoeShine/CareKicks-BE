const bcrypt = require("bcrypt");
const supabase = require("../../../core/config/supabase");
const shopAccess = require("../../../core/services/shop-access.service");

// REVISI: Hapus "role" dari STAFF_SELECT
const STAFF_SELECT = `
  id_staff,
  id_user,
  id_staff_profile,
  staff_profile!inner (
    id_staff_profile,
    nama,
    email,
    no_hp,
    id_shops,
    status
  )
`;

const normalizeEmail = (email) => email?.trim().toLowerCase();

class StaffService {
  async registerStaff(authUser, payload) {
    const { nama, no_hp, password } = payload; // Role sudah tidak diterima
    const email = normalizeEmail(payload.email);

    if (!nama?.trim() || !email || !no_hp?.trim() || !password) {
      throw new Error("Nama, email, no HP, dan password wajib diisi");
    }

    if (!email.includes("@")) {
      throw new Error("Format email tidak valid");
    }

    if (password.length < 6) {
      throw new Error("Password minimal 6 karakter");
    }

    const shopAccessData = await shopAccess.getShopForUser(authUser);
    const idShops = shopAccessData.id_shops;
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split("@")[0];

    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("id_user")
      .eq("email", email)
      .maybeSingle();

    if (existingError) throw new Error(existingError.message);
    if (existingUser) throw new Error("Email sudah terdaftar");

    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        username,
        nama: nama.trim(),
        no_hp: no_hp.trim(),
        email,
        password: hashedPassword,
        jenis_role: "staff",
      })
      .select("id_user, username, nama, email, no_hp, jenis_role")
      .single();

    if (userError) throw new Error(userError.message);

    let profileData;

    try {
      // REVISI: Hapus "role" dari insert query
      const { data: insertedProfile, error: profileError } = await supabase
        .from("staff_profile")
        .insert({
          nama: nama.trim(),
          email,
          no_hp: no_hp.trim(),
          id_shops: idShops,
          status: "AKTIF",
        })
        .select("id_staff_profile, nama, email, no_hp, id_shops, status")
        .single();

      if (profileError) throw new Error(profileError.message);
      profileData = insertedProfile;

      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .insert({
          id_staff_profile: profileData.id_staff_profile,
          id_user: userData.id_user,
        })
        .select(STAFF_SELECT)
        .single();

      if (staffError) throw new Error(staffError.message);

      return staffData;
    } catch (error) {
      if (profileData?.id_staff_profile) {
        await supabase
          .from("staff_profile")
          .delete()
          .eq("id_staff_profile", profileData.id_staff_profile);
      }
      await supabase.from("users").delete().eq("id_user", userData.id_user);
      throw error;
    }
  }

  async getAllStaff(authUser, search) {
    const shopId = await shopAccess.getShopIdForUser(authUser);

    let query = supabase
      .from("staff")
      .select(STAFF_SELECT)
      .eq("staff_profile.id_shops", shopId);

    if (search?.trim()) {
      const keyword = search.trim();
      query = query.or(`nama.ilike.%${keyword}%,email.ilike.%${keyword}%`, {
        foreignTable: "staff_profile",
      });
    }

    const { data, error } = await query.order("id_staff", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getStaffById(authUser, idProfile) {
    const shopId = await shopAccess.getShopIdForUser(authUser);

    const { data, error } = await supabase
      .from("staff")
      .select(STAFF_SELECT)
      .eq("id_staff_profile", idProfile)
      .eq("staff_profile.id_shops", shopId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateStaffProfile(authUser, idProfile, updateData) {
    const existing = await this.getStaffById(authUser, idProfile);
    const profileUpdate = {};
    const userUpdate = {};

    // REVISI: Hapus "role" dari array field update
    ["nama", "email", "no_hp"].forEach((field) => {
      if (updateData[field] !== undefined)
        profileUpdate[field] = updateData[field];
    });

    if (profileUpdate.email)
      profileUpdate.email = normalizeEmail(profileUpdate.email);

    if (profileUpdate.nama !== undefined) userUpdate.nama = profileUpdate.nama;
    if (profileUpdate.email !== undefined)
      userUpdate.email = profileUpdate.email;
    if (profileUpdate.no_hp !== undefined)
      userUpdate.no_hp = profileUpdate.no_hp;

    // REVISI: Hapus "role" dari .select()
    const { data, error } = await supabase
      .from("staff_profile")
      .update(profileUpdate)
      .eq("id_staff_profile", idProfile)
      .eq("id_shops", existing.staff_profile.id_shops)
      .select("id_staff_profile, nama, email, no_hp, id_shops, status")
      .single();

    if (error) throw new Error(error.message);

    if (Object.keys(userUpdate).length > 0) {
      const { error: userError } = await supabase
        .from("users")
        .update(userUpdate)
        .eq("id_user", existing.id_user);

      if (userError) throw new Error(userError.message);
    }

    return data;
  }

  async deleteStaff(authUser, idProfile) {
    const existing = await this.getStaffById(authUser, idProfile);

    const { error: staffError } = await supabase
      .from("staff")
      .delete()
      .eq("id_staff_profile", idProfile);

    if (staffError) throw new Error(staffError.message);

    const { error: profileError } = await supabase
      .from("staff_profile")
      .delete()
      .eq("id_staff_profile", idProfile)
      .eq("id_shops", existing.staff_profile.id_shops);

    if (profileError) throw new Error(profileError.message);

    const { error: userError } = await supabase
      .from("users")
      .delete()
      .eq("id_user", existing.id_user)
      .eq("jenis_role", "staff");

    if (userError) throw new Error(userError.message);

    return { message: "Data staff, profil, dan akun user berhasil dihapus" };
  }
}

module.exports = new StaffService();
