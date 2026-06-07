const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../core/services/auth.middleware");
const shopAppealsController = require("./shop-appeals.controller");

const uploadAppealEvidence = (req, res, next) => {
  req.app.upload.fields([
    { name: "evidence_images", maxCount: 10 },
    { name: "evidence_images[]", maxCount: 10 },
  ])(req, res, next);
};

const shopsAdminOnly = (req, res, next) => {
  if (String(req.user?.role || "").toLowerCase() !== "shops_admin") {
    return res.status(403).json({
      success: false,
      message: "Hanya admin toko yang dapat mengakses fitur banding",
    });
  }

  return next();
};

router.use(authMiddleware, shopsAdminOnly);

router.get("/my", shopAppealsController.getMyAppeals);
router.post("/", uploadAppealEvidence, shopAppealsController.createAppeal);

module.exports = router;
