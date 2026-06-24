const supabase = require("../../../core/config/supabase");

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

// Status valid yang boleh di-scan oleh staff via QR
const STATUS_VALID_SCAN = new Set([
  "sedang_dijemput",
  "sudah_dijemput",
  "washing",
  "selesai_cuci",
  "sedang_diantar",
  "selesai",
]);

// Fungsi cari data order by QR
exports.getDetailByQR = async (qrText) => {
  const cleanInput = qrText.trim();
  let targetSearchText = cleanInput;

  console.log("\n[PROSES PARSING BACKEND]:", cleanInput);

  if (cleanInput.includes("data=ORD")) {
    const parts = cleanInput.split("data=");
    if (parts.length > 1) {
      targetSearchText = parts[1].trim();
      console.log("[HASIL EKSTRAKSI URL QR]:", targetSearchText);
    }
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id_orders,
      kode_order,
      tgl_order,
      status_order,
      metode_order,
      metode_bayar,
      metode_pengambilan,
      alamat_pengantaran,
      link_qr,
      id_staff,
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

  if (error) console.log("\n[ALASAN DITOLAK SUPABASE]:", error.message);

  if (error || !data || data.length === 0) {
    const err = new Error(
      `Data tidak ditemukan untuk input: ${targetSearchText}`,
    );
    err.status = 404;
    throw err;
  }

  const orderResult = data[0];

  // Sinkronisasi alamat
  if (!orderResult.alamat_pengantaran && orderResult.customers) {
    orderResult.alamat_pengantaran = orderResult.customers.alamat;
  }
  if (orderResult.customers && !orderResult.customers.alamat) {
    orderResult.customers.alamat = orderResult.alamat_pengantaran;
  }

  console.log("[DATA DIKIRIM KE FLUTTER]:", {
    kode_order: orderResult.kode_order,
    status_order: orderResult.status_order,
    metode_order: orderResult.metode_order,
    alamat_pengantaran: orderResult.alamat_pengantaran,
    customer_alamat: orderResult.customers?.alamat ?? "Tidak ada",
  });

  return orderResult;
};

// Fungsi update status via scan QR oleh staff
exports.updateStatusOrder = async (kodeOrder, newStatus, idStaff = null) => {
  const cleanKode = kodeOrder.trim();
  const normalizedStatus = newStatus.trim().toLowerCase();

  // Validasi status harus pakai enum baru
  if (!STATUS_VALID_SCAN.has(normalizedStatus)) {
    const err = new Error(
      `Status tidak valid. Pilihan: ${[...STATUS_VALID_SCAN].join(", ")}`,
    );
    err.status = 400;
    throw err;
  }

  // Ambil data order dulu untuk dapat id_orders dan validasi
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("id_orders, status_order, metode_order")
    .eq("kode_order", cleanKode)
    .single();

  if (orderError || !orderData) {
    const err = new Error(`Gagal: Tidak ada pesanan dengan kode ${cleanKode}`);
    err.status = 404;
    throw err;
  }

  // Validasi order offline tidak boleh scan status pickup/delivery
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

  // --- PERBAIKAN: MENYIMPAN ID STAFF KE TABEL ORDERS ---
  const updatePayload = { status_order: normalizedStatus };
  if (idStaff) {
    updatePayload.id_staff = idStaff;
  }

  // Update cache status dan id_staff di tabel orders
  const { error: updateError } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("kode_order", cleanKode);

  if (updateError) {
    const err = new Error(updateError.message);
    err.status = 500;
    throw err;
  }

  // Insert ke order_status_history
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
    idStaff,
    keteranganMap[normalizedStatus] ?? null,
  );

  return { id_orders: orderData.id_orders, status_order: normalizedStatus };
};

const generateQRCode = (kode_order) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(kode_order)}`;
  const filename = `qr_${kode_order}_${Date.now()}.png`;
  return {
    url: qrUrl,
    filename: filename,
  };
};