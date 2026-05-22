const express = require("express");
const router = express.Router();
const { getRiwayatHandler } = require("./riwayat.controller");
const authMiddleware = require("../../../core/middlewares/authMiddleware"); // sesuaikan path

router.get("/", authMiddleware, getRiwayatHandler);

module.exports = router;