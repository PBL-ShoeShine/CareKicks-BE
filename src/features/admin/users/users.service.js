const bcrypt = require("bcrypt");
const supabase = require("../../../core/config/supabase");

exports.getUsers = async ({ search = "", page = 1, limit = 10 } = {}) => {
  try {
    let query = supabase
      .from("users")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(`nama.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const offset = (page - 1) * limit;
    const { data: users, count: total, error } = await query
      .range(offset, offset + limit - 1)
      .order("nama", { ascending: true });

    if (error) throw error;

    const totalPages = Math.ceil((total || 0) / limit);

    return {
      users: (users || []).map(u => {
        const { password, ...safeUser } = u;
        return safeUser;
      }),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: total || 0,
        totalPages: totalPages || 1
      }
    };
  } catch (error) {
    console.error("Error in getUsers service:", error);
    throw error;
  }
};

exports.createUser = async (userData) => {
  try {
    // 1. Check if email already exists
    const { data: existingEmail, error: errEmail } = await supabase
      .from("users")
      .select("id_user")
      .eq("email", userData.email)
      .maybeSingle();
    if (errEmail) throw errEmail;
    if (existingEmail) {
      throw new Error("Email sudah terdaftar");
    }

    // 2. Check if username already exists
    const { data: existingUsername, error: errUser } = await supabase
      .from("users")
      .select("id_user")
      .eq("username", userData.username)
      .maybeSingle();
    if (errUser) throw errUser;
    if (existingUsername) {
      throw new Error("Username sudah terdaftar");
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 4. Insert user
    const { data: newUser, error: insertErr } = await supabase
      .from("users")
      .insert({
        nama: userData.nama,
        username: userData.username,
        email: userData.email,
        no_hp: userData.no_hp,
        jenis_role: userData.jenis_role,
        password: hashedPassword
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    const { password, ...safeUser } = newUser;
    return safeUser;
  } catch (error) {
    console.error("Error in createUser service:", error);
    throw error;
  }
};

exports.updateUser = async (id, userData) => {
  try {
    // 1. Check email uniqueness for other users
    const { data: existingEmail } = await supabase
      .from("users")
      .select("id_user")
      .eq("email", userData.email)
      .neq("id_user", id)
      .maybeSingle();
    if (existingEmail) {
      throw new Error("Email sudah digunakan oleh pengguna lain");
    }

    // 2. Check username uniqueness for other users
    const { data: existingUsername } = await supabase
      .from("users")
      .select("id_user")
      .eq("username", userData.username)
      .neq("id_user", id)
      .maybeSingle();
    if (existingUsername) {
      throw new Error("Username sudah digunakan oleh pengguna lain");
    }

    // 3. Prepare update object
    const updateData = {
      nama: userData.nama,
      username: userData.username,
      email: userData.email,
      no_hp: userData.no_hp,
      jenis_role: userData.jenis_role
    };

    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 10);
    }

    // 4. Update database
    const { data: updatedUser, error: updateErr } = await supabase
      .from("users")
      .update(updateData)
      .eq("id_user", id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    const { password, ...safeUser } = updatedUser;
    return safeUser;
  } catch (error) {
    console.error("Error in updateUser service:", error);
    throw error;
  }
};

exports.deleteUser = async (id) => {
  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id_user", id);

    if (error) {
      throw new Error(`Gagal menghapus user: ${error.message}`);
    }

    return { success: true, message: "Pengguna berhasil dihapus" };
  } catch (error) {
    console.error("Error in deleteUser service:", error);
    throw error;
  }
};
