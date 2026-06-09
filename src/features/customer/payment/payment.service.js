const supabase = require("../../../core/config/supabase");

const getBankAccounts = async (orderId) => {
  // Ambil id_shops dari order dulu
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id_shops")
    .eq("id_orders", orderId)
    .single();

  if (orderError) throw new Error(orderError.message);
  if (!order) throw new Error("Pesanan tidak ditemukan");

  // Ambil rekening sesuai toko
  const { data, error } = await supabase
    .from("account")
    .select("*")
    .eq("id_shops", order.id_shops);

  if (error) throw new Error(error.message);
  return data;
};

const confirmPayment = async (orderId, paymentProofUrl) => {
  // Cek order ada
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id_orders, kode_order, total_ongkir")
    .eq("id_orders", orderId)
    .single();

  if (orderError) throw new Error(orderError.message);
  if (!order) throw new Error("Pesanan tidak ditemukan");

  // Simpan URL bukti bayar + update status pembayaran
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      upload_bkt_byr: paymentProofUrl,
      status_pembayaran: "menunggu_verifikasi",
    })
    .eq("id_orders", orderId);

  if (updateError) throw new Error(updateError.message);

  return {
    kode_order: order.kode_order,
    total_ongkir: order.total_ongkir,
  };
};

module.exports = { getBankAccounts, confirmPayment };
