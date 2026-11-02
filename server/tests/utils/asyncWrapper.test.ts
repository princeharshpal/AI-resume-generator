import { describe, it, expect, vi } from "vitest";
import AsyncWrapper from "../../src/utils/asyncWrapper";
import type { Request, Response, NextFunction } from "express";

describe("AsyncWrapper Utility", () => {
  it("should execute the wrapped function successfully", async () => {
    const mockReq = {} as Request;
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const mockNext = vi.fn() as NextFunction;

    const handler = AsyncWrapper(async (req: Request, res: Response) => {
      res.status(200).json({ ok: true });
    });

    await handler(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ ok: true });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should catch rejected promises and forward error to next()", async () => {
    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = vi.fn() as NextFunction;
    const error = new Error("Async failure");

    const failingHandler = AsyncWrapper(async () => {
      throw error;
    });

    await failingHandler(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});

