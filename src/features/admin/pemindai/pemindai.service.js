const supabase = require("../../../core/config/supabase");
const { resolveStaffIds } = require("../../../core/services/resolve-staff-id");

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

const STATUS_VALID_SCAN = new Set([
  "sedang_dijemput",
  "sudah_dijemput",
  "washing",
  "selesai_cuci",
  "sedang_diantar",
  "selesai",
]);

// Fungsi cari data order by QR
exports.getDetailByQR = async (qrText, idShopsAdmin) => {
  const cleanInput = qrText.trim();
  let targetSearchText = cleanInput;

  if (cleanInput.includes("data=ORD")) {
    const parts = cleanInput.split("data=");
    if (parts.length > 1) {
      targetSearchText = parts[1].trim();
    }
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      customers (nama, alamat),
      detail_orders (
        merk,
        jenis_sepatu,
        warna,
        catatan,
        services (nama_layanan, harga)
      )
    `,
    )
    .eq("kode_order", targetSearchText);

  if (error || !data || data.length === 0) {
    const err = new Error("Data pesanan tidak ditemukan.");
    err.status = 404;
    throw err;
  }

  const orderResult = data[0];

  const shopIdFromDB = orderResult.id_shops || orderResult.id_toko;
  if (shopIdFromDB && shopIdFromDB !== idShopsAdmin) {
    console.log(
      `[SECURITY BLOCK]: Admin Toko (ID: ${idShopsAdmin}) mencoba scan QR dari Toko lain (ID: ${shopIdFromDB})`,
    );
    const err = new Error(
      "Akses Ditolak: Kode QR ini bukan pesanan dari toko Anda!",
    );
    err.status = 403;
    throw err;
  }

  // Sinkronisasi alamat
  if (!orderResult.alamat_pengantaran && orderResult.customers) {
    orderResult.alamat_pengantaran = orderResult.customers.alamat;
  }
  if (orderResult.customers && !orderResult.customers.alamat) {
    orderResult.customers.alamat = orderResult.alamat_pengantaran;
  }

  return orderResult;
};

// Fungsi update status via scan QR oleh admin/staff
exports.updateStatusOrder = async (
  kodeOrder,
  newStatus,
  idStaff = null,
  idShopsAdmin,
) => {
  const cleanKode = kodeOrder.trim();
  const normalizedStatus = newStatus.trim().toLowerCase();

  if (!STATUS_VALID_SCAN.has(normalizedStatus)) {
    const err = new Error(
      `Status tidak valid. Pilihan: ${[...STATUS_VALID_SCAN].join(", ")}`,
    );
    err.status = 400;
    throw err;
  }

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("kode_order", cleanKode)
    .single();

  if (orderError || !orderData) {
    const err = new Error(`Gagal: Tidak ada pesanan dengan kode ${cleanKode}`);
    err.status = 404;
    throw err;
  }

  const shopIdFromDB = orderData.id_shops || orderData.id_toko;
  if (shopIdFromDB && shopIdFromDB !== idShopsAdmin) {
    const err = new Error(
      "Akses Ditolak: Anda tidak memiliki izin untuk mengupdate pesanan dari toko lain.",
    );
    err.status = 403;
    throw err;
  }

  if (orderData.metode_order === "offline") {
    if (
      ["sedang_dijemput", "sudah_dijemput", "sedang_diantar"].includes(
        normalizedStatus,
      )
    ) {
      const err = new Error(
        "Order offline tidak memiliki proses pickup/delivery.",
      );
      err.status = 400;
      throw err;
    }
  }

  // FIX: pass idShopsAdmin agar tidak nyasar ke staff toko lain
  // idStaff di sini sudah berupa id_user dari JWT (sudah dibenerin di controller)
  const resolved = await resolveStaffIds(idStaff, idShopsAdmin);
  const orderStaffId = resolved.id_user;
  const historyStaffId = resolved.id_staff;

  const updatePayload = { status_order: normalizedStatus };
  if (orderStaffId) {
    updatePayload.id_staff = orderStaffId;
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("kode_order", cleanKode);

  if (updateError) {
    const err = new Error(updateError.message);
    err.status = 500;
    throw err;
  }

  const keteranganMap = {
    sedang_dijemput: "Staff dalam perjalanan menjemput sepatu",
    sudah_dijemput: "Sepatu berhasil dijemput, dalam perjalanan ke toko",
    washing: "Proses pencucian sepatu dimulai",
    selesai_cuci: "Pencucian selesai",
    sedang_diantar: "Staff dalam perjalanan mengantarkan sepatu",
    selesai: "Sepatu telah diterima customer",
  };

  await insertStatusHistory(
    orderData.id_orders,
    normalizedStatus,
    "staff",
    historyStaffId,
    keteranganMap[normalizedStatus] ?? null,
  );

  return { id_orders: orderData.id_orders, status_order: normalizedStatus };
};
