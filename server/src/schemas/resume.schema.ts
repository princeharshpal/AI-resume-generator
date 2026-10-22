import { z } from "zod";

export const resumeAnalyseSchema = z.object({
  file_name: z.string({ message: "File name is required" }).trim(),
  job_title: z.string({ message: "Job title is required" }).trim(),
  job_description: z.string({ message: "Job description is required" }).trim(),
});

export const generateResumeSchema = z.object({
  file_name: z.string({ message: "File name is required" }).trim(),
  job_title: z.string({ message: "Job title is required" }).trim(),
  job_description: z.string({ message: "Job description is required" }).trim(),
  added_skills: z.array(z.string()).optional().default([]),
});

export const downloadResumeSchema = z.object({
  file_name: z.string().optional(),
  job_title: z.string({ message: "Job title is required" }).trim(),
  company_name: z.string().optional().default("Target Company"),
  job_description: z.string().optional().default(""),
  match_score: z.number().optional().default(90),
  matching_skills: z.array(z.string()).optional().default([]),
  missing_skills: z.array(z.string()).optional().default([]),
  added_skills: z.array(z.string()).optional().default([]),
  resume_content: z.record(z.string(), z.any()).optional(),
});

export type ResumeAnalyseInput = z.infer<typeof resumeAnalyseSchema>;
export type GenerateResumeInput = z.infer<typeof generateResumeSchema>;
export type DownloadResumeInput = z.infer<typeof downloadResumeSchema>;
