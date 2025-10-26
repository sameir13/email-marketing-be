const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000,
  },
  removeOnComplete: {
    count: 1000,
    age: 24 * 3600,
  },
  removeOnFail: {
    count: 5000,
  },
};

const emailQueueOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
  removeOnComplete: {
    count: 500,
  },
  removeOnFail: {
    count: 2000,
  },
};

module.exports = {
  defaultJobOptions,
  emailQueueOptions,
};
