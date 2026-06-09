const { getBankAccounts, confirmPayment } = require("./payment.service");
const supabase = require("../../../core/config/supabase");

const getBankAccountsHandler = async (req, res) => {
  try {
    const { order_id } = req.query;

    if (!order_id) {
      return res.status(400).json({
        status: "error",
        message: "order_id wajib dikirim",
      });
    }

    const data = await getBankAccounts(order_id);

    return res.status(200).json({
      status: "success",
      message: "Berhasil mengambil data rekening",
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
    const fileName = `payment/${Date.now()}_${safeFileName}`;

    // Upload ke bucket services folder payment
    const { error: uploadError } = await supabase.storage
      .from("services")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Gagal mengunggah gambar: ${uploadError.message}`);
    }

    // Get public URL dari bucket services
    const { data: publicUrlData } = supabase.storage
      .from("services")
      .getPublicUrl(fileName);

    const paymentProofUrl = publicUrlData.publicUrl;

    const data = await confirmPayment(order_id, paymentProofUrl);

    return res.status(200).json({
      status: "success",
      message: "Bukti pembayaran berhasil dikirim, menunggu verifikasi admin",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = { getBankAccountsHandler, confirmPaymentHandler };
