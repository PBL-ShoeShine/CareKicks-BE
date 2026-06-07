const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../core/services/auth.middleware");
const dashboardController = require("./dashboard.controller");

router.get("/", authMiddleware, dashboardController.getDashboardSuperAdmin);

module.exports = router;
