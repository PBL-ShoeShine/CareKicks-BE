const sharedSchemas = require("./shared");
const userSchemas = require("./user");
const trackingSchemas = require("./tracking");
const tokoSchemas = require("./toko");
const inventarisSchemas = require("./inventaris");
const antreanSchemas = require("./antrean");
const manajemenStaffSchemas = require("./manajemen_staff");
const dashboardSchemas = require("./dashboard");
const manajemenLayananSchemas = require("./manajemen_layanan");

module.exports = {
  ...sharedSchemas,
  ...userSchemas,
  ...trackingSchemas,
  ...tokoSchemas,
  ...inventarisSchemas,
  ...antreanSchemas,        
  ...manajemenStaffSchemas, 
  ...dashboardSchemas,
  ...manajemenLayananSchemas,
};
