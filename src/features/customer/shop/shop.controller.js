const shopService = require("./shop.service");

exports.getShopProfile = async (req, res) => {
  try {
    const { idShops } = req.params;

    if (!idShops) {
      return res.status(400).json({
        success: false,
        message: "ID Toko (idShops) wajib disertakan",
      });
    }

    const data = await shopService.getShopProfile(Number(idShops));

    // Logika Is Open (Buka/Tutup) berdasarkan hari dan jam operasional
    const now = new Date();
    const jsDay = now.getDay(); // 0 (Sun) - 6 (Sat)
    const todayDayOfWeek = jsDay === 0 ? 7 : jsDay; // Map to 1 (Mon) - 7 (Sun)
    
    const currentTime = now.getHours() * 100 + now.getMinutes(); // Format HHMM

    const parseTime = (timeStr) => {
      if (!timeStr) return null;
      const parts = timeStr.split(":");
      return parseInt(parts[0]) * 100 + parseInt(parts[1]);
    };

    const todayHours = data.operating_hours?.find(h => h.day_of_week === todayDayOfWeek);
    let isOpen = false;

    if (todayHours && todayHours.is_open) {
      data.shop.jam_buka = todayHours.open_time;
      data.shop.jam_tutup = todayHours.close_time;
      
      const jamBuka = parseTime(todayHours.open_time);
      const jamTutup = parseTime(todayHours.close_time);

      if (jamBuka !== null && jamTutup !== null) {
        if (jamTutup < jamBuka) {
          // Lewat tengah malam
          isOpen = currentTime >= jamBuka || currentTime <= jamTutup;
        } else {
          isOpen = currentTime >= jamBuka && currentTime <= jamTutup;
        }
      }
    } else if (todayHours && !todayHours.is_open) {
      data.shop.jam_buka = "Tutup";
      data.shop.jam_tutup = "Tutup";
    }

    data.shop.is_open = isOpen;

    return res.status(200).json({
      success: true,
      message: "Profil toko berhasil diambil",
      data,
    });
  } catch (error) {
    console.error("[getShopProfile] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil profil toko",
    });
  }
};

exports.registerShop = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    if (!id_user) {
      return res.status(401).json({
        success: false,
        message: "User tidak terautentikasi"
      });
    }

    const files = req.files || {};
    const foto_toko_file = files["foto_toko"] ? files["foto_toko"][0] : null;
    const foto_ktp_file = files["foto_ktp"] ? files["foto_ktp"][0] : null;

    if (!foto_toko_file || !foto_ktp_file) {
      return res.status(400).json({
        success: false,
        message: "Foto toko dan Foto KTP wajib diunggah"
      });
    }

    const data = await shopService.registerShop(id_user, req.body, {
      foto_toko_file,
      foto_ktp_file
    });

    return res.status(201).json({
      success: true,
      message: "Pendaftaran toko berhasil diajukan",
      data
    });
  } catch (error) {
    console.error("[registerShop] Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Gagal mengajukan pendaftaran toko"
    });
  }
};

