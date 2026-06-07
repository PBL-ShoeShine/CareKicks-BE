const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../core/services/auth.middleware");
const shopAppealsController = require("./shop-appeals.controller");

const superadminOnly = (req, res, next) => {
  if (String(req.user?.role || "").toLowerCase() !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Hanya SuperAdmin yang dapat mengakses fitur banding toko",
    });
  }

  return next();
};

router.use(authMiddleware, superadminOnly);

router.get("/", shopAppealsController.getAppeals);
router.get("/:id", shopAppealsController.getAppealDetail);
router.patch("/:id/approve", shopAppealsController.approveAppeal);
router.patch("/:id/reject", shopAppealsController.rejectAppeal);

module.exports = router;
