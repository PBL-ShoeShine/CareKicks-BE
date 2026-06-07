const bcrypt = require("bcrypt");
const supabase = require("../../../core/config/supabase");

const ALLOWED_ROLES = ["superadmin", "customer", "admin_toko", "staff"];
const USER_COLUMNS = "id_user, username, jenis_role, path_gambar, no_hp, nama, email";

const sanitizeSearch = (value = "") => value.trim().replace(/[,%]/g, " ");

const normalizeRole = (role) => {
  if (role === "shops_admin") return "admin_toko";
  return role;
};

const validateRole = (role) => {
  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error("Role tidak valid");
  }
};

exports.getUsers = async ({ search = "", page = 1, limit = 10 }) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const from = (currentPage - 1) * currentLimit;
  const to = from + currentLimit - 1;
  const keyword = sanitizeSearch(search);

  let query = supabase
    .from("users")
    .select(USER_COLUMNS, { count: "exact" })
    .order("id_user", { ascending: false })
    .range(from, to);

  if (keyword) {
    query = query.or(
      `nama.ilike.%${keyword}%,email.ilike.%${keyword}%,username.ilike.%${keyword}%`,
    );
  }

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    users: (data || []).map((user) => ({
      ...user,
      jenis_role: normalizeRole(user.jenis_role),
    })),
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total: count || 0,
      totalPages: Math.max(Math.ceil((count || 0) / currentLimit), 1),
    },
  };
};

exports.getUserById = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select(USER_COLUMNS)
    .eq("id_user", id)
    .single();

  if (error) throw error;

  return {
    ...data,
    jenis_role: normalizeRole(data.jenis_role),
  };
};

exports.createUser = async (payload) => {
  const { nama, username, email, no_hp, jenis_role, password } = payload;

  if (!username || !email || !password || !jenis_role) {
    throw new Error("Username, email, password, dan role wajib diisi");
  }

  validateRole(jenis_role);

  const hashedPassword = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        nama,
        username,
        email,
        no_hp,
        jenis_role,
        password: hashedPassword,
      },
    ])
    .select(USER_COLUMNS)
    .single();

  if (error) throw error;

  return data;
};

exports.updateUser = async (id, payload) => {
  const { nama, username, email, no_hp, jenis_role, password } = payload;

  if (!username || !email || !jenis_role) {
    throw new Error("Username, email, dan role wajib diisi");
  }

  validateRole(jenis_role);

  const updatePayload = {
    nama,
    username,
    email,
    no_hp,
    jenis_role,
  };

  if (password?.trim()) {
    updatePayload.password = await bcrypt.hash(password, 10);
  }

  const { data, error } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("id_user", id)
    .select(USER_COLUMNS)
    .single();

  if (error) throw error;

  return data;
};

exports.deleteUser = async (id) => {
  const { error } = await supabase.from("users").delete().eq("id_user", id);

  if (error) {
    if (
      error.code === "23503" ||
      error.message?.toLowerCase().includes("foreign key")
    ) {
      const relationError = new Error(
        "Pengguna tidak bisa dihapus karena masih memiliki relasi data.",
      );
      relationError.status = 409;
      throw relationError;
    }

    throw error;
  }

  return true;
};
