const sharedSchemas = require("./shared");
const userSchemas = require("./user");
const trackingSchemas = require("./tracking");
const tokoSchemas = require("./toko");
const dashboardSchemas = require("./dashboard");
const manajemenLayananSchemas = require("./manajemen_layanan");

module.exports = {
  ...sharedSchemas,
  ...userSchemas,
  ...trackingSchemas,
  ...tokoSchemas,
  ...dashboardSchemas,
  ...manajemenLayananSchemas,
};
