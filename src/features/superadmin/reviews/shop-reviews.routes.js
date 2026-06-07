const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../core/services/auth.middleware");
const shopReviewsController = require("./shop-reviews.controller");

const superadminOnly = (req, res, next) => {
  if (String(req.user?.role || "").toLowerCase() !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Hanya SuperAdmin yang dapat mengakses fitur ini",
    });
  }

  return next();
};

router.use(authMiddleware, superadminOnly);

router.get("/shops", shopReviewsController.getReviewShops);
router.get("/shops/:id", shopReviewsController.getReviewShopDetail);
router.patch("/shops/:id/suspend", shopReviewsController.suspendShop);
router.patch("/shops/:id/activate", shopReviewsController.activateShop);

module.exports = router;
