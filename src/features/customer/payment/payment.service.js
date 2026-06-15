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

const getBankAccounts = async (orderId) => {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id_shops")
    .eq("id_orders", orderId)
    .single();

  if (orderError) throw new Error(orderError.message);
  if (!order) throw new Error("Pesanan tidak ditemukan");

  const { data, error } = await supabase
    .from("account")
    .select("*")
    .eq("id_shops", order.id_shops);

  if (error) throw new Error(error.message);
  return data;
};

const confirmPayment = async (orderId, paymentProofUrl) => {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id_orders, kode_order, total_ongkir, status_order")
    .eq("id_orders", orderId)
    .single();

  if (orderError) throw new Error(orderError.message);
  if (!order) throw new Error("Pesanan tidak ditemukan");

  // Validasi status harus menunggu_pembayaran dulu
  if (order.status_order !== "menunggu_pembayaran") {
    throw new Error("Pesanan tidak dalam status menunggu pembayaran.");
  }

  // Simpan bukti bayar + update status pembayaran & status order
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      upload_bkt_byr: paymentProofUrl,
      status_pembayaran: "unpaid",
      status_order: "menunggu_konfirmasi",
      alasan_tolak_pembayaran: null,
    })
    .eq("id_orders", orderId);

  if (updateError) throw new Error(updateError.message);

  // Insert ke order_status_history
  await insertStatusHistory(
    orderId,
    "menunggu_konfirmasi",
    "customer",
    null,
    "Customer telah mengupload bukti pembayaran",
  );

  return {
    kode_order: order.kode_order,
    total_ongkir: order.total_ongkir,
  };
};

module.exports = { getBankAccounts, confirmPayment };
