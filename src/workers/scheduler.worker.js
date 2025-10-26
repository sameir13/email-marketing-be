const { Queue } = require("bullmq");
const { email_jobs, senders, campaigns } = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger");
const redisConnection = require("../config/redis");
const { EMAIL_JOBS, CAMPAIGN_STATUS } = require("../utils/constants");
const {
  shouldEnqueueCampaign,
} = require("../utils/campaigns/shouldEnqueueCampaign");
const workerManager = require("./worker-manager");

const senderQueues = new Map();

function getQueueForSender(senderId, rateLimit = 14) {
  if (!senderQueues.has(senderId)) {
    const queue = new Queue(`emailQueue-${senderId}`, {
      connection: redisConnection,
      limiter: {
        max: rateLimit,
        duration: 1000,
      },
    });
    senderQueues.set(senderId, queue);
  }
  return senderQueues.get(senderId);
}

async function enqueuePendingEmailJobs() {
  try {
    logger.info("🔍 Checking for campaigns...");

    const activeCampaigns = await campaigns.findAll({
      where: {
        status: CAMPAIGN_STATUS.draft,
      },
    });

    if (activeCampaigns?.length < 1) {
      logger.info("No active campaigns found.");
      return;
    }

    const readyCampaignIds = [];
    const futureCampaigns = [];

    for (const camp of activeCampaigns) {
      const check = shouldEnqueueCampaign({
        startDate: camp.startDate,
        startTime: camp.startTime,
        timezone: camp.timezone,
      });

      logger.info(`${check?.reason} - campaignId: ${camp?.id}`);

      if (check.shouldEnqueue) {
        readyCampaignIds.push(camp.id);
      } else {
        futureCampaigns.push({ id: camp.id, reason: check.reason });
      }
    }

    if (!readyCampaignIds.length) {
      logger.info("⏳ No campaigns ready to enqueue yet");
      return;
    }

    logger.info(`✅ ${readyCampaignIds.length} campaigns ready to process`);

    const pendingJobs = await email_jobs.findAll({
      where: {
        status: EMAIL_JOBS.PENDING,
        campaignId: { [Op.in]: readyCampaignIds },
        scheduledFor: { [Op.lte]: new Date() },
      },
      include: [
        {
          model: senders,
          attributes: ["id", "rateLimit"],
        },
      ],
      raw: false,
    });

    if (!pendingJobs?.length) {
      logger.info("No pending jobs found for ready campaigns.");
      return;
    }

    for (const job of pendingJobs) {
      const rateLimit = job.sender?.rateLimit || 14;
      const queue = getQueueForSender(job.senderId, rateLimit);

      const delay = Math.max(
        0,
        new Date(job.scheduledFor).getTime() - Date.now()
      );

      await queue.add("sendEmail", job.toJSON(), {
        jobId: job.id,
        delay,
        removeOnComplete: 1000,
        removeOnFail: 1000,
      });
    }

    await email_jobs.update(
      { status: EMAIL_JOBS.QUEUED, queuedAt: new Date() },
      { where: { id: pendingJobs.map((j) => j.id) } }
    );

    await campaigns.update(
      { status: CAMPAIGN_STATUS.scheduled },
      { where: { id: readyCampaignIds } }
    );

    logger.info(`📋 Updated ${readyCampaignIds.length} campaigns to SCHEDULED`);
    logger.info(`✅ Enqueued ${pendingJobs.length} email jobs.`);
  } catch (err) {
    logger.error("❌ Error enqueueing email jobs:", err);
  }
}

function startSchedulerWorker(intervalMs = 10000) {
  logger.info(
    `📅 Scheduler Worker started. Checking every ${intervalMs / 1000}s`
  );

  enqueuePendingEmailJobs();

  const interval = setInterval(enqueuePendingEmailJobs, intervalMs);

  const stop = () => {
    clearInterval(interval);
    logger.info("🛑 Scheduler Worker stopped gracefully.");
  };

  const schedulerWorker = {
    stop,
    isRunning: () => Promise.resolve(true),
    isPaused: () => Promise.resolve(false),
    pause: () => {
      clearInterval(interval);
      return Promise.resolve();
    },
    resume: () => {
      const newInterval = setInterval(enqueuePendingEmailJobs, intervalMs);
      return Promise.resolve();
    },
    close: () => {
      stop();
      return Promise.resolve();
    },
  };

  workerManager.registerWorker(schedulerWorker, "scheduler-worker");

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  return { stop };
}

module.exports = { startSchedulerWorker };
