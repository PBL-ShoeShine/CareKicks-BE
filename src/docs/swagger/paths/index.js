const userAuthPaths = require("./user/auth");
const adminTrackingPaths = require("./admin/tracking");
const adminTokoPaths = require("./admin/toko");
const adminInventarisPaths = require("./admin/inventaris");
const adminAntreanPaths = require("./admin/antrean");
const adminManajemenStaffPaths = require("./admin/manajemen_staff");
const adminDashboardPaths = require("./admin/dashboard");
const adminManajemenLayananPaths = require("./admin/manajemen_layanan");
const adminPemindaiPaths = require("./admin/pemindai");
const adminProfilePaths = require("./admin/profile");
const adminUbahPasswordPaths = require("./admin/ubah_password");
const customerRiwayatPaths = require("./customer/riwayat");
const customerDetailOrderPaths = require("./customer/detail_order");
const customerPaymentPaths = require("./customer/payment");
const adminBankPaths = require("./admin/bank");

module.exports = {
  ...userAuthPaths,
  ...adminTrackingPaths,
  ...adminTokoPaths,
  ...adminInventarisPaths,
  ...adminAntreanPaths,
  ...adminManajemenStaffPaths,
  ...adminDashboardPaths,
  ...adminManajemenLayananPaths,
  ...adminPemindaiPaths,
  ...adminProfilePaths,
  ...adminUbahPasswordPaths,
  ...adminBankPaths,
  ...customerRiwayatPaths,
  ...customerDetailOrderPaths,
  ...customerPaymentPaths,
};
