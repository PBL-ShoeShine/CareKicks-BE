const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../core/services/auth.middleware");
const notificationsController = require("./notifications.controller");

router.post(
  "/fcm-token",
  authMiddleware,
  notificationsController.registerFcmToken,
);

module.exports = router;
