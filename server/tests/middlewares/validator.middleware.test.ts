import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { validate, validateFile } from "../../src/middlewares/validator.middleware";
import type { Request, Response, NextFunction } from "express";

describe("Validator Middleware", () => {
  const schema = z.object({
    username: z.string().min(3),
    age: z.number().positive(),
  });

  it("should pass validation with valid body and transform req.body", async () => {
    const req = {
      body: { username: "alice", age: 25 },
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    const middleware = validate(schema);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ username: "alice", age: 25 });
  });

  it("should fail validation and call next with ZodError on invalid body", async () => {
    const req = {
      body: { username: "a", age: -5 },
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    const middleware = validate(schema);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = (next as any).mock.calls[0]?.[0];
    expect(error).toBeInstanceOf(z.ZodError);
  });

  it("should validate file presence and schema", async () => {
    const fileSchema = z.object({
      file: z.object({
        mimetype: z.literal("application/pdf"),
      }),
    });

    const validReq = {
      file: { mimetype: "application/pdf" },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await validateFile(fileSchema)(validReq, res, next);
    expect(next).toHaveBeenCalledWith();

    const invalidReq = {
      file: { mimetype: "image/png" },
    } as unknown as Request;
    const nextFail = vi.fn() as NextFunction;

    await validateFile(fileSchema)(invalidReq, res, nextFail);
    expect((nextFail as any).mock.calls[0]?.[0]).toBeInstanceOf(z.ZodError);
  });
});

