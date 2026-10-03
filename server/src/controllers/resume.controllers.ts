import type { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import AsyncWrapper from "../utils/asyncWrapper";
import ApiError from "../utils/ApiError";

const analyseResume = AsyncWrapper(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    throw new ApiError(400, "PDF file is required");
  }

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "temp_uploads",
        resource_type: "auto",
      },
      (error, uploadResult) => {
        if (error) {
          return reject(
            new ApiError(500, error.message || "Cloudinary upload failed"),
          );
        }
        resolve(uploadResult);
      },
    );

    const chunkSize = 64 * 1024;
    for (let i = 0; i < file.buffer.length; i += chunkSize) {
      uploadStream.write(file.buffer.subarray(i, i + chunkSize));
    }
    uploadStream.end();
  });

  return res.status(200).json({
    message: "File uploaded successfully",
    data: result,
  });
});

const generateResume = AsyncWrapper(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    throw new ApiError(400, "PDF file is required");
  }

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "temp_uploads",
        resource_type: "auto",
      },
      (error, uploadResult) => {
        if (error) {
          return reject(
            new ApiError(500, error.message || "Cloudinary upload failed"),
          );
        }
        resolve(uploadResult);
      },
    );

    const chunkSize = 64 * 1024;
    for (let i = 0; i < file.buffer.length; i += chunkSize) {
      uploadStream.write(file.buffer.subarray(i, i + chunkSize));
    }
    uploadStream.end();
  });

  return res.status(200).json({
    message: "File uploaded successfully",
    data: result,
  });
});

export { analyseResume, generateResume };
