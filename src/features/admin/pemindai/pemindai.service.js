const supabase = require("../../../core/config/supabase");

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
    .eq("link_qr", qrLink)
    .single();

  if (error || !data) {
    const err = new Error("Data pesanan untuk QR ini tidak ditemukan");
    err.status = 404;
    throw err;
  }

  return data;
};