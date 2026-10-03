import { z } from "zod";

export const uploadPdfSchema = z.object({
  file: z.object(
    {
      fieldname: z.string({ message: "Field name is required" }),
      originalname: z
        .string({ message: "Original file name is required" })
        .refine(
          (name) => name.toLowerCase().endsWith(".pdf"),
          { message: "Only PDF files are allowed (.pdf extension required)" }
        ),
      mimetype: z
        .string({ message: "MIME type is required" })
        .refine(
          (type) => type === "application/pdf",
          { message: "Only PDF files are allowed (application/pdf required)" }
        ),
      size: z
        .number({ message: "File size is required" })
        .positive("File cannot be empty")
        .max(10 * 1024 * 1024, "File size must not exceed 10MB"),
      buffer: z.instanceof(Buffer, {
        message: "File buffer is required",
      }),
    },
    {
      error: "PDF file is required",
    }
  ),
});

export type UploadPdfSchema = z.infer<typeof uploadPdfSchema>;
