require("dotenv").config();
const cors = require("cors");
const express = require("express");

const { alterTable } = require("./src/utils/global/syncTables.js");
const { testDbConnection } = require("./src/utils/global/connectDb.js");
const errorMiddleware = require("./src/middleware/Error.js");
const cron = require("node-cron");
const AppConfig = require("./src/services/app-config.js");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => {
  res.json({ success: true, message: "Email Marketing Backend Server" });
});

const port = process.env.PORT || 8003;

app.listen(port, () => {
  console.log(`Server is running on a port ${port}`);
});


testDbConnection();
AppConfig(app);
app.use(errorMiddleware);
// alterTable()

// cron.schedule("*/10 * * * * *", () => {
//   console.log("⏱️ Task running every 10 seconds:", new Date().toLocaleTimeString());
// });
