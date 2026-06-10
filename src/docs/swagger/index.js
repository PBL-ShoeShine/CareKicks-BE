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
      name: "Admin Inventaris",
      description: "Admin inventory management",
    },
    {
      name: "Admin Toko",
      description: "Admin shop profile and operating hours",
    },
    {
      name: "Admin Dashboard",
      description: "Admin dashboard statistics and info",
    },
    {
      name: "Admin Manajemen Layanan",
      description: "Admin service management",
    },
    {
      name: "User Auth",
      description: "User registration and login",
    },
    {
      name: "Admin Antrean",
      description: "Manajemen antrean order",
    },
    {
      name: "Admin Manajemen Staff",
      description: "Manajemen data staff",
    },
    {
      name: "Admin Metode Pembayaran",
      description: "Manajemen metode pembayaran toko (bank, e-wallet, QRIS)",
    },
    {
      name: "Admin Pemindai",
      description: "Admin QR Code scanner for orders",
    },
    {
      name: "Admin Profile",
      description: "Admin profile management and password change",
    },
    {
      name: "Customer - Riwayat",
      description: "Riwayat pesanan customer",
    },
    {
      name: "Customer - Detail Order",
      description: "Detail pesanan customer",
    },
    {
      name: "Customer - Payment",
      description: "Pembayaran pesanan customer",
    },
    {
      name: "Customer - Profile",
      description: "Manajemen profil dan password customer",
    },
    {
      name: "Customer - Address",
      description: "Manajemen alamat pengiriman customer",
    },
  ],
  components,
  paths,
};

module.exports = openapi;
