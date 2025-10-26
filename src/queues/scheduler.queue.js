const { Queue } = require("bullmq");
const redisConnection = require("../config/redis");

const schedulerQueue = new Queue("scheduler-queue", { connection });
const immediateSchedulerQueue = new Queue("immediate-scheduler-queue", {
  redisConnection,
});

module.exports = {
  schedulerQueue,
  immediateSchedulerQueue,
};
