const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../core/services/auth.middleware");
const shopVerificationsController = require("./shop-verifications.controller");

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

router.get("/shops", shopVerificationsController.getShopVerifications);
router.get("/shops/:id", shopVerificationsController.getShopVerificationDetail);
router.patch("/shops/:id/status", shopVerificationsController.updateShopVerificationStatus);

module.exports = router;
