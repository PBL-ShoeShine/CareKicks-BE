require("dotenv").config();

const express = require("express");
const listEndpoints = require("express-list-endpoints");
const cors = require("cors"); // 1. Import library CORS

const app = express();

app.use(cors()); // 2. Gunakan CORS sebelum express.json
app.use(express.json());

// import routes
const routes = require("./routes");

// register routes
//  Semua rute diawali dengan /api/v1
app.use("/api/v1", routes);

// start server
// 3. UBAH INI: Tambahkan '0.0.0.0' agar bisa diakses lewat Wi-Fi/Hotspot
app.listen(process.env.PORT, '0.0.0.0', () => {
  // Console log juga disesuaikan agar tidak bingung
  console.log(`\nServer jalan di http://0.0.0.0:${process.env.PORT}`);
  console.log(`(Akses dari Flutter gunakan IP Hotspot/Wi-Fi kamu, misal: http://192.168.137.1:${process.env.PORT})`);

  console.log("\n===== LIST API =====");

  console.table(
    listEndpoints(app).map((route) => ({
      METHODS: route.methods.join(", "),
      PATH: route.path,
    })),
  );
});