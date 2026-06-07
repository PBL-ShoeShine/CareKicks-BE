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

router.use(authMiddleware, customerOnly);

router.post(
  "/register",
  upload.fields([
    { name: "foto_ktp", maxCount: 1 },
    { name: "foto_toko", maxCount: 1 },
  ]),
  storesController.registerStore,
);
router.get("/my-registration", storesController.getMyRegistration);

module.exports = router;
