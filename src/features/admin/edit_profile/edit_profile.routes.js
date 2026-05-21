const express = require('express');
const router = express.Router();
// Pastikan nama filenya sudah sesuai dengan yang baru
const controller = require('./edit_profile.controller'); 

router.patch('/update', controller.updateProfile);
router.put('/change-password', controller.changePassword);

module.exports = router;