const express = require("express");
const router = express.Router();

// Admin dashboard routes
router.use("/dashboard", require("./dashboard"));

// Admin antrean routes
router.use("/antrean", require("./antrean/antrean.routes"));

// Admin inputoff routes
router.use("/inputoff", require("./inputoff/inputoff_routes"));

module.exports = router;
