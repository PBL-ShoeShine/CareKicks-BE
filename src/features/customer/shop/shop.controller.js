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
