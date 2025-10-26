require("dotenv").config();
const Redis = require("ioredis");

const redisConnection = new Redis(
  "redis://default:ARplAAImcDI4ZTY4YmYyODdkMTc0ZTZkYjliYTIzNTQyYjk4MjUwYnAyNjc1Nw@thankful-jaybird-6757.upstash.io:6379",
  {
    tls: {},
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
);

redisConnection.on("connect", () => {
  console.log("Redis connected successfully");
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err);
});

module.exports = redisConnection;
