const { Queue } = require("bullmq");
const redisConnection = require("../config/redis");
const { emailQueueOptions } = require("../config/queues");




const emailQueue = new Queue("email-queue", {
  redisConnection,
  defaultJobOptions: emailQueueOptions,
});



module.exports = emailQueue;
