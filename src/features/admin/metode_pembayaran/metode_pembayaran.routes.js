const express = require('express');
const router = express.Router();
const multer = require('multer');

const authMiddleware = require('../../../core/services/auth.middleware');
const paymentController = require('./metode_pembayaran.controller');

// Konfigurasi Multer Memory Storage (untuk upload QRIS)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
  }
});

// =====================================================================
// RUTE: /api/v1/admin/payments
// =====================================================================

// Ambil daftar metode pembayaran
router.get('/', authMiddleware, paymentController.getPaymentMethods);

// Tambah metode pembayaran baru
router.post('/', authMiddleware, paymentController.addPaymentMethod);

// Update data metode pembayaran
router.put('/:id', authMiddleware, paymentController.updatePaymentMethod);

// Update status (Aktif/Nonaktif)
router.patch('/:id/status', authMiddleware, paymentController.toggleStatus);

// Hapus metode pembayaran
router.delete('/:id', authMiddleware, paymentController.deletePaymentMethod);

// Upload Gambar QRIS
router.put(
  '/:id/qris-image', 
  authMiddleware, 
  upload.single('image'), 
  paymentController.uploadQrisImage
);

module.exports = router;