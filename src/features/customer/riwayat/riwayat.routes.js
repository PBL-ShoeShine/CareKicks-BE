const express = require("express");
const router = express.Router();
const { getRiwayatHandler } = require("./riwayat.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

router.get("/", authMiddleware, getRiwayatHandler);

module.exports = router;