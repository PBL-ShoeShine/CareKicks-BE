const express = require("express");
const router = express.Router();

router.use("/dashboard", require("./dashboard/dashboard.routes"));

module.exports = router;
