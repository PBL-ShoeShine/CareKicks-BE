const express = require("express");
const router = express.Router();
const ongkirController = require("./ongkir.controller");
const authMiddleware = require("../../../core/services/auth.middleware");

router.get("/", authMiddleware, ongkirController.getOngkirSetting);
router.put("/", authMiddleware, ongkirController.updateOngkirSetting);

module.exports = router;
