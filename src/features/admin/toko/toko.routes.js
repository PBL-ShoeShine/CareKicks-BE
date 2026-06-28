const express = require("express");
const router = express.Router();

const tokoController = require("./toko.controller");
const authMiddleware = require("../../../core/services/auth.middleware");
const upload = require("../../../core/services/upload.middleware");

// GET shop profile info
router.get("/profil", authMiddleware, tokoController.getShopProfile);

// UPDATE shop profile info + optional photo
router.patch(
	"/profil",
	authMiddleware,
	upload.single("foto_toko"),
	tokoController.updateShopProfile,
);

// GET shop operating hours
router.get(
	"/jam-operasional",
	authMiddleware,
	tokoController.getOperatingHours,
);

// UPDATE shop operating hours (weekly)
router.patch(
	"/jam-operasional",
	authMiddleware,
	tokoController.updateOperatingHours,
);

// POST appeal shop suspension
router.post(
	"/appeal",
	authMiddleware,
	upload.single("foto_bukti"),
	tokoController.submitAppeal,
);

module.exports = router;
