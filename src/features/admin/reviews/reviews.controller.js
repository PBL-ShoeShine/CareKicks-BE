const reviewsService = require("./reviews.service");

exports.getReviews = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const data = await reviewsService.getReviews({
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10
    });
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
