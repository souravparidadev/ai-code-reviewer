import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new URL(redisUrl);

export const reviewQueue = new Queue("code-review", {
  connection: {
    host: redis.hostname,
    port: Number(redis.port || 6379),
  },
});