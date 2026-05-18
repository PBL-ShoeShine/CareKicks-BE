require("dotenv").config();
const express = require("express");
const multer = require("multer");
const listEndpoints = require("express-list-endpoints");
const swaggerUi = require("swagger-ui-express");
const openapi = require("./docs/swagger");

const app = express();

// Middleware
const cors = require("cors"); 
const listEndpoints = require("express-list-endpoints");

const app = express();

app.use(cors()); // Aktifkan akses lintas perangkat
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Multer configuration for file uploads
const upload = multer({ storage: multer.memoryStorage() });

const routes = require("./routes");
app.use("/api/v1", routes); // Jalur utama API

// register routes
//  Semua rute diawali dengan /api/v1
app.use("/api/v1", routes);

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi));

// store upload middleware in app for use in routes
app.upload = upload;

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Ukuran foto maksimal 5MB" : err.message;

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

// start server
app.listen(process.env.PORT, () => {
	console.log(`\nServer jalan di http://localhost:${process.env.PORT}`);

	console.log("\n===== LIST API =====");

	console.table(
		listEndpoints(app).map((route) => ({
			METHODS: route.methods.join(", "),
			PATH: route.path,
		})),
	);
});
app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`\nServer CareKicks jalan di IP: http://0.0.0.0:${process.env.PORT}`);
  console.log("===== DAFTAR RUTE AKTIF =====");
  console.table(listEndpoints(app).map(r => ({ METHODS: r.methods.join(", "), PATH: r.path })));
});
