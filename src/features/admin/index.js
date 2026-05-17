const express = require("express");
const router = express.Router();

// Admin profile routes
router.use("/profile", require("./profile/profile.routes"));

// Admin dashboard routes
router.use("/dashboard", require("./dashboard"));

// Admin antrean routes
router.use("/antrean", require("./antrean/antrean.routes"));

// Admin inputoff routes
router.use("/inputoff", require("./inputoff/inputoff_routes"));

// Admin manajemen layanan routes
router.use(
	"/manajemen_layanan",
	require("./manajemen_layanan/manajemen_layanan.routes"),
);

// Admin inventaris routes
router.use("/inventaris", require("./inventaris/inventaris.routes"));

// Admin toko routes
router.use("/toko", require("./toko"));

// Admin tracking routes
router.use("/tracking", require("./tracking"));

module.exports = router;
