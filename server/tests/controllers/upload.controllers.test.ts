import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("../../src/config/gemini", () => ({
  ai: {
    files: {
      upload: vi.fn(),
    },
  },
}));

import { ai } from "../../src/config/gemini";
import { uploadResumeToGoogle } from "../../src/controllers/upload.controllers";

describe("Upload Controllers Unit Tests", () => {
  let mockReq: Partial<Request> & { file?: any };
  let mockRes: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn() as unknown as NextFunction;
    vi.clearAllMocks();
  });

  it("should return 400 when no file is provided in request", async () => {
    mockReq.file = undefined;

    await uploadResumeToGoogle(mockReq as Request, mockRes as unknown as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "PDF is required",
    });
    expect(ai.files.upload).not.toHaveBeenCalled();
  });

  it("should upload file to Google Gemini and return 200 with file metadata", async () => {
    const mockBuffer = Buffer.from("dummy pdf content");
    mockReq.file = {
      fieldname: "resume",
      originalname: "my_resume.pdf",
      mimetype: "application/pdf",
      buffer: mockBuffer,
      size: mockBuffer.length,
    };

    vi.mocked(ai.files.upload).mockResolvedValueOnce({
      name: "files/abc123xyz",
      uri: "https://generativelanguage.googleapis.com/v1beta/files/abc123xyz",
      displayName: "my_resume.pdf",
    } as any);

    await uploadResumeToGoogle(mockReq as Request, mockRes as unknown as Response, mockNext);

    expect(ai.files.upload).toHaveBeenCalledTimes(1);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: "Resume uploaded successfully",
      data: {
        file_name: "files/abc123xyz",
        file_uri: "https://generativelanguage.googleapis.com/v1beta/files/abc123xyz",
        display_name: "my_resume.pdf",
      },
    });
  });
});
