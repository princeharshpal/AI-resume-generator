import { Router } from "express";
import {
  analyseResume,
  generateResume,
} from "../controllers/resume.controllers";

const router = Router();

router.post("/analyse", analyseResume);

router.post("/generate", generateResume);

export default router;
