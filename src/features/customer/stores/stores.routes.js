const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../core/services/auth.middleware");
const upload = require("../../../core/services/upload.middleware");
const storesController = require("./stores.controller");

const customerOnly = (req, res, next) => {
  if (String(req.user?.role || "").toLowerCase() !== "customer") {
    return res.status(403).json({
      success: false,
      message: "Hanya customer yang dapat mendaftarkan toko",
    });
  }

  return next();
};

const registrationStatusAccess = (req, res, next) => {
  const role = String(req.user?.role || "").toLowerCase();

  if (!["customer", "shops_admin"].includes(role)) {
    return res.status(403).json({
      success: false,
      message: "Hanya customer atau admin toko yang dapat melihat status pendaftaran toko",
    });
  }

  return next();
};

router.use(authMiddleware);

router.get("/my-registration", registrationStatusAccess, storesController.getMyRegistration);
router.post(
  "/register",
  customerOnly,
  upload.fields([
    { name: "foto_ktp", maxCount: 1 },
    { name: "foto_toko", maxCount: 1 },
  ]),
  storesController.registerStore,
);

module.exports = router;
