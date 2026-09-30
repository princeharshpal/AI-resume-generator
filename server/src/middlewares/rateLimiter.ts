import rateLimit from "express-rate-limit";

const globalRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again after some time",
  },
});

export { globalRateLimiter };
