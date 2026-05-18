require("dotenv").config();
const express = require("express");
const cors = require("cors"); 
const listEndpoints = require("express-list-endpoints");

const app = express();

app.use(cors()); // Aktifkan akses lintas perangkat
app.use(express.json());

const routes = require("./routes");
app.use("/api/v1", routes); // Jalur utama API

app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`\nServer CareKicks jalan di IP: http://0.0.0.0:${process.env.PORT}`);
  console.log("===== DAFTAR RUTE AKTIF =====");
  console.table(listEndpoints(app).map(r => ({ METHODS: r.methods.join(", "), PATH: r.path })));
});