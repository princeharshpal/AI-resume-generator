import { MulterError } from "multer";
import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import upload from "../config/multer";

const uploadSingleFile = (fieldName: string = "file") => {
  const singleMiddleware = upload.single(fieldName);

  return (req: Request, res: Response, next: NextFunction): void => {
    singleMiddleware(req, res, (err: unknown) => {
      if (err instanceof MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(ApiError.badRequest("File size must not exceed 10MB"));
        }
        return next(ApiError.badRequest(`File upload error: ${err.message}`));
      } else if (err instanceof Error) {
        return next(ApiError.badRequest(err.message));
      }
      next();
    });
  };
};

export { uploadSingleFile };
