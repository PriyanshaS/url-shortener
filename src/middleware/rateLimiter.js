import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { client } from "../redis.js";

export const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.CREATE_LIMIT_PER_MIN) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  message: { error: "Too many requests, try again later" },

  ...(client && {
    store: new RedisStore({
      sendCommand: (...args) => client.call(...args),
      prefix: "rl:create:",
    }),
  }),
});
