import { Router } from "express";
import {
  loginUser,
  registerUser,
  refreshToken,
  getProfile,
  logoutUser,
} from "../controllers/user.controllers";
import { validate } from "../middlewares/validator.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { authRateLimiter } from "../middlewares/rateLimiter.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../schemas/user.schemas";

const router = Router();

router.post("/login", authRateLimiter, validate(loginSchema), loginUser);
router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  registerUser,
);
router.post("/refresh-token", validate(refreshTokenSchema), refreshToken);

router.get("/me", authenticate, getProfile);
router.post("/logout", logoutUser);

export default router;
