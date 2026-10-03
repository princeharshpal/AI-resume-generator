import type { Request, Response } from "express";
import AsyncWrapper from "../utils/asyncWrapper";
import { ai } from "../config/gemini";

const uploadResumeToGoogle = AsyncWrapper(
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "PDF is required" });
    }

    const fileBlob = new Blob([new Uint8Array(req.file.buffer)], {
      type: req.file.mimetype,
    });

    const uploadResult = await ai.files.upload({
      file: fileBlob,
      config: {
        mimeType: req.file.mimetype,
        displayName: req.file.originalname,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: {
        file_name: uploadResult.name,
        file_uri: uploadResult.uri,
        display_name: uploadResult.displayName,
      },
    });
  },
);

export { uploadResumeToGoogle };
