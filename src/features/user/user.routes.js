const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('./user.controller');
const authMiddleware = require('../../core/services/auth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// /api/v1/user/register
router.post('/register', controller.register);
router.post('/login', controller.login);
router.put(
  '/profile/photo',
  authMiddleware,
  upload.single('photo'),
  controller.updateProfilePhoto
);

module.exports = router;
