const sharedSchemas = require("./shared");
const userSchemas = require("./user");
const trackingSchemas = require("./tracking");
const tokoSchemas = require("./toko");
const antreanSchemas = require("./antrean");
const manajemenStaffSchemas = require("./manajemen_staff");

module.exports = {
  ...sharedSchemas,
  ...userSchemas,
  ...trackingSchemas,
  ...tokoSchemas,
  ...antreanSchemas,        
  ...manajemenStaffSchemas, 
};
