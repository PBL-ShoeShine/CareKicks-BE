const superadminService = require("./superadmin.service");

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const data = await superadminService.getDashboardSummary();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
