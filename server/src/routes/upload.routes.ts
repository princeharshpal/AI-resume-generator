import { Router } from "express";
import upload from "../config/multer";
import { uploadResumeToGoogle } from "../controllers/upload.controllers";

const router = Router();

router.post("/", upload.single("resume"), uploadResumeToGoogle);

export default router;
