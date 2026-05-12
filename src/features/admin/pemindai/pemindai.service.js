const supabase = require("../../../core/config/supabase");

/**
 * Fungsi untuk mengambil detail pesanan berdasarkan QR Code
 * @param {string} qrLink - Teks atau link dari QR Code hasil pindaian
 * @returns {object} data - Objek JSON berisi detail order, customer, dan layanan
 */
exports.getDetailByQR = async (qrLink) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id_orders,
      kode_order,
      tgl_order,
      status_order,
      link_qr,
      customers (
        nama,
        alamat
      ),
      detail_orders (
        merk,
        jenis_sepatu,
        warna,
        foto_sebelum,
        services (
          nama_layanan,
          harga
        )
      )
    `)
    .eq("kode_order", qrLink) // Mencari baris yang nilai link_qr-nya sama dengan parameter
    .single(); // .single() memaksa kembalian berupa 1 objek (bukan array)

  if (error || !data) {
    const err = new Error("Data pesanan untuk QR ini tidak ditemukan");
    err.status = 404; // Status ini akan dibaca oleh pemindai.controller.js
    throw err;
  }

  // Jika sukses, kembalikan bongkahan data ke Controller
  return data;
};