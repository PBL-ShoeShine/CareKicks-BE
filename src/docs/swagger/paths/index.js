const userAuthPaths = require("./user/auth");
const adminTrackingPaths = require("./admin/tracking");
const adminTokoPaths = require("./admin/toko");
const antrean = require("./admin/antrean");
const manajemenStaff = require("./admin/manajemen_staff");


module.exports = {
  ...userAuthPaths,
  ...adminTrackingPaths,
  ...adminTokoPaths,
  ...antrean,
  ...manajemenStaff,
};
