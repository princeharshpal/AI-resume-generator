import { Router } from "express";
import {
  getUser,
  loginUser,
  registerUser,
  refreshToken,
  getProfile,
  logoutUser,
} from "../controllers/user.controllers";
import { validate } from "../middlewares/validator.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../schemas/user.schemas";

const router = Router();

router.post("/login", validate(loginSchema), loginUser);
router.post("/register", validate(registerSchema), registerUser);
router.post("/refresh-token", validate(refreshTokenSchema), refreshToken);

router.get("/", authenticate, getUser);
router.get("/me", authenticate, getProfile);
router.post("/logout", authenticate, logoutUser);

export default router;
