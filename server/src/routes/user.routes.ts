import { Router } from "express";
import {
  getUser,
  loginUser,
  registerUser,
  refreshToken,
} from "../controllers/user.controllers";
import { validate } from "../middlewares/validator.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../schemas/user.schemas";

const router = Router();

router.get("/", getUser);

router.post("/login", validate(loginSchema), loginUser);

router.post("/register", validate(registerSchema), registerUser);

router.post("/refresh-token", validate(refreshTokenSchema), refreshToken);

export default router;
