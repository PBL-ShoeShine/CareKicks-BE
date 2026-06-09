const sharedSchemas = require("./shared");
const userSchemas = require("./user");
const trackingSchemas = require("./tracking");
const tokoSchemas = require("./toko");
const inventarisSchemas = require("./inventaris");
const antreanSchemas = require("./antrean");
const manajemenStaffSchemas = require("./manajemen_staff");
const dashboardSchemas = require("./dashboard");
const manajemenLayananSchemas = require("./manajemen_layanan");
const pemindaiSchemas = require("./pemindai");
const editProfileSchemas = require("./edit_profile");
const ubahPasswordSchemas = require("./ubah_password");
const customerOrderSchemas = require("./customer_order");
const customerPaymentSchemas = require("./customer_payment");
const bankSchemas = require("./bank");

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
  ...pemindaiSchemas,
  ...editProfileSchemas,
  ...ubahPasswordSchemas,
  ...customerOrderSchemas,
  ...customerPaymentSchemas,
  ...bankSchemas,
};
