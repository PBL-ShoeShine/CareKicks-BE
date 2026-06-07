const express = require("express");
const router = express.Router();

router.use("/dashboard", require("./dashboard/dashboard.routes"));
router.use("/verifications", require("./verifications/shop-verifications.routes"));
router.use("/reviews", require("./reviews/shop-reviews.routes"));

module.exports = router;
