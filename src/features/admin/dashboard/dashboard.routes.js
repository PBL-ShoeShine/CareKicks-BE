const express = require("express");
const router = express.Router();

const dashboardController = require("./dashboard.controller");

const authMiddleware = require("../../../core/services/auth.middleware");

router.get("/", authMiddleware, dashboardController.getDashboardAdmin);

module.exports = router;
