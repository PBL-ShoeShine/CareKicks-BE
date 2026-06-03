const { getBankAccounts, confirmPayment } = require("./payment.service");
const supabase = require("../../../core/config/supabase");

const getBankAccountsHandler = async (req, res) => {
  try {
    const data = await getBankAccounts();

    return res.status(200).json({
      status: "success",
      message: "Berhasil mengambil data rekening bank",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const confirmPaymentHandler = async (req, res) => {
  try {
    const { order_id } = req.body;
    const file = req.file;

    if (!order_id || !file) {
      return res.status(400).json({
        status: "error",
        message: "order_id dan file bukti pembayaran wajib dikirim",
      });
    }

    const safeFileName = file.originalname.replace(/\s+/g, "_");
    const fileName = `payment_${Date.now()}_${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("payment_proofs")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Gagal mengunggah gambar: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("services")
      .getPublicUrl(fileName);

    const payment_proof_url = publicUrlData.publicUrl;

    const data = await confirmPayment(order_id, payment_proof_url);

    return res.status(200).json({
      status: "success",
      message: "Pesanan berhasil, pesananmu telah diterima dan sedang diproses",
      data,
    });
  } catch (error) {
    if (error.message === "Pesanan tidak ditemukan") {
      return res.status(404).json({
        status: "error",
        message: error.message,
      });
    }

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  getBankAccountsHandler,
  confirmPaymentHandler,
};
