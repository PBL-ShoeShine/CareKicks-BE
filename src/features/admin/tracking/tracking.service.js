const supabase = require("../../../core/config/supabase");

exports.getAllTracking = async (shopId, search = "", status = "") => {
  let query = supabase
    .from("orders")
    .select(
      `
      id_orders,
      kode_order,
      status_order,
      tgl_order,
      customers (
        nama
      ),
      detail_orders (
        id_detail_orders,
        merk,
        jenis_sepatu,
        total_harga
      )
    `,
    )
    .eq("id_shops", shopId);

  if (search) {
    query = query.ilike("kode_order", `%${search}%`);
  }

  if (status) {
    query = query.eq("status_order", status);
  }

  const { data, error } = await query.order("tgl_order", { ascending: false });

  if (error) throw error;
  return data;
};

exports.getTrackingDetail = async (orderId) => {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      *,
      customers (nama, nomor_hp, alamat, latitude, longitude),
      detail_orders (*, services (*)),
      shops (lat_toko, long_toko)
    `,
    )
    .eq("id_orders", orderId)
    .single();

  if (orderError) throw orderError;

  const { data: logs, error: logsError } = await supabase
    .from("tracking_logs")
    .select(
      `
      *,
      staff (
        id_staff,
        staff_profile (nama)
      )
    `,
    )
    .eq("id_orders", orderId)
    .order("waktu", { ascending: false });

  if (logsError) throw logsError;

  return {
    order,
    tracking_logs: logs,
  };
};

exports.getLatestLocation = async (orderId) => {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      id_orders,
      kode_order,
      status_order,
      customers (nama, latitude, longitude),
      shops (lat_toko, long_toko)
    `,
    )
    .eq("id_orders", orderId)
    .single();

  if (orderError) throw orderError;

  const { data: latestLog, error: logsError } = await supabase
    .from("tracking_logs")
    .select("*")
    .eq("id_orders", orderId)
    .order("waktu", { ascending: false })
    .limit(1)
    .single();

  // If latestLog is empty, it's not an error, just no logs yet
  return {
    order,
    latest_log: latestLog || null,
  };
};

exports.updateLocation = async (orderId, payload) => {
  const { latitude, longitude, id_staff, status } = payload;

  const { error: logError } = await supabase.from("tracking_logs").insert([
    {
      id_orders: orderId,
      status: status || "sedang mengantar",
      keterangan: "Update lokasi kurir",
      latitude: latitude,
      longitude: longitude,
      id_staff: id_staff,
      waktu: new Date().toISOString(),
    },
  ]);

  if (logError) throw logError;
  return { success: true };
};

exports.updateStatus = async (orderId, shopId, payload) => {
  const { status, keterangan, latitude, longitude, id_staff, id_detail_orders, foto_type, is_validation } = payload;

  const orderUpdateData = { status_order: status };
  
  // If this is a validation photo (delivery confirmation)
  if (is_validation && payload.foto_url) {
    orderUpdateData.foto_validasi = payload.foto_url;
  }

  // 1. Update order status
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .update(orderUpdateData)
    .eq("id_orders", orderId)
    .eq("id_shops", shopId)
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Add tracking log with geolocation
  const { error: logError } = await supabase.from("tracking_logs").insert([
    {
      id_orders: orderId,
      status: status,
      keterangan: keterangan,
      latitude: latitude,
      longitude: longitude,
      id_staff: id_staff,
      waktu: new Date().toISOString(),
    },
  ]);

  if (logError) throw logError;

  // 3. Update detail_orders photo if provided (for processing phase)
  if (id_detail_orders && payload.foto_url && !is_validation) {
    const updateObj = {};
    if (foto_type === "sebelum") updateObj.foto_sebelum = payload.foto_url;
    if (foto_type === "sesudah") updateObj.foto_sesudah = payload.foto_url;

    if (Object.keys(updateObj).length > 0) {
      await supabase
        .from("detail_orders")
        .update(updateObj)
        .eq("id_detail_orders", id_detail_orders);
    }
  }

  return orderData;
};

exports.uploadImage = async (file) => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const fileExt = file.originalname.split(".").pop();
  const fileName = `tracking_${timestamp}_${randomStr}.${fileExt}`;
  const filePath = `tracking/${fileName}`;

  const { data, error } = await supabase.storage
    .from("services")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("services")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

exports.deleteImage = async (url) => {
  try {
    const path = url.split("/storage/v1/object/public/services/")[1];
    if (path) {
      await supabase.storage.from("services").remove([path]);
    }
  } catch (error) {
    console.error("Failed to delete image:", error);
  }
};
