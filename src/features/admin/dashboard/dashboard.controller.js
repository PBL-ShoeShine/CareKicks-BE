const dashboardService = require("./dashboard.service");

exports.getDashboardAdmin = async (req, res) => {
  try {
    // sementara hardcode dulu
     const idUser = req.user.id;

    const data = await dashboardService.getDashboardData(idUser);

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
