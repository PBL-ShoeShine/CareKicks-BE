const express = require('express');
const router = express.Router();

// ✅ 1. Profile routes
const profileRoutes = require('./profile/profile.routes');

// ✅ 2. Alamat routes — FIX: filenya ada di dalam folder profile
const alamatRoutes = require('./profile/alamat.routes');

// ❌ Comment modul yang belum siap
// const historyRoutes = require('./history/history.routes');
// const homeRoutes = require('./home/home.routes');
// const orderRoutes = require('./order/order.routes');
// const viewRoutes = require('./view/view.routes');

// ✅ Daftarkan rute
router.use('/profile', profileRoutes);
router.use('/addresses', alamatRoutes);

// ❌ Comment rute yang belum siap
// router.use('/history', historyRoutes);
// router.use('/home', homeRoutes);
// router.use('/order', orderRoutes);
// router.use('/view', viewRoutes);

module.exports = router;