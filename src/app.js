require("dotenv").config();

const express = require("express");
const listEndpoints = require("express-list-endpoints");

const app = express();

app.use(express.json());

// import routes
const routes = require("./routes");

// register routes
app.use("/api/v1", routes);

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
