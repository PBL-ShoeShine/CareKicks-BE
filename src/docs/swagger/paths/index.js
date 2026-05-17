const userAuthPaths = require("./user/auth");
const adminTrackingPaths = require("./admin/tracking");
const adminTokoPaths = require("./admin/toko");

module.exports = {
  ...userAuthPaths,
  ...adminTrackingPaths,
  ...adminTokoPaths,
};
