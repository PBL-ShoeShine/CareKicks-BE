const { getBankAccounts, confirmPayment } = require("./payment.service");
const supabase = require("../../../config/supabase"); // ← Pastikan path import supabase.js ini sudah benar sesuai foldermu

const getBankAccountsHandler = async (req, res) => {
  // ... (kode ini tetap sama persis seperti sebelumnya)
};

const confirmPaymentHandler = async (req, res) => {
  try {
    const { order_id } = req.body; // Mengambil teks order_id
    const file = req.file; // Mengambil file gambar dari multer

    // 1. Cek apakah user mengirimkan ID dan gambar
    if (!order_id || !file) {
      return res.status(400).json({
        status: "error",
        message:
          "order_id dan file bukti pembayaran (payment_proof) wajib dikirim",
      });
    }

    // 2. Upload gambar ke Supabase Storage
    // Pastikan kamu sudah membuat bucket bernama 'payment_proofs' di Supabase
    const fileName = `payment_${Date.now()}_${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("payment_proofs") // ← Ganti dengan nama bucket di Supabasemu
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      throw new Error(
        "Gagal mengunggah gambar ke penyimpanan: " + uploadError.message,
      );
    }

    // 3. Dapatkan URL Publik dari gambar yang baru diupload
    const { data: publicUrlData } = supabase.storage
      .from("payment_proofs")
      .getPublicUrl(fileName);

    const payment_proof_url = publicUrlData.publicUrl;

    // 4. Simpan order_id dan URL gambar ke Database (pakai service lamamu)
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
