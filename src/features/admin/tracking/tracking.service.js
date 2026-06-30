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
      (currentStatus === "sudah_dijemput" ||
        currentStatus === "dikonfirmasi") &&
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
      customers (id_user, nama, nomor_hp),
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
      customers (id_user, nama, nomor_hp, alamat, latitude, longitude),
      detail_orders (*, services (*)),
      shops (lat_toko, long_toko)
    `,
    )
    .eq("id_orders", orderId)
    .eq("id_shops", shopId)
    .single();

  if (orderError) throw orderError;

  // Fallback nomor_hp dari tabel users jika customers.nomor_hp null
  if (order.customers && !order.customers.nomor_hp) {
    const { data: userData } = await supabase
      .from("users")
      .select("no_hp")
      .eq("id_user", order.customers.id_user)
      .maybeSingle();
    if (userData?.no_hp) {
      order.customers.nomor_hp = userData.no_hp;
    }
  }

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

  // FIX: Hapus assignedStaffName dari orders.id_staff — ini sumber utama "Rina nempel".
  // Nama staff hanya boleh diambil dari order_status_history, bukan dari field stale di orders.

  // Layer 1 fallback: kalau satu aksi dalam satu workflow group ada nama staffnya,
  // pakai nama yang sama untuk pasangannya (misal sedang_dijemput dan sudah_dijemput
  // harusnya orang yang sama karena satu proses pickup).
  const findStaffInGroup = (statusGroup) => {
    for (const entry of timeline || []) {
      if (statusGroup.includes(entry.status)) {
        const name = entry.staff?.staff_profile?.nama;
        if (name) return name;
      }
    }
    return null;
  };

  const timelineNormalized = (timeline || []).map((item) => {
    // Sumber utama: nama langsung dari order_status_history → staff → staff_profile
    let namaStaff = item.staff?.staff_profile?.nama ?? null;

    // Layer 1: Kalau nama tidak ada di history item ini, coba cari dari
    // pasangan status dalam workflow yang sama (masih satu orang yang mengerjakan).
    // Ini aman karena scope-nya terbatas per workflow group, bukan fallback ke orders.
    if (!namaStaff) {
      if (["sedang_dijemput", "sudah_dijemput"].includes(item.status)) {
        namaStaff = findStaffInGroup(["sedang_dijemput", "sudah_dijemput"]);
      } else if (["washing", "selesai_cuci"].includes(item.status)) {
        namaStaff = findStaffInGroup(["washing", "selesai_cuci"]);
      } else if (["sedang_diantar", "selesai"].includes(item.status)) {
        namaStaff = findStaffInGroup(["sedang_diantar", "selesai"]);
      }
    }

    // TIDAK ADA Layer 2 (fallback ke assignedStaffName dari orders.id_staff).
    // Layer 2 adalah sumber utama bug "Rina nempel" — dihapus permanen.

    return {
      id_history: item.id_history,
      status: item.status,
      keterangan: item.keterangan,
      changed_by_role: item.changed_by_role,
      created_at: item.created_at,
      nama_staff: namaStaff, // null kalau memang tidak ada — lebih jujur daripada salah
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

  await insertGpsLog(
    orderId,
    id_staff,
    status || "sedang_diantar",
    latitude,
    longitude,
  );

  return { success: true };
};

// Update status via tombol/scan QR oleh admin atau staff
exports.updateStatus = async (orderId, shopId, payload) => {
  const {
    status,
    keterangan,
    latitude,
    longitude,
    id_staff, // FIX: ini sekarang selalu id_user dari JWT (sudah dibenerin di controller)
    id_detail_orders,
    foto_type,
    is_validation,
  } = payload;

  const normalizedStatus = normalizeStatus(status);

  if (!STATUS_VALID_STAFF.has(normalizedStatus)) {
    throw new Error(
      `Status tidak valid untuk staff. Pilihan: ${[...STATUS_VALID_STAFF].join(", ")}`,
    );
  }

  const { data: orderInfo, error: orderInfoError } = await supabase
    .from("orders")
    .select("status_order, metode_order")
    .eq("id_orders", orderId)
    .eq("id_shops", shopId)
    .single();

  if (orderInfoError) throw orderInfoError;

  const currentStatus = normalizeStatus(orderInfo.status_order);
  const metodeOrder = normalizeStatus(orderInfo.metode_order || "offline");

  const allFlows = [PICKUP_FLOW, WASH_FLOW, DELIVERY_FLOW];
  const isValidTransition = allFlows.some((flow) =>
    isValidFlowTransition(currentStatus, normalizedStatus, flow),
  );

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

  // FIX: resolveStaffIds sekarang menerima id_shops agar tidak nyasar ke staff toko lain.
  // id_staff di sini sudah berupa id_user dari JWT (bukan dari body request Flutter).
  const resolved = await resolveStaffIds(id_staff, shopId);
  const orderStaffId = resolved.id_user; // untuk orders.id_staff
  const historyStaffId = resolved.id_staff; // untuk order_status_history.id_staff

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

  await insertStatusHistory(
    orderId,
    normalizedStatus,
    "staff",
    historyStaffId,
    keterangan,
  );

  if (STATUS_GPS.has(normalizedStatus) && latitude && longitude) {
    await insertGpsLog(
      orderId,
      historyStaffId,
      normalizedStatus,
      latitude,
      longitude,
    );
  }

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
