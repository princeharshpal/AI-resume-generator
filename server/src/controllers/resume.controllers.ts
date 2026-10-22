import type { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import AsyncWrapper from "../utils/asyncWrapper";
import ApiError from "../utils/ApiError";
import pool from "../config/db";
import {
  ai,
  analyseResumeFromGemini,
  generateTailoredResumeFromGemini,
} from "../config/gemini";
import { generateAtsResumePdf } from "../utils/pdfGenerator";
import type { TailoredResumeContent } from "../types/resume.types";

const uploadPdfToCloudinary = async (
  buffer: Buffer,
  folder: string,
  publicId: string,
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "raw",
        format: "pdf",
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            new ApiError(
              500,
              error?.message || "Failed to upload resume PDF to Cloudinary",
            ),
          );
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    const chunkSize = 64 * 1024;
    for (let i = 0; i < buffer.length; i += chunkSize) {
      uploadStream.write(buffer.subarray(i, i + chunkSize));
    }
    uploadStream.end();
  });
};

const analyseResume = AsyncWrapper(async (req: Request, res: Response) => {
  const { file_name, job_title, job_description } = req.body;

  const fileRef = await ai.files.get({ name: file_name });

  const response = await analyseResumeFromGemini(
    fileRef,
    job_title,
    job_description,
  );

  const rawText = response?.text;

  if (!rawText) {
    throw new ApiError(500, "Gemini AI returned empty response for resume analysis.");
  }

  const structuredAnalysis = JSON.parse(rawText);

  return res.status(200).json({
    success: true,
    message: "Resume analysis completed successfully",
    data: structuredAnalysis,
  });
});

const generateTailoredResume = AsyncWrapper(async (req: Request, res: Response) => {
  const { file_name, job_title, job_description, added_skills = [] } = req.body;

  const fileRef = await ai.files.get({ name: file_name });

  const response = await generateTailoredResumeFromGemini(
    fileRef,
    job_title,
    job_description,
    added_skills,
  );

  const rawText = response?.text;

  if (!rawText) {
    throw new ApiError(500, "Failed to generate tailored ATS resume content.");
  }

  const tailoredResume: TailoredResumeContent = JSON.parse(rawText);

  return res.status(200).json({
    success: true,
    message: "ATS-optimized tailored resume generated successfully",
    data: tailoredResume,
  });
});

const downloadAndSaveResume = AsyncWrapper(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw ApiError.unauthorized("You must be logged in to save and download tailored resumes.");
  }

  const {
    file_name,
    job_title,
    company_name = "Target Company",
    job_description = "",
    match_score = 90,
    matching_skills = [],
    missing_skills = [],
    added_skills = [],
    resume_content,
  } = req.body;

  let finalResumeContent: TailoredResumeContent = resume_content;

  if (!finalResumeContent) {
    if (!file_name) {
      throw new ApiError(400, "Either resume_content or file_name is required.");
    }
    const fileRef = await ai.files.get({ name: file_name });
    const response = await generateTailoredResumeFromGemini(
      fileRef,
      job_title,
      job_description,
      added_skills,
    );
    const rawText = response?.text;
    if (!rawText) {
      throw new ApiError(500, "Failed to generate resume for download.");
    }
    finalResumeContent = JSON.parse(rawText);
  }

  const pdfBuffer = await generateAtsResumePdf(finalResumeContent);

  const safeTitle = (job_title || "Resume").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const timestamp = Date.now();
  const publicId = `${safeTitle}_${timestamp}`;
  const folder = `smartresume/users/${user.id}/resumes`;

  const uploadResult = await uploadPdfToCloudinary(pdfBuffer, folder, publicId);

  const insertQuery = `
    INSERT INTO resumes (
      user_id,
      job_title,
      company_name,
      job_description,
      match_score,
      matching_skills,
      missing_skills,
      added_skills,
      resume_content,
      pdf_url,
      cloudinary_public_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `;

  const dbResult = await pool.query(insertQuery, [
    user.id,
    job_title,
    company_name,
    job_description,
    finalResumeContent.projected_match_score || match_score,
    matching_skills,
    missing_skills,
    added_skills,
    JSON.stringify(finalResumeContent),
    uploadResult.secure_url,
    uploadResult.public_id,
  ]);

  const savedRecord = dbResult.rows[0];

  if (req.query.format === "pdf") {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${user.name.replace(/\s+/g, "_")}_${safeTitle}.pdf"`,
    );
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("X-Resume-Id", savedRecord.id.toString());
    res.setHeader("X-Cloud-Url", uploadResult.secure_url);
    return res.end(pdfBuffer);
  }

  return res.status(200).json({
    success: true,
    message: "Resume generated, uploaded to cloud, and saved to history successfully",
    data: {
      id: savedRecord.id,
      pdf_url: uploadResult.secure_url,
      cloudinary_public_id: uploadResult.public_id,
      job_title: savedRecord.job_title,
      match_score: savedRecord.match_score,
      created_at: savedRecord.created_at,
      record: savedRecord,
    },
  });
});

const getResumeHistory = AsyncWrapper(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw ApiError.unauthorized("Authentication required to view resume history");
  }

  const query = `
    SELECT 
      id,
      user_id,
      job_title,
      company_name,
      match_score,
      matching_skills,
      missing_skills,
      added_skills,
      pdf_url,
      created_at
    FROM resumes 
    WHERE user_id = $1 
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [user.id]);

  return res.status(200).json({
    success: true,
    message: "Resume history fetched successfully",
    data: result.rows,
  });
});

const getResumeById = AsyncWrapper(async (req: Request, res: Response) => {
  const user = req.user;
  const resumeId = req.params.id;

  if (!user) {
    throw ApiError.unauthorized("Authentication required");
  }

  const query = "SELECT * FROM resumes WHERE id = $1 AND user_id = $2";
  const result = await pool.query(query, [resumeId, user.id]);

  if (result.rows.length === 0) {
    throw ApiError.notFound("Resume record not found");
  }

  return res.status(200).json({
    success: true,
    data: result.rows[0],
  });
});

const deleteResumeHistory = AsyncWrapper(async (req: Request, res: Response) => {
  const user = req.user;
  const resumeId = req.params.id;

  if (!user) {
    throw ApiError.unauthorized("Authentication required");
  }

  const selectQuery = "SELECT cloudinary_public_id FROM resumes WHERE id = $1 AND user_id = $2";
  const selectResult = await pool.query(selectQuery, [resumeId, user.id]);

  if (selectResult.rows.length === 0) {
    throw ApiError.notFound("Resume record not found");
  }

  const publicId = selectResult.rows[0].cloudinary_public_id;

  await pool.query("DELETE FROM resumes WHERE id = $1 AND user_id = $2", [resumeId, user.id]);

  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    } catch (cloudErr) {
      console.warn("Failed to delete Cloudinary file:", cloudErr);
    }
  }

  return res.status(200).json({
    success: true,
    message: "Resume history deleted successfully",
  });
});

export {
  analyseResume,
  generateTailoredResume,
  downloadAndSaveResume,
  getResumeHistory,
  getResumeById,
  deleteResumeHistory,
};
