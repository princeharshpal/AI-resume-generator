import rateLimit from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import redisClient from "../config/redis";

const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    success: false,
    message: "Too many requests, please try again after some time",
  },
  store: new RedisStore({
    prefix: "rl:global:",
    sendCommand: (...args: string[]) => {
      const [command, ...rest] = args;
      return redisClient.call(command!, ...rest) as Promise<RedisReply>;
    },
  }),
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    success: false,
    message: "Too many authentication attempts, please try again in 15 minutes",
  },
  store: new RedisStore({
    prefix: "rl:auth:",
    sendCommand: (...args: string[]) => {
      const [command, ...rest] = args;
      return redisClient.call(command!, ...rest) as Promise<RedisReply>;
    },
  }),
});

export { globalRateLimiter, authRateLimiter };
