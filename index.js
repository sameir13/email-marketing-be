require("dotenv").config();
const cors = require("cors");
const express = require("express");

const { alterTable } = require("./src/utils/global/syncTables.js");
const { testDbConnection } = require("./src/utils/global/connectDb.js");
const errorMiddleware = require("./src/middleware/Error.js");
const cron = require("node-cron");
const AppConfig = require("./src/services/app-config.js");
const logger = require("./src/utils/logger.js");
const workerManager = require("./src/workers/worker-manager.js");

// const { startAllEmailWorkers } = require("./src/workers/email.worker.js");

// const { startCampaignCompletionWorker } = require("./src/workers/completion.worker.js");

const { startSchedulerWorker } = require("./src/workers/scheduler.worker.js");
const { startAllEmailWorkers } = require("./src/workers/email.worker.js");
const {
  startCampaignCompletionWorker,
} = require("./src/workers/completion.worker.js");

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => {
  res.json({ success: true, message: "Email Marketing Backend Server" });
});




app.get("/api/workers/status", async (req, res) => {
  try {
    const stats = await workerManager.getStats();
    res.json({ success: true, workers: stats });
  } catch (error) {
    logger.error("Error getting worker stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/workers/pause", async (req, res) => {
  try {
    await workerManager.pauseAll();
    res.json({ success: true, message: "All workers paused" });
  } catch (error) {
    logger.error("Error pausing workers:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/workers/resume", async (req, res) => {
  try {
    await workerManager.resumeAll();
    res.json({ success: true, message: "All workers resumed" });
  } catch (error) {
    logger.error("Error resuming workers:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});




const port = process.env.PORT || 8004;

app.listen(port, () => {
  console.log(`Server is running on a port ${port}`);
});

testDbConnection();
AppConfig(app);
app.use(errorMiddleware);




(async () => {
  try {
    logger.info("🔧 Starting all background workers...");

    startCampaignCompletionWorker();

    await startAllEmailWorkers();

    startSchedulerWorker(60000); 

    logger.info("✅ All background workers started successfully");
  } catch (error) {
    logger.error("❌ Failed to start workers:", error);
    process.exit(1);
  }
})();



const gracefulShutdown = async (signal) => {
  logger.info(`\n📴 ${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    logger.info("✅ HTTP server closed");
  });

  await workerManager.closeAll();

  logger.info("✅ Graceful shutdown completed");
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  logger.error("❌ Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

// alterTable()
