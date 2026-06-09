const userAuthPaths = require("./user/auth");
const adminTrackingPaths = require("./admin/tracking");
const adminTokoPaths = require("./admin/toko");
const adminInventarisPaths = require("./admin/inventaris");
const antrean = require("./admin/antrean");
const manajemenStaff = require("./admin/manajemen_staff");
const adminDashboardPaths = require("./admin/dashboard");
const adminManajemenLayananPaths = require("./admin/manajemen_layanan");
const adminPemindaiPaths = require("./admin/pemindai");
const adminProfilePaths = require("./admin/profile");
const adminUbahPasswordPaths = require("./admin/ubah_password"); // ← punya teman
const customerRiwayatPaths = require("./customer/riwayat");      // ← punya kamu
const customerDetailOrderPaths = require("./customer/detail_order"); // ← punya kamu
const customerPaymentPaths = require("./customer/payment");      // ← punya kamu
const customerProfilePaths = require("./customer/profile");
const customerAddressPaths = require("./customer/address");

module.exports = {
  ...userAuthPaths,
  ...adminTrackingPaths,
  ...adminTokoPaths,
  ...adminInventarisPaths,
  ...antrean,
  ...manajemenStaff,
  ...adminDashboardPaths,
  ...adminManajemenLayananPaths,
  ...adminPemindaiPaths,
  ...adminProfilePaths,
  ...adminUbahPasswordPaths,  // ← punya teman
  ...customerRiwayatPaths,    // ← punya kamu
  ...customerDetailOrderPaths, // ← punya kamu
  ...customerPaymentPaths,    // ← punya kamu
  ...customerProfilePaths,
  ...customerAddressPaths,
};