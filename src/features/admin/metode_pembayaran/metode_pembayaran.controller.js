const paymentService = require("./metode_pembayaran.service");
const shopAccess = require("../../../core/services/shop-access.service");
const supabase = require("../../../core/config/supabase");

// Helper: Verifikasi dan Ambil ID Toko
const getShopId = async (req) => {
  const shopData = await shopAccess.getShopForUser(req.user);
  if (!shopData || !shopData.shop) {
    throw new Error("Anda tidak memiliki akses ke toko mana pun.");
  }
  return shopData.shop.id_shops;
};

exports.getPaymentMethods = async (req, res) => {
  try {
    const idShops = await getShopId(req);
    const data = await paymentService.getPaymentMethods(idShops);

    return res.status(200).json({
      success: true,
      message: "Data metode pembayaran berhasil diambil",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addPaymentMethod = async (req, res) => {
  try {
    const idShops = await getShopId(req);
    // Disesuaikan dengan nama kolom di tabel 'account'
    const { tipe_pembayaran, nama_bank, no_rek, atas_nama, is_default } =
      req.body;

    if (!tipe_pembayaran || !nama_bank || !no_rek || !atas_nama) {
      return res
        .status(400)
        .json({ success: false, message: "Semua kolom wajib diisi." });
    }

    const payload = {
      id_shops: idShops,
      tipe_pembayaran,
      nama_bank,
      no_rek,
      atas_nama,
      is_active: true,
      is_default: is_default || false,
    };

    const data = await paymentService.addPaymentMethod(payload);

    return res.status(201).json({
      success: true,
      message: "Metode pembayaran berhasil ditambahkan",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePaymentMethod = async (req, res) => {
  try {
    const idShops = await getShopId(req);
    const idAccount = req.params.id;
    const { nama_bank, no_rek, atas_nama, is_default } = req.body;

    const payload = {};
    if (nama_bank) payload.nama_bank = nama_bank;
    if (no_rek) payload.no_rek = no_rek;
    if (atas_nama) payload.atas_nama = atas_nama;
    if (is_default !== undefined) payload.is_default = is_default;

    const data = await paymentService.updatePaymentMethod(
      idAccount,
      idShops,
      payload,
    );

    return res.status(200).json({
      success: true,
      message: "Metode pembayaran berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const idShops = await getShopId(req);
    const idAccount = req.params.id;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Status harus berupa boolean (true/false).",
        });
    }

    const data = await paymentService.updatePaymentMethod(idAccount, idShops, {
      is_active,
    });

    return res.status(200).json({
      success: true,
      message: `Metode pembayaran berhasil di${is_active ? "aktif" : "nonaktif"}kan`,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePaymentMethod = async (req, res) => {
  try {
    const idShops = await getShopId(req);
    const idAccount = req.params.id;

    await paymentService.deletePaymentMethod(idAccount, idShops);

    return res.status(200).json({
      success: true,
      message: "Metode pembayaran berhasil dihapus",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadQrisImage = async (req, res) => {
  try {
    const idShops = await getShopId(req);
    const idAccount = req.params.id;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "File gambar QRIS tidak ditemukan." });
    }

    const file = req.file;
    const ext = file.originalname.split(".").pop() || "jpg";

    // Penamaan file: qris/id_toko/id_account_timestamp.jpg
    const filePath = `qris/${idShops}/${idAccount}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("services")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw new Error("Gagal mengunggah gambar QRIS: " + uploadError.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from("services")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // Update kolom path_qris di database
    const data = await paymentService.updatePaymentMethod(idAccount, idShops, {
      path_qris: publicUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Gambar QRIS berhasil diunggah",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
