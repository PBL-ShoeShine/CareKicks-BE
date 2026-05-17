const dashboardService = require("./dashboard.service");

exports.getDashboardAdmin = async (req, res) => {
  try {
    const idUser = req.user.id;
    const { status, search, limit } = req.query;

    const data = await dashboardService.getDashboardData(idUser, {
      status,
      search,
      limit: limit ? parseInt(limit) : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard berhasil diambil",
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
