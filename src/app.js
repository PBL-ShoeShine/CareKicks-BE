require("dotenv").config();

const express = require("express");
const multer = require("multer");
const listEndpoints = require("express-list-endpoints");
const swaggerUi = require("swagger-ui-express");
const openapi = require("./docs/swagger");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Multer configuration for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// import routes
const routes = require("./routes");

// register routes
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
