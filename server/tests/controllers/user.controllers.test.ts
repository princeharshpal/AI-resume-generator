import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("../../src/config/db", () => {
  return {
    default: {
      query: vi.fn(),
    },
    initDB: vi.fn(),
  };
});

import pool from "../../src/config/db";
import { getProfile, logoutUser } from "../../src/controllers/user.controllers";

describe("User Controllers Unit Tests", () => {
  let mockReq: Partial<Request> & { user?: any };
  let mockRes: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    clearCookie: ReturnType<typeof vi.fn>;
  };
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      cookies: {},
      headers: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn() as unknown as NextFunction;
    vi.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return the user details from req.user", async () => {
      const user = {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        created_at: new Date(),
      };
      mockReq.user = user;

      await getProfile(mockReq as Request, mockRes as unknown as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        user,
      });
    });
  });

  describe("logoutUser", () => {
    it("should clear auth cookies and return 200 message", async () => {
      mockReq.cookies = {
        refreshToken: "refresh-token-123",
      };

      vi.mocked(pool.query as any).mockResolvedValueOnce({
        rows: [],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      await logoutUser(mockReq as Request, mockRes as unknown as Response, mockNext);

      expect(pool.query).toHaveBeenCalledWith(
        "DELETE FROM refresh_tokens WHERE token = $1",
        ["refresh-token-123"],
      );
      expect(mockRes.clearCookie).toHaveBeenCalledWith("accessToken", expect.any(Object));
      expect(mockRes.clearCookie).toHaveBeenCalledWith("refreshToken", expect.any(Object));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Logged out successfully",
      });
    });
  });
});
