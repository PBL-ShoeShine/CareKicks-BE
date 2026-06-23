const ongkirService = require("./ongkir.service");

// GET /api/v1/admin/ongkir
exports.getOngkirSetting = async (req, res) => {
  try {
    const data = await ongkirService.getOngkirSetting(req.user);

    return res.status(200).json({
      status: "success",
      message: "Pengaturan ongkir berhasil diambil",
      data,
    });
  } catch (error) {
    console.error("[getOngkirSetting] Error:", error.message);
    return res.status(404).json({
      status: "error",
      message: error.message || "Gagal mengambil pengaturan ongkir",
    });
  }
};

// PUT /api/v1/admin/ongkir
exports.updateOngkirSetting = async (req, res) => {
  try {
    const {
      jarak_gratis_km,
      tarif_per_km,
      jarak_maksimal_km,
      tarif_per_km_luar_radius,
    } = req.body;

    // ─── Validasi ────────────────────────────────────────────────
    const fields = {
      jarak_gratis_km,
      tarif_per_km,
      jarak_maksimal_km,
      tarif_per_km_luar_radius,
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null || isNaN(Number(value))) {
        return res.status(400).json({
          status: "error",
          message: `${key} wajib diisi dengan angka`,
        });
      }
      if (Number(value) < 0) {
        return res.status(400).json({
          status: "error",
          message: `${key} tidak boleh bernilai negatif`,
        });
      }
    }

    if (Number(jarak_gratis_km) > Number(jarak_maksimal_km)) {
      return res.status(400).json({
        status: "error",
        message: "Jarak gratis tidak boleh lebih besar dari jarak maksimal",
      });
    }

    const data = await ongkirService.updateOngkirSetting(req.user, {
      jarak_gratis_km: Number(jarak_gratis_km),
      tarif_per_km: Number(tarif_per_km),
      jarak_maksimal_km: Number(jarak_maksimal_km),
      tarif_per_km_luar_radius: Number(tarif_per_km_luar_radius),
    });

    return res.status(200).json({
      status: "success",
      message: "Pengaturan ongkir berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.error("[updateOngkirSetting] Error:", error.message);
    return res.status(404).json({
      status: "error",
      message: error.message || "Gagal memperbarui pengaturan ongkir",
    });
  }
};
