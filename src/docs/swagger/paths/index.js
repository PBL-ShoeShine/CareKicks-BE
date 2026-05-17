const userAuthPaths = require("./user/auth");
const adminTrackingPaths = require("./admin/tracking");
const adminTokoPaths = require("./admin/toko");
const adminInventarisPaths = require("./admin/inventaris");

module.exports = {
  ...userAuthPaths,
  ...adminTrackingPaths,
  ...adminTokoPaths,
  ...adminInventarisPaths,
};
