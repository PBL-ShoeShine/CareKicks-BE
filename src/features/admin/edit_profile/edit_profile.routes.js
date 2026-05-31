const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const os = require('os');

// Import Controller & Middleware (Sesuaikan path-nya jika beda)
const editProfileController = require('./edit_profile.controller'); 
const authMiddleware = require('../../../core/services/auth.middleware');

// =========================================================================
// KONFIGURASI MULTER (PENANGKAP FILE GAMBAR)
// =========================================================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Simpan sementara di folder temp bawaan sistem operasi
        cb(null, os.tmpdir()); 
    },
    filename: function (req, file, cb) {
        // Buat nama file sementara
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Batasi ukuran maksimal 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
        }
    }
});

// =========================================================================
// RUTE ENDPOINT
// =========================================================================

// Ambil Data Profil
router.get('/', authMiddleware, editProfileController.getProfile);

// Ubah Data Teks (Nama, No HP, Email)
router.put('/', authMiddleware, editProfileController.updateProfil);

// Ubah File Gambar (Wajib pakai upload.single('image'))
router.put('/picture', authMiddleware, upload.single('image'), editProfileController.updateProfilePicture);


module.exports = router;