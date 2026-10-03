import { Router } from "express";
import { uploadFile } from "../controllers/upload.controllers";
import { uploadSingleFile } from "../middlewares/multer.middleware";
import { validateFile } from "../middlewares/validator.middleware";
import { uploadPdfSchema } from "../schemas/upload.schemas";

const router = Router();

router.post(
  "/",
  uploadSingleFile("file"),
  validateFile(uploadPdfSchema),
  uploadFile,
);

export default router;
