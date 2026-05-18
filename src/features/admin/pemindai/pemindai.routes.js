const express = require("express");
const router = express.Router();
const pemindaiController = require("./pemindai.controller");

// Route untuk scan (POST)
router.post("/verify", pemindaiController.verifyQR);

// Route untuk update status (PUT)
router.put("/update-status", pemindaiController.changeStatus);

module.exports = router;