const express = require('express');
const router = express.Router();

// sekarang tanpa admin
router.use('/user', require('../features/user/user.routes'));

module.exports = router;