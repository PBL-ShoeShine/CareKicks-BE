const express = require("express");
const router = express.Router();

// route user
router.use("/user", require("../features/user/user.routes"));

module.exports = router;
