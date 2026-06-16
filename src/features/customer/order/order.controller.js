const orderService = require("./order.service");

// POST /api/v1/customer/order
exports.createOnlineOrder = async (req, res) => {
  try {
    const userId = req.user.id; // id_user dari JWT

    const {
      id_shops,
      nama_pemilik,
      no_hp,
      alamat,
      lat_order,
      long_order,
      catatan,
    } = req.body;

    // Parse services dari JSON string (karena dikirim bersama multipart/form-data)
    let services = req.body.services;
    if (typeof services === "string") {
      try {
        services = JSON.parse(services);
      } catch {
        return res.status(400).json({
          status: "error",
          message:
            'Format services tidak valid. Gunakan JSON array, contoh: [{"id_services":1},{"id_services":2}]',
        });
      }
    }

    // ─── Validasi field wajib ──────────────────────────────────────────────
    if (!id_shops) {
      return res.status(400).json({
        status: "error",
        message: "id_shops wajib diisi",
      });
    }

    if (!nama_pemilik || nama_pemilik.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "nama_pemilik wajib diisi",
      });
    }

    if (!no_hp || no_hp.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "no_hp wajib diisi",
      });
    }

    if (!alamat || alamat.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "alamat wajib diisi",
      });
    }

    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Pilih minimal satu layanan",
      });
    }

    // Validasi setiap item services
    for (const svc of services) {
      if (!svc.id_services) {
        return res.status(400).json({
          status: "error",
          message: "Setiap layanan wajib memiliki id_services",
        });
      }
    }

    const result = await orderService.createOnlineOrder({
      userId,
      id_shops: Number(id_shops),
      nama_pemilik: nama_pemilik.trim(),
      no_hp: no_hp.trim(),
      alamat: alamat.trim(),
      lat_order: lat_order ? parseFloat(lat_order) : null,
      long_order: long_order ? parseFloat(long_order) : null,
      catatan: catatan?.trim() || null,
      services,
      fotoFile: req.file || null,
    });

    return res.status(201).json({
      status: "success",
      message: "Pesanan berhasil dibuat. Silakan lakukan pembayaran.",
      data: result,
    });
  } catch (error) {
    console.error("[createOnlineOrder] Error:", error.message);

    if (error.message.includes("tidak ditemukan")) {
      return res.status(404).json({
        status: "error",
        message: error.message,
      });
    }

    return res.status(500).json({
      status: "error",
      message: error.message || "Terjadi kesalahan pada server",
    });
  }
};

// GET /api/v1/customer/order/services/:idShops
exports.getServicesByShop = async (req, res) => {
  try {
    const { idShops } = req.params;

    if (!idShops || isNaN(Number(idShops))) {
      return res.status(400).json({
        status: "error",
        message: "idShops tidak valid",
      });
    }

    const data = await orderService.getServicesByShop(Number(idShops));

    return res.status(200).json({
      status: "success",
      message: "Daftar layanan berhasil diambil",
      data,
    });
  } catch (error) {
    console.error("[getServicesByShop] Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message || "Gagal mengambil layanan",
    });
  }
};
