const components = require("./components");
const paths = require("./paths");

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "CareKicks API",
    version: "1.0.0",
    description: "API documentation for CareKicks backend.",
  },
  servers: [
    {
      url: "/api/v1",
      description: "Base API",
    },
  ],
  tags: [
    {
      name: "Admin Tracking",
      description: "Admin tracking orders",
    },
    {
      name: "Admin Toko",
      description: "Admin shop profile and operating hours",
    },
    {
      name: "User Auth",
      description: "User registration and login",
    },
  ],
  components,
  paths,
};

module.exports = openapi;
