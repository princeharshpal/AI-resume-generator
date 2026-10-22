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
import { authenticate } from "../middlewares/auth.middleware";
import {
  resumeAnalyseSchema,
  generateResumeSchema,
  downloadResumeSchema,
} from "../schemas/resume.schema";

const router = Router();

router.post("/analyse", validate(resumeAnalyseSchema), analyseResume);

router.post(
  "/generate",
  authenticate,
  validate(generateResumeSchema),
  generateTailoredResume,
);

router.post(
  "/download",
  authenticate,
  validate(downloadResumeSchema),
  downloadAndSaveResume,
);

router.get("/history", authenticate, getResumeHistory);

router.get("/:id", authenticate, getResumeById);

router.delete("/:id", authenticate, deleteResumeHistory);

export default router;
