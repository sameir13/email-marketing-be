// src/workers/worker-manager.js
const logger = require("../utils/logger");

class WorkerManager {
  constructor() {
    this.workers = [];
    this.isShuttingDown = false;
  }

  /**
   * Register a worker for lifecycle management
   */
  registerWorker(worker, name) {
    this.workers.push({ worker, name });
    logger.info(`✅ Registered worker: ${name}`);
    return worker;
  }

  /**
   * Gracefully close all workers
   */
  async closeAll() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    logger.info("🛑 Closing all BullMQ workers...");

    const closePromises = this.workers.map(async ({ worker, name }) => {
      try {
        await worker.close();
        logger.info(`✅ Closed worker: ${name}`);
      } catch (error) {
        logger.error(`❌ Error closing worker ${name}:`, error);
      }
    });

    await Promise.all(closePromises);
    logger.info("✅ All workers closed");
  }

  /**
   * Pause all workers
   */
  async pauseAll() {
    logger.info("⏸️ Pausing all workers...");
    await Promise.all(this.workers.map(({ worker }) => worker.pause()));
  }

  /**
   * Resume all workers
   */
  async resumeAll() {
    logger.info("▶️ Resuming all workers...");
    await Promise.all(this.workers.map(({ worker }) => worker.resume()));
  }

  /**
   * Get worker statistics
   */
  async getStats() {
    const stats = await Promise.all(
      this.workers.map(async ({ worker, name }) => {
        try {
          return {
            name,
            isRunning: !worker.closing, // true if not shutting down
            isPaused: worker.isPaused ? await worker.isPaused() : false,
            concurrency: worker.opts.concurrency,
          };
        } catch (error) {
          return { name, error: error.message };
        }
      })
    );
    return stats;
  }
}

module.exports = new WorkerManager();
