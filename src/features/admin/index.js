const express = require("express");
const router = express.Router();

/**
 * Admin Feature Routes
 * Menggunakan sistem Modular (Barrel File)
 * Pastikan setiap path/require mengarah ke file yang benar
 */

// 1. Admin Profile routes (Mencakup lihat profil, update data, ganti password, & foto)
router.use("/profile", require("./profile/profile.routes"));

// 2. Admin Dashboard routes
router.use("/dashboard", require("./dashboard"));

// 3. Admin Antrean routes
router.use("/antrean", require("./antrean/antrean.routes"));

// 4. Admin Inputoff routes
router.use("/inputoff", require("./inputoff/inputoff_routes"));

// 5. Admin Manajemen Layanan routes
router.use(
  "/manajemen_layanan",
  require("./manajemen_layanan/manajemen_layanan.routes"),
);

// 6. Admin Inventaris routes
router.use("/inventaris", require("./inventaris/inventaris.routes"));

// 7. Admin Toko routes
router.use("/toko", require("./toko"));

// 8. Admin Tracking routes
router.use("/tracking", require("./tracking"));

// 9. Admin Manajemen Karyawan routes
router.use(
  "/manajemen_staff",
  require("./manajemen_staff/manajemen_staff.routes"),
);

// 10. Admin Pemindai routes
router.use("/pemindai", require("./pemindai/pemindai.routes"));

// 11. Admin Metode Pembayaran routes
router.use(
  "/metode_pembayaran",
  require("./metode_pembayaran/metode_pembayaran.routes"),
);

// 12. Admin Konfirmasi Pesanan routes
router.use(
  "/konfirmasi_pesanan",
  require("./konfirmasi_pesanan/konfirmasi_pesanan.routes"),
);

// 13. Admin mengatur ongkir
router.use("/ongkir", require("./ongkir/ongkir.routes"));

// Export router utama
module.exports = router;
