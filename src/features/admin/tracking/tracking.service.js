const supabase = require("../../../core/config/supabase");
const { resolveStaffIds } = require("../../../core/services/resolve-staff-id");

// Status yang boleh diupdate oleh staff via scan QR
const STATUS_VALID_STAFF = new Set([
  "sedang_dijemput",
  "sudah_dijemput",
  "washing",
  "selesai_cuci",
  "sedang_diantar",
  "selesai",
]);

// Status yang butuh GPS tracking (insert ke tracking_logs)
const STATUS_GPS = new Set(["sedang_dijemput", "sedang_diantar"]);

// Flow pickup
const PICKUP_FLOW = ["menunggu_dijemput", "sedang_dijemput", "sudah_dijemput"];

// Flow delivery
const DELIVERY_FLOW = ["selesai_cuci", "sedang_diantar", "selesai"];

// Flow cuci (berlaku online & offline)
const WASH_FLOW = [
  "sudah_dijemput", // online: setelah dijemput
  "dikonfirmasi", // offline: setelah dikonfirmasi
  "washing",
  "selesai_cuci",
];

const normalizeStatus = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

const isValidFlowTransition = (currentStatus, nextStatus, flow) => {
  if (flow === WASH_FLOW) {
    if (
      (currentStatus === "sudah_dijemput" || currentStatus === "dikonfirmasi") &&
      nextStatus === "washing"
    ) {
      return true;
    }
    if (currentStatus === "washing" && nextStatus === "selesai_cuci") {
      return true;
    }
    return false;
  }

  const currentIndex = flow.indexOf(currentStatus);
  const nextIndex = flow.indexOf(nextStatus);
  if (nextIndex < 0) return false;
  if (currentIndex < 0) return nextIndex === 0;
  return nextIndex === currentIndex + 1;
};

// Helper: insert ke order_status_history
const insertStatusHistory = async (
  idOrders,
  status,
  changedByRole,
  idStaff = null,
  keterangan = null,
) => {
  const { error } = await supabase.from("order_status_history").insert({
    id_orders: idOrders,
    id_staff: idStaff,
    status,
    keterangan,
    changed_by_role: changedByRole,
  });
  if (error) throw new Error(`Gagal insert history: ${error.message}`);
};

// Helper: insert GPS ke tracking_logs
const insertGpsLog = async (idOrders, idStaff, status, latitude, longitude) => {
  const { error } = await supabase.from("tracking_logs").insert({
    id_orders: idOrders,
    id_staff: idStaff,
    status,
    keterangan: "Update lokasi kurir",
    latitude,
    longitude,
    log_type: "gps_update",
    waktu: new Date().toISOString(),
  });
  if (error) throw new Error(`Gagal insert GPS log: ${error.message}`);
};

exports.getAllTracking = async (shopId, search = "") => {
  // Tracking hanya tampilkan order yang sedang dalam proses logistik
  let query = supabase
    .from("orders")
    .select(
      `
      id_orders,
      kode_order,
      status_order,
      metode_order,
      metode_pengambilan,
      tgl_order,
      customers (nama),
      detail_orders (
        id_detail_orders,
        merk,
        jenis_sepatu,
        total_harga
      )
    `,
    )
    .eq("id_shops", shopId)
    .in("status_order", [
      "menunggu_dijemput",
      "sedang_dijemput",
      "sudah_dijemput",
      "sedang_diantar",
    ]);

  if (search) query = query.ilike("kode_order", `%${search}%`);

  const { data, error } = await query.order("tgl_order", { ascending: false });
  if (error) throw error;
  return data;
};

