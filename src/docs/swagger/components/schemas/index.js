const sharedSchemas = require("./shared");
const userSchemas = require("./user");
const trackingSchemas = require("./tracking");
const tokoSchemas = require("./toko");
const inventarisSchemas = require("./inventaris");

module.exports = {
  ...sharedSchemas,
  ...userSchemas,
  ...trackingSchemas,
  ...tokoSchemas,
  ...inventarisSchemas,
};
