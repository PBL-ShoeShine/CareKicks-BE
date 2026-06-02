require("dotenv").config();
const express = require("express");
const cors = require("cors"); 
const multer = require("multer");
const listEndpoints = require("express-list-endpoints");
const swaggerUi = require("swagger-ui-express");
const openapi = require("./docs/swagger"); // Mengarah ke konfigurasi swagger milikmu

const app = express();

// ====== 1. MIDDLEWARE UTAMA ======
app.use(cors()); // Aktifkan akses lintas perangkat (Biar HP fisik aman)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (Biar kelihatan request apa saja yang masuk)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Konfigurasi Multer untuk handle upload file gambar/foto ke memori
const upload = multer({ storage: multer.memoryStorage() });
app.upload = upload; // Simpan middleware upload di app agar bisa dipakai di routes

// ====== 2. ROUTING UTAMA ======
const routes = require("./routes");
app.use("/api/v1", routes); // Jalur utama API (Semua rute diawali dengan /api/v1)

// ====== 3. DOCUMENTATION SYSTEM ======
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi));

// ====== 4. ERROR & 404 HANDLER ======
// 404 Handler jika rute tidak ditemukan
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler (Menangkap crash tersembunyi agar server gak mati)
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Ukuran foto maksimal 5MB" : err.message;
    return res.status(400).json({
      success: false,
      message,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ====== 5. MENYALAKAN SERVER ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\nServer CareKicks jalan di IP: http://0.0.0.0:${PORT}`);
  console.log(`📖 Dokumentasi Swagger aktif di: http://10.254.102.20:${PORT}/api-docs`);
  console.log("\n===== DAFTAR RUTE AKTIF =====");
  console.table(listEndpoints(app).map(r => ({ METHODS: r.methods.join(", "), PATH: r.path })));
});