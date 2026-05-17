const express = require("express");
const router = express.Router();

const profileController = require("./profile.controller");

const authMiddleware = require("../../../core/services/auth.middleware");

router.get("/", authMiddleware, profileController.getProfileAdmin);
router.put("/", authMiddleware, profileController.updateProfileAdmin);
router.put("/picture", authMiddleware, profileController.updateProfilePicture);

module.exports = router;
