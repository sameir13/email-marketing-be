const moment = require("moment");

function toUTCDate(dateString) {
  const utcDate = moment(dateString, ["DD-MM-YYYY", "YYYY-MM-DD HH:mm"]).utc();
  if (!utcDate.isValid()) throw new Error("Invalid date format");
  return utcDate.toISOString();
}

module.exports = { toUTCDate };
