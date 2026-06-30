const supabase = require("../../../core/config/supabase");

exports.registerFcmToken = async (authUser, payload) => {
  const idUser = authUser.id_user || authUser.id;
  const role = authUser.role;
  const { fcm_token, platform, device_id } = payload;

  if (!idUser) throw new Error("User tidak valid");
  if (!fcm_token || typeof fcm_token !== "string") {
    throw new Error("fcm_token wajib diisi");
  }

  const tokenPayload = {
    id_user: idUser,
    fcm_token,
    platform: platform || null,
    device_id: device_id || null,
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  const { data: existingToken, error: findError } = await supabase
    .from("user_fcm_tokens")
    .select("id_user, fcm_token")
    .eq("fcm_token", fcm_token)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (existingToken && Number(existingToken.id_user) !== Number(idUser)) {
    if (role !== "customer") {
      return { skipped: true, reason: "Token sudah terdaftar untuk user lain" };
    }

    const { data, error } = await supabase
      .from("user_fcm_tokens")
      .update(tokenPayload)
      .eq("fcm_token", fcm_token)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const query = existingToken
    ? supabase
        .from("user_fcm_tokens")
        .update(tokenPayload)
        .eq("fcm_token", fcm_token)
    : supabase.from("user_fcm_tokens").insert(tokenPayload);

  const { data, error } = await query.select().single();

  if (error) throw new Error(error.message);
  return data;
};
