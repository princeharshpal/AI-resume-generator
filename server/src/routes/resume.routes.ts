import { Router } from "express";
import {
  analyseResume,
  generateResume,
} from "../controllers/resume.controllers";
import { validate } from "../middlewares/validator.middleware";
import { resumeAnalyseSchema } from "../schemas/resume.schema";

const router = Router();

router.post("/analyse", validate(resumeAnalyseSchema), analyseResume);
router.post("/generate", generateResume);

export default router;
