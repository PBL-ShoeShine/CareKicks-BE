const express = require('express');
const router = express.Router();
const alamatController = require('./alamat.controller');
const authMiddleware = require('../../../core/services/auth.middleware');

// Mount di: /api/v1/customer/addresses
router.get('/', authMiddleware, alamatController.getAlamat);
router.post('/', authMiddleware, alamatController.addAlamat);
router.put('/:id_address', authMiddleware, alamatController.updateAlamat);
router.patch('/:id_address/default', authMiddleware, alamatController.setDefault);
router.delete('/:id_address', authMiddleware, alamatController.deleteAlamat);

module.exports = router;