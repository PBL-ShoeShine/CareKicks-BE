const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");
const jwtService = require("../../core/services/jwt.service");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

exports.register = async ({ nama, no_hp, email, password }) => {
  const username = email.split("@")[0];

  const hashed = await bcrypt.hash(password, 10);

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
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  const token = jwtService.signToken({
    id: data.id_user,
    role: data.jenis_role,
  });

  return {
    message: "Register berhasil",
    token,
    user: data,
  };
};

exports.login = async ({ email, password }) => {
  // ambil user dari DB
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) {
    throw new Error("User tidak ditemukan");
  }

  // compare password
  const isMatch = await bcrypt.compare(password, data.password);

  if (!isMatch) {
    throw new Error("Password salah");
  }

  // generate token
  const token = jwtService.signToken({
    id: data.id_user,
    role: data.jenis_role,
  });

  return {
    message: "Login berhasil",
    token,
    user: data,
  };
};
