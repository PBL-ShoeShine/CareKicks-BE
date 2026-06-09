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
const ubahPasswordSchemas = require("./ubah_password");     // ← punya teman
const customerOrderSchemas = require("./customer_order");   // ← punya kamu
const customerPaymentSchemas = require("./customer_payment"); // ← punya kamu
const customerBankSchemas = require("./customer_bank");     // ← punya kamu
const customerProfileSchemas = require("./customer_profile");

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
  ...ubahPasswordSchemas,     // ← punya teman
  ...customerOrderSchemas,    // ← punya kamu
  ...customerPaymentSchemas,  // ← punya kamu
  ...customerBankSchemas,     // ← punya kamu
  ...customerProfileSchemas,
};