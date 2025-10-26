function calculateDelay(scheduledAt) {
  if (!scheduledAt) return 0;
  const delay = new Date(scheduledAt).getTime() - Date.now();
  return delay > 0 ? delay : 0;
}

function isDelayWithinLimit(delay) {
  const { MAX_BULLMQ_DELAY_DAYS } = require("./constants.js").RATE_LIMITS;
  const maxDelay = MAX_BULLMQ_DELAY_DAYS * 24 * 60 * 60 * 1000;
  return delay <= maxDelay;
}
