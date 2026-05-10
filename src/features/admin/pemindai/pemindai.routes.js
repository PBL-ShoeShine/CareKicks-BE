const express = require("express");
const router = express.Router();
const pemindaiController = require("./pemindai.controller");

router.post("/verify", pemindaiController.verifyQR);

module.exports = router;