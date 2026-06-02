const express = require('express');
const router = express.Router();
const ManajemenStaffController = require('./manajemen_staff.controller');
const authMiddleware = require('../../../core/services/auth.middleware');

router.post('/register', authMiddleware, (req, res) => ManajemenStaffController.createStaff(req, res));
router.get('/', authMiddleware, (req, res) => ManajemenStaffController.getStaffList(req, res));
router.get('/:id', authMiddleware, (req, res) => ManajemenStaffController.getStaffById(req, res));
router.patch('/:id', authMiddleware, (req, res) => ManajemenStaffController.updateStaffStatus(req, res));
router.delete('/:id', authMiddleware, (req, res) => ManajemenStaffController.deleteStaff(req, res));

module.exports = router;