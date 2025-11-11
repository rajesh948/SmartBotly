import { Redis } from "ioredis";

/**
 * Redis Configuration for BullMQ
 */

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export default redisConnection;