exports.getTrackingDetail = async (orderId, shopId) => {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      *,
      customers (nama, nomor_hp, alamat, latitude, longitude),
      detail_orders (*, services (*)),
      shops (lat_toko, long_toko),
      staff:users!id_staff (
        nama
      )
    `,
    )
    .eq("id_orders", orderId)
    .eq("id_shops", shopId)
    .single();

  if (orderError) throw orderError;

  // Timeline dari order_status_history
  const { data: timeline, error: timelineError } = await supabase
    .from("order_status_history")
    .select(
      `
      id_history,
      status,
      keterangan,
      changed_by_role,
      created_at,
      staff (
        id_staff,
        staff_profile (nama)
      )
    `,
    )
    .eq("id_orders", orderId)
    .order("created_at", { ascending: true });

  if (timelineError) throw timelineError;

  // GPS logs terbaru dari tracking_logs
  const { data: gpsLogs, error: gpsError } = await supabase
    .from("tracking_logs")
    .select("*")
    .eq("id_orders", orderId)
    .eq("log_type", "gps_update")
    .order("waktu", { ascending: false })
    .limit(20);

  if (gpsError) throw gpsError;

  const assignedStaffName = order.staff?.nama ?? null;

  const findStaffInGroup = (statusGroup) => {
    for (const entry of (timeline || [])) {
      if (statusGroup.includes(entry.status)) {
        const name = entry.staff?.staff_profile?.nama;
        if (name) return name;
      }
    }
    return null;
  };

  const timelineNormalized = (timeline || []).map((item) => {
    let namaStaff = item.staff?.staff_profile?.nama ?? null;

    if (!namaStaff) {
      // Layer 1: Workflow stage pair fallback (sedang_dijemput <-> sudah_dijemput, washing <-> selesai_cuci, sedang_diantar <-> selesai)
      if (["sedang_dijemput", "sudah_dijemput"].includes(item.status)) {
        namaStaff = findStaffInGroup(["sedang_dijemput", "sudah_dijemput"]);
      } else if (["washing", "selesai_cuci"].includes(item.status)) {
        namaStaff = findStaffInGroup(["washing", "selesai_cuci"]);
      } else if (["sedang_diantar", "selesai"].includes(item.status)) {
        namaStaff = findStaffInGroup(["sedang_diantar", "selesai"]);
      }

      // Layer 2: Order assigned staff fallback for "sedang" statuses
      if (!namaStaff && ["sedang_dijemput", "washing", "sedang_diantar"].includes(item.status)) {
        namaStaff = assignedStaffName;
      }
    }

    return {
      id_history: item.id_history,
      status: item.status,
      keterangan: item.keterangan,
      changed_by_role: item.changed_by_role,
      created_at: item.created_at,
      nama_staff: namaStaff,
    };
  });

  return {
    order,
    timeline: timelineNormalized,
    gps_logs: gpsLogs || [],
  };
};

exports.getLatestLocation = async (orderId, shopId) => {
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
    .eq("id_shops", shopId)
    .single();

  if (orderError) throw orderError;

  // Ambil GPS terbaru dari tracking_logs
  const { data: latestLog } = await supabase
    .from("tracking_logs")
    .select("*")
    .eq("id_orders", orderId)
    .eq("log_type", "gps_update")
    .order("waktu", { ascending: false })
    .limit(1)
    .single();

  return {
    order,
    latest_location: latestLog || null,
  };
};

// Khusus update lokasi GPS real-time saat kurir bergerak
exports.updateLocation = async (orderId, shopId, payload) => {
  const { latitude, longitude, id_staff, status } = payload;

  const { error: orderError } = await supabase
    .from("orders")
    .select("id_orders", { head: true })
    .eq("id_orders", orderId)
    .eq("id_shops", shopId)
    .single();

  if (orderError) throw orderError;

  // Hanya insert GPS log, tidak ubah status
  await insertGpsLog(
    orderId,
    id_staff,
    status || "sedang_diantar",
    latitude,
    longitude,
  );

  return { success: true };
};

// Update status via scan QR oleh staff
exports.updateStatus = async (orderId, shopId, payload) => {
  const {
    status,
    keterangan,
    latitude,
    longitude,
    id_staff,
    id_detail_orders,
    foto_type,
    is_validation,
  } = payload;

  const normalizedStatus = normalizeStatus(status);

  // Validasi status hanya boleh yang valid untuk staff
  if (!STATUS_VALID_STAFF.has(normalizedStatus)) {
    throw new Error(
      `Status tidak valid untuk staff. Pilihan: ${[...STATUS_VALID_STAFF].join(", ")}`,
    );
  }

  // Ambil data order saat ini
  const { data: orderInfo, error: orderInfoError } = await supabase
    .from("orders")
    .select("status_order, metode_order")
    .eq("id_orders", orderId)
    .eq("id_shops", shopId)
    .single();

  if (orderInfoError) throw orderInfoError;

  const currentStatus = normalizeStatus(orderInfo.status_order);
  const metodeOrder = normalizeStatus(orderInfo.metode_order || "offline");

  // Validasi flow transisi
  const allFlows = [PICKUP_FLOW, WASH_FLOW, DELIVERY_FLOW];
  const isValidTransition = allFlows.some((flow) =>
    isValidFlowTransition(currentStatus, normalizedStatus, flow),
  );

  // Khusus offline: tidak boleh ada status pickup & delivery
  if (metodeOrder === "offline") {
    if (
      ["sedang_dijemput", "sudah_dijemput", "sedang_diantar"].includes(
        normalizedStatus,
      )
    ) {
      throw new Error("Order offline tidak memiliki proses pickup/delivery.");
    }
  }

  if (!isValidTransition) {
    throw new Error(
      `Transisi status tidak valid: ${currentStatus} -> ${normalizedStatus}`,
    );
  }

  const resolved = await resolveStaffIds(id_staff);
  const orderStaffId = resolved.id_user; // For orders.id_staff column
  const historyStaffId = resolved.id_staff; // For order_status_history.id_staff column

  // Update cache status di tabel orders
  const orderUpdateData = { status_order: normalizedStatus };
  if (orderStaffId) {
    orderUpdateData.id_staff = orderStaffId;
  }

  if (is_validation && payload.foto_url) {
    orderUpdateData.foto_validasi = payload.foto_url;
  }

  const { data: orderData, error: updateError } = await supabase
    .from("orders")
    .update(orderUpdateData)
    .eq("id_orders", orderId)
    .eq("id_shops", shopId)
    .select()
    .single();

  if (updateError) throw updateError;

  // Insert milestone ke order_status_history
  await insertStatusHistory(
    orderId,
    normalizedStatus,
    "staff",
    historyStaffId,
    keterangan,
  );

  // Kalau status butuh GPS, insert juga ke tracking_logs
  if (STATUS_GPS.has(normalizedStatus) && latitude && longitude) {
    await insertGpsLog(
      orderId,
      historyStaffId,
      normalizedStatus,
      latitude,
      longitude,
    );
  }

  // Update foto sebelum/sesudah di detail_orders jika ada
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
    .upload(filePath, file.buffer, { contentType: file.mimetype });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("services")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

exports.deleteImage = async (url) => {
  try {
    const path = url.split("/storage/v1/object/public/services/")[1];
    if (path) await supabase.storage.from("services").remove([path]);
  } catch (error) {
    console.error("Failed to delete image:", error);
  }
};
