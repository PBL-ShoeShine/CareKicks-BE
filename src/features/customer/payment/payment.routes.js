const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const {
  getBankAccountsHandler,
  confirmPaymentHandler,
} = require("./payment.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

router.get("/bank-accounts", authMiddleware, getBankAccountsHandler);
router.post(
  "/confirm",
  authMiddleware,
  upload.single("payment_proof"), //
  confirmPaymentHandler,
);

module.exports = router;
