const { Worker } = require("bullmq");
const {
  email_jobs,
  emails,
  senders,
  campaigns,
  sequelize,
} = require("../models");
const redisConnection = require("../config/redis");
const logger = require("../utils/logger");
const { EMAIL_JOBS } = require("../utils/constants");
const EmailService = require("../utils/emails/EmailService");
const workerManager = require("./worker-manager");

const activeWorkers = new Map();

/**
 * Start a BullMQ Worker for each sender queue
 * @param {string} senderId
 * @param {number} rateLimit
 */
function startWorkerForSender(senderId, rateLimit = 14) {
  if (activeWorkers.has(senderId)) {
    logger.info(`Worker already running for sender ${senderId}`);
    return;
  }

  const worker = new Worker(
    `emailQueue-${senderId}`,
    async (job) => {
      const {
        id,
        contactEmail,
        campaignId,
        contactId,
        senderId,
        subject,
        htmlContent,
        textContent,
        senderEmail,
        senderName,
        senderSmtpHost,
        senderSmtpPass,
        senderSmtpPort,
        userId,
        contactFirstName,
        contactLastName,
      } = job.data;

      const senderConfig = {
        id: senderId,
        fromEmail: senderEmail,
        fromName: senderName,
        smtpHost: senderSmtpHost,
        smtpPass: senderSmtpPass,
        smtpPort: senderSmtpPort,
        provider: "testing",
      };

      const MailPayload = {
        campaignId,
        contactId,
        senderId,
        subject: subject,
        html: htmlContent,
        text: textContent,
        to: contactEmail,
        contactFirstName,
        contactLastName,
        attachments: [],
        headers: {},
        options: {},
      };

      const transaction = await sequelize.transaction();

      try {
        logger.info(`📧 [${senderId}] Sending email to ${contactEmail}`);

        const result = await EmailService.sendEmail(
          senderConfig,
          MailPayload
        );

        await email_jobs.update(
          {
            status: EMAIL_JOBS.SENT,
            sentAt: new Date(),
            errorMessage: null,
          },
          { where: { id }, transaction }
        );

        await emails.create(
          {
            messageId: result?.messageId,
            campaignId,
            contactId,
            senderId,
            contactEmail,
            senderEmail,
            userId,
            jobId: id,
            status: "sent",
            sentAt: new Date(),
          },
          { transaction }
        );

        await campaigns.increment("sentCount", {
          by: 1,
          where: { id: campaignId },
          transaction,
        });

        await transaction.commit();
        logger.info(`✅ Email sent to ${contactEmail} [Job: ${id}]`);
      } catch (error) {
        await transaction.rollback();
        logger.error(`❌ Failed to send email [${id}]: ${error.message}`);
        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 5, 
      limiter: {
        max: rateLimit, 
        duration: 1000, 
      },
      settings: {
        stalledInterval: 30000,
        maxStalledCount: 2, 
      },
      autorun: true, 
    }
  );

  worker.on("failed", (job, err) => {
    logger.error(`❌ Job ${job.id} failed: ${err.message}`);
  });

  worker.on("completed", (job) => {
    logger.info(`✅ Job ${job.id} completed`);
  });

  activeWorkers.set(senderId, worker);
  
  workerManager.registerWorker(worker, `email-worker-${senderId}`);

  logger.info(`🚀 Worker started for sender ${senderId}`);
}

async function startAllEmailWorkers() {
  const allSenders = await senders.findAll({
    attributes: ["id", "rateLimit"],
  });

  for (const sender of allSenders) {
    startWorkerForSender(sender.id, sender.rateLimit || 14);
  }

  logger.info(`🎯 Started ${allSenders.length} email workers.`);
}

module.exports = { startWorkerForSender, startAllEmailWorkers };