const { campaigns, sequelize } = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger");
const { CAMPAIGN_STATUS } = require("../utils/constants");
const workerManager = require("./worker-manager");

async function checkAndCompleteCampaigns() {
  try {
    logger.info("📊 Checking for campaigns to mark as completed...");

    const [updateCount] = await campaigns.update(
      {
        status: CAMPAIGN_STATUS.completed,
        completedAt: new Date(),
      },
      {
        where: {
          status: {
            [Op.in]: [CAMPAIGN_STATUS.running, CAMPAIGN_STATUS.scheduled],
          },
          totalContacts: { [Op.gt]: 0 },
          [Op.and]: sequelize.where(
            sequelize.literal('"sentCount" + "failedCount"'),
            {
              [Op.gte]: sequelize.col("totalContacts"),
            }
          ),
        },
        returning: false,
      }
    );

    if (updateCount === 0) {
      logger.info("✅ No campaigns are ready to be marked as completed.");
      return { completed: 0 };
    }

    logger.info(
      `🎉 Successfully marked ${updateCount} campaign(s) as completed.`
    );
    return { completed: updateCount };
  } catch (err) {
    logger.error("❌ Error checking and completing campaigns:", err);
    throw err;
  }
}

/**
 * Starts a worker that periodically checks for and completes campaigns.
 * @param {number} [intervalMs=60000] - The interval in milliseconds to check for campaigns. Defaults to 1 minute.
 * @returns {Object} Object with stop() method to gracefully shutdown the worker
 */
function startCampaignCompletionWorker(intervalMs = 60000) {
  logger.info(
    `📈 Campaign Completion Worker started. Checking every ${
      intervalMs / 1000
    }s`
  );

  let interval = null;
  let isRunning = false;

  const safeCheck = async () => {
    if (isRunning) {
      logger.warn("⚠️ Previous check still running, skipping this interval");
      return;
    }

    isRunning = true;
    try {
      await checkAndCompleteCampaigns();
    } catch (err) {
      logger.error("❌ Error in campaign completion worker:", err);
    } finally {
      isRunning = false;
    }
  };

  safeCheck();

  // Start interval
  interval = setInterval(safeCheck, intervalMs);

  const stop = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    logger.info("🛑 Campaign Completion Worker stopped gracefully.");
  };

  const completionWorker = {
    stop,
    isRunning: () => Promise.resolve(isRunning),
    isPaused: () => Promise.resolve(interval === null),
    pause: () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      return Promise.resolve();
    },
    resume: () => {
      if (!interval) {
        interval = setInterval(safeCheck, intervalMs);
      }
      return Promise.resolve();
    },
    close: () => {
      stop();
      return Promise.resolve();
    },
  };

  workerManager.registerWorker(completionWorker, "completion-worker");

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  return { stop };
}

module.exports = {
  checkAndCompleteCampaigns,
  startCampaignCompletionWorker,
};
