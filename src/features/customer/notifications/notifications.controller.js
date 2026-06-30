const notificationsService = require("./notifications.service");

exports.registerFcmToken = async (req, res) => {
  try {
    const data = await notificationsService.registerFcmToken(req.user, req.body);
    return res.status(200).json({
      success: true,
      message: "Token notifikasi berhasil disimpan",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
