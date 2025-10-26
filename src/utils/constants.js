const EMAIL_JOBS = {
  PENDING: "PENDING",
  QUEUED: "QUEUED",
  SENDING: "SENDING",
  SENT: "SENT",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  BOUNCEDL: "BOUNCED",
};

const CAMPAIGN_STATUS = {
  draft: "draft",
  scheduled: "scheduled",
  running: "running",
  paused: "paused",
  completed: "completed",
  failed: "failed",
};

const RATE_LIMITS = {
  SES_MAX_PER_SECOND: 14,
  EMAIL_DELAY_MS: 72,
  SCHEDULER_INTERVAL_MS: 60000, // 1 minute
  IMMEDIATE_SCHEDULER_INTERVAL_MS: 5000, // 5 seconds
  MAX_BULLMQ_DELAY_DAYS: 30,
};

module.exports = {
  CAMPAIGN_STATUS,
  EMAIL_JOBS,
  RATE_LIMITS,
};
