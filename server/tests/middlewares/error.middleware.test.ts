import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import errorHandler, { notFoundHandler } from "../../src/middlewares/error.middleware";
import ApiError from "../../src/utils/ApiError";
import type { Request, Response, NextFunction } from "express";

describe("Error Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: "GET",
      originalUrl: "/test-route",
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  it("should handle ApiError correctly", () => {
    const error = new ApiError(403, "Access Forbidden", [{ field: "role" }]);

    errorHandler(error, mockReq as Request, mockRes as unknown as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Access Forbidden",
        errors: [{ field: "role" }],
      }),
    );
  });

  it("should handle ZodError correctly", () => {
    const zodError = new z.ZodError([
      {
        code: "invalid_type",
        expected: "string",
        path: ["email"],
        message: "Expected string, received number",
      } as any,
    ]);

    errorHandler(zodError, mockReq as Request, mockRes as unknown as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Validation Error",
        errors: [{ field: "email", message: "Expected string, received number" }],
      }),
    );
  });

  it("should handle Postgres duplicate key error (code 23505)", () => {
    const pgError = {
      code: "23505",
      detail: "Key (email)=(test@example.com) already exists.",
    };

    errorHandler(pgError, mockReq as Request, mockRes as unknown as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Key (email)=(test@example.com) already exists.",
      }),
    );
  });

  it("should handle Postgres foreign key error (code 23503)", () => {
    const pgError = {
      code: "23503",
      detail: "Key (user_id)=(999) is not present in table users.",
    };

    errorHandler(pgError, mockReq as Request, mockRes as unknown as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Key (user_id)=(999) is not present in table users.",
      }),
    );
  });

  it("should handle Postgres invalid syntax error (code 22P02)", () => {
    const pgError = {
      code: "22P02",
      detail: "invalid input syntax for type integer: 'abc'",
    };

    errorHandler(pgError, mockReq as Request, mockRes as unknown as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid input syntax for query parameter or field",
      }),
    );
  });

  it("should handle SyntaxError with body property (malformed JSON)", () => {
    const syntaxError = new SyntaxError("Unexpected token in JSON");
    Object.assign(syntaxError, { body: "{ bad json }" });

    errorHandler(syntaxError, mockReq as Request, mockRes as unknown as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Malformed JSON payload in request body",
      }),
    );
  });

  it("should forward notFoundHandler error to next", () => {
    notFoundHandler(mockReq as Request, mockRes as unknown as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: "Route GET /test-route not found",
      }),
    );
  });
});
