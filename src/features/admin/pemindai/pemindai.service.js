const supabase = require("../../../core/config/supabase");

// FUNGSI CARI DATA (SMART EXTRACT QR SEARCH)
exports.getDetailByQR = async (qrText) => {
  const cleanInput = qrText.trim();
  let targetSearchText = cleanInput;

  console.log("\n[PROSES PARSING BACKEND]:", cleanInput);

  // Jika input dari kamera adalah URL link QR Server, potong otomatis diambil ujung kodenya saja
  if (cleanInput.includes("data=ORD")) {
    const parts = cleanInput.split("data=");
    if (parts.length > 1) {
      targetSearchText = parts[1].trim();
      console.log("[HASIL EKSTRAKSI URL QR]:", targetSearchText);
    }
  }

  // QUERY BERSIH
  let query = supabase
    .from("orders")
    .select(`
      id_orders,
      kode_order,
      tgl_order,
      status_order,
      metode_pengambilan,
      alamat_pengantaran,
      link_qr,
      customers (nama, alamat),
      detail_orders (
        merk, 
        jenis_sepatu, 
        warna,
        catatan,
        services (nama_layanan, harga)
      )
    `)
    .eq("kode_order", targetSearchText); 

  // EKSEKUSI QUERY DENGAN AWAIT
  const { data, error } = await query;

  if (error) {
    console.log("\n[ALASAN DITOLAK SUPABASE]:", error.message);
  }

  if (error || !data || data.length === 0) {
    const err = new Error(`Data tidak ditemukan untuk input: ${targetSearchText}`);
    err.status = 404;
    throw err;
  }
  
  // Ambil objek order pertama
  const orderResult = data[0];

  // SINKRONISASI ALAMAT: Jika alamat_pengantaran bawaan kosong, backup pakai alamat customer
  if (!orderResult.alamat_pengantaran && orderResult.customers) {
    orderResult.alamat_pengantaran = orderResult.customers.alamat;
  }

  // Sebaliknya, jika di Flutter memanggil customers.alamat tapi kosong, isi dengan alamat_pengantaran
  if (orderResult.customers && !orderResult.customers.alamat) {
    orderResult.customers.alamat = orderResult.alamat_pengantaran;
  }
  
  console.log("[DATA DIKIRIM KE FLUTTER]:", {
    kode_order: orderResult.kode_order,
    alamat_pengantaran: orderResult.alamat_pengantaran,
    customer_alamat: orderResult.customers ? orderResult.customers.alamat : 'Tidak ada'
  });

  return orderResult;
};

// FUNGSI UPDATE STATUS - MURNI HANYA UPDATE TABEL ORDERS SAJA
exports.updateStatusOrder = async (kodeOrder, newStatus) => {
  const cleanKode = kodeOrder.trim(); 

  let statusDatabase = newStatus.toLowerCase();
  if (statusDatabase === 'washing' || statusDatabase === 'sedang diproses') {
    statusDatabase = 'dicuci';
  } else if (statusDatabase === 'selesai' && newStatus !== 'selesai diantar') {
    statusDatabase = 'siap_ambil';
  }

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .update({ status_order: statusDatabase })
    .eq("kode_order", cleanKode)
    .select("id_orders"); 

  if (orderError) {
    const err = new Error(orderError.message);
    err.status = 500;
    throw err;
  }

  if (!orderData || orderData.length === 0) {
    const err = new Error(`Gagal: Tidak ada pesanan dengan kode ${cleanKode}`);
    err.status = 404;
    throw err;
  }

  return orderData;
};