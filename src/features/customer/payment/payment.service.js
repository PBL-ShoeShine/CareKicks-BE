const supabase = require("../../../core/config/supabase");

// ambil daftar rekening bank aktif
const getBankAccounts = async () => {
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("is_active", true);

  if (error) throw new Error(error.message);
  return data;
};

// konfirmasi pembayaran (upload bukti transfer)
const confirmPayment = async (orderId, paymentProofUrl) => {
  // cek apakah order ada
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_number")
    .eq("id", orderId)
    .single();

  if (orderError) throw new Error(orderError.message);
  if (!order) throw new Error("Pesanan tidak ditemukan");

  // update payment dengan bukti transfer
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .update({
      payment_proof_url: paymentProofUrl,
      payment_status: "berhasil",
      paid_at: new Date().toISOString(),
    })
    .eq("order_id", orderId)
    .select()
    .single();

  if (paymentError) throw new Error(paymentError.message);

  // update status order jadi di_proses
  await supabase
    .from("orders")
    .update({ status: "di_proses" })
    .eq("id", orderId);

  return {
    order_number: order.order_number,
    total_amount: payment.total_amount,
  };
};

module.exports = { getBankAccounts, confirmPayment };
