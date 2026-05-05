const express = require('express');
const router = express.Router();
const controller = require('./user.controller');

// /api/v1/user/register
router.post('/register', controller.register);

module.exports = router;