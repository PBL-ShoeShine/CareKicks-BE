const { getBankAccounts, confirmPayment } = require("./payment.service");

const getBankAccountsHandler = async (req, res) => {
  try {
    const data = await getBankAccounts();
    return res.status(200).json({
      status: "success",
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
    const { order_id, payment_proof_url } = req.body;

    if (!order_id || !payment_proof_url) {
      return res.status(400).json({
        status: "error",
        message: "order_id dan payment_proof_url wajib diisi",
      });
    }

    const data = await confirmPayment(order_id, payment_proof_url);

    return res.status(200).json({
      status: "success",
      message: "Pesanan Berhasil, pesananmu telah diterima dan sedang diproses",
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

module.exports = { getBankAccountsHandler, confirmPaymentHandler };
