const userAuthPaths = require("./user/auth");
const adminTrackingPaths = require("./admin/tracking");
const adminTokoPaths = require("./admin/toko");
const adminInventarisPaths = require("./admin/inventaris");
const antrean = require("./admin/antrean");
const manajemenStaff = require("./admin/manajemen_staff");

const adminDashboardPaths = require("./admin/dashboard");
const adminManajemenLayananPaths = require("./admin/manajemen_layanan");
const adminPemindaiPaths = require("./admin/pemindai");

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
};
