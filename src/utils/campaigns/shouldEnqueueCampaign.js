const moment = require("moment-timezone");

/**
 * Determines whether a campaign should be enqueued or skipped
 * @param {Object} campaign - Campaign object
 * @param {string} campaign.startDate - e.g. "2021-10-19 19:00:00+00"
 * @param {string} campaign.startTime - e.g. "02:30"
 * @param {string} campaign.timezone - e.g. "Asia/Karachi"
 * @returns {Object} - { shouldEnqueue: boolean, reason: string, scheduledUtc: string }
 */

function shouldEnqueueCampaign(campaign) {
  const { startDate, startTime, timezone = "UTC" } = campaign;

  console.log({
    startDate,
    startTime,
    timezone,
  });

  if (!startDate || !startTime)
    return { shouldEnqueue: false, reason: "Missing start date/time" };

  // Combine date and time in campaign timezone
  const localDateTime = moment.tz(
    `${moment(startDate).format("YYYY-MM-DD")} ${startTime}`,
    "YYYY-MM-DD HH:mm",
    timezone
  );

  // Convert to UTC for comparison
  const scheduledUtc = localDateTime.clone().tz("UTC");
  const nowUtc = moment.utc();

  // Calculate time difference
  const diffMs = scheduledUtc.diff(nowUtc, "milliseconds");

  if (diffMs > 0) {
    return {
      shouldEnqueue: false,
      reason: `Not yet time. Scheduled in ${Math.round(diffMs / 60000)} mins`,
      scheduledUtc: scheduledUtc.format(),
    };
  }

  // Campaign expired if it's > 24h past
  if (diffMs < -24 * 60 * 60 * 1000) {
    return {
      shouldEnqueue: false,
      reason: "Campaign start time expired (older than 24h)",
      scheduledUtc: scheduledUtc.format(),
    };
  }

  // Otherwise, it's time to enqueue
  return {
    shouldEnqueue: true,
    reason: "Time to enqueue campaign",
    scheduledUtc: scheduledUtc.format(),
  };
}

module.exports = { shouldEnqueueCampaign };
