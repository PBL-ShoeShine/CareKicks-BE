const express = require("express");
const router = express.Router();
const {
  getBankAccountsHandler,
  confirmPaymentHandler,
} = require("./payment.controller");
const authMiddleware = require("../../../core/middlewares/authMiddleware");

router.get("/bank-accounts", authMiddleware, getBankAccountsHandler);
router.post("/confirm", authMiddleware, confirmPaymentHandler);

module.exports = router;
