const userAuthPaths = require("./user/auth");
const adminTrackingPaths = require("./admin/tracking");
const adminTokoPaths = require("./admin/toko");
const antrean = require("./admin/antrean");
const manajemenStaff = require("./admin/manajemen_staff");

const adminDashboardPaths = require("./admin/dashboard");
const adminManajemenLayananPaths = require("./admin/manajemen_layanan");

module.exports = {
  ...userAuthPaths,
  ...adminTrackingPaths,
  ...adminTokoPaths,
  ...antrean,
  ...manajemenStaff,
  ...adminDashboardPaths,
  ...adminManajemenLayananPaths,
};
