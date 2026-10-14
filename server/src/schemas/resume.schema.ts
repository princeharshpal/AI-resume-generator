import { z } from "zod";

export const resumeAnalyseSchema = z.object({
  file_name: z.string({ message: "File name is required" }).trim(),
  job_title: z.string({ message: "Job title is required" }).trim(),
  job_description: z.string({ message: "Job description is required" }).trim(),
});

export type resumeAnalyseSchema = z.infer<typeof resumeAnalyseSchema>;
