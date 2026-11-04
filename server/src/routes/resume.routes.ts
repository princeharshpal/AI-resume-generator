import { Router } from "express";
import {
  analyseResume,
  generateTailoredResume,
  downloadAndSaveResume,
  getResumeHistory,
  getResumeById,
  deleteResumeHistory,
} from "../controllers/resume.controllers";
import { validate } from "../middlewares/validator.middleware";
import authenticate from "../middlewares/auth.middleware";
import {
  resumeAnalyseSchema,
  generateResumeSchema,
  downloadResumeSchema,
} from "../schemas/resume.schema";

const router = Router();

router.use(authenticate);

router.post("/analyse", validate(resumeAnalyseSchema), analyseResume);

router.post(
  "/generate",
  validate(generateResumeSchema),
  generateTailoredResume,
);

router.post(
  "/download",
  authenticate,
  validate(downloadResumeSchema),
  downloadAndSaveResume,
);

router.get("/history", getResumeHistory);

router.get("/:id", getResumeById);

router.delete("/:id", deleteResumeHistory);

export default router;
