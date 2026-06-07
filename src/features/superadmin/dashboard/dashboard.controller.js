const dashboardService = require("./dashboard.service");

exports.getDashboardSuperAdmin = async (req, res) => {
  try {
    const role = req.user?.role?.toLowerCase();

    if (role && role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Hanya SuperAdmin yang dapat mengakses dashboard ini",
      });
    }

    const data = await dashboardService.getDashboardData();

    return res.status(200).json({
      success: true,
      message: "Dashboard SuperAdmin berhasil diambil",
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
