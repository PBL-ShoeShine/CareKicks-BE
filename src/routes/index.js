const express = require("express");
const router = express.Router();

// User routes
router.use("/user", require("../features/user/user.routes"));

// Admin routes
router.use("/admin", require("../features/admin"));

module.exports = router;
