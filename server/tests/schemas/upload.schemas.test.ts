import { describe, it, expect } from "vitest";
import { uploadPdfSchema } from "../../src/schemas/upload.schemas";

describe("Upload Schemas", () => {
  it("should validate a valid PDF file object", () => {
    const validFile = {
      file: {
        fieldname: "resume",
        originalname: "my_resume.pdf",
        mimetype: "application/pdf",
        size: 1024 * 50,
        buffer: Buffer.from("sample pdf content"),
      },
    };

    const result = uploadPdfSchema.safeParse(validFile);
    expect(result.success).toBe(true);
  });

  it("should reject non-PDF extension", () => {
    const file = {
      file: {
        fieldname: "resume",
        originalname: "photo.jpg",
        mimetype: "application/pdf",
        size: 1024,
        buffer: Buffer.from("img"),
      },
    };

    const result = uploadPdfSchema.safeParse(file);
    expect(result.success).toBe(false);
  });

  it("should reject non-PDF mimetype", () => {
    const file = {
      file: {
        fieldname: "resume",
        originalname: "document.pdf",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("content"),
      },
    };

    const result = uploadPdfSchema.safeParse(file);
    expect(result.success).toBe(false);
  });

  it("should reject file exceeding 10MB limit", () => {
    const file = {
      file: {
        fieldname: "resume",
        originalname: "large.pdf",
        mimetype: "application/pdf",
        size: 11 * 1024 * 1024,
        buffer: Buffer.alloc(100),
      },
    };

    const result = uploadPdfSchema.safeParse(file);
    expect(result.success).toBe(false);
  });
});

