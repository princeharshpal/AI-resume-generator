import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
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
import { authenticate, optionalAuthenticate } from "../../src/middlewares/auth.middleware";
import ApiError from "../../src/utils/ApiError";

describe("Auth Middleware", () => {
  const JWT_SECRET = "test-jwt-secret";
  let mockReq: Partial<Request> & { user?: any };
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = JWT_SECRET;
    mockReq = {
      headers: {},
      cookies: {},
    };
    mockRes = {};
    mockNext = vi.fn() as unknown as NextFunction;
    vi.clearAllMocks();
  });

  describe("authenticate", () => {
    it("should return unauthorized error when no token is present", async () => {
      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = (mockNext as any).mock.calls[0]?.[0] as ApiError;
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain("No token provided");
    });

    it("should return 500 when JWT_ACCESS_SECRET is missing", async () => {
      delete process.env.JWT_ACCESS_SECRET;
      mockReq.headers = { authorization: "Bearer some.token" };

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      const error = (mockNext as any).mock.calls[0]?.[0] as ApiError;
      expect(error.statusCode).toBe(500);
      expect(error.message).toContain("secret is not configured");
    });

    it("should return 401 on invalid token", async () => {
      mockReq.headers = { authorization: "Bearer invalid.token.value" };

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      const error = (mockNext as any).mock.calls[0]?.[0] as ApiError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain("Invalid access token");
    });

    it("should return 401 when token is expired", async () => {
      const expiredToken = jwt.sign(
        { user_id: 1, email: "test@example.com" },
        JWT_SECRET,
        { expiresIn: "-1s" },
      );
      mockReq.headers = { authorization: `Bearer ${expiredToken}` };

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      const error = (mockNext as any).mock.calls[0]?.[0] as ApiError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain("expired");
    });

    it("should populate req.user and call next() on valid token and existing user", async () => {
      const validToken = jwt.sign({ user_id: 1, email: "test@example.com" }, JWT_SECRET);
      mockReq.headers = { authorization: `Bearer ${validToken}` };

      const mockUser = { id: 1, name: "Test User", email: "test@example.com", created_at: new Date() };
      vi.mocked(pool.query as any).mockResolvedValueOnce({
        rows: [mockUser],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.user).toEqual(mockUser);
    });

    it("should support token from cookies", async () => {
      const validToken = jwt.sign({ user_id: 2, email: "cookie@example.com" }, JWT_SECRET);
      mockReq.cookies = { accessToken: validToken };

      const mockUser = { id: 2, name: "Cookie User", email: "cookie@example.com", created_at: new Date() };
      vi.mocked(pool.query as any).mockResolvedValueOnce({
        rows: [mockUser],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.user).toEqual(mockUser);
    });

    it("should fail if user in token no longer exists in DB", async () => {
      const validToken = jwt.sign({ user_id: 999 }, JWT_SECRET);
      mockReq.headers = { authorization: `Bearer ${validToken}` };

      vi.mocked(pool.query as any).mockResolvedValueOnce({
        rows: [],
        command: "",
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      const error = (mockNext as any).mock.calls[0]?.[0] as ApiError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain("no longer exists");
    });
  });

  describe("optionalAuthenticate", () => {
    it("should proceed without error if no token provided", async () => {
      await optionalAuthenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.user).toBeUndefined();
    });

    it("should attach user if valid token provided", async () => {
      const validToken = jwt.sign({ user_id: 1 }, JWT_SECRET);
      mockReq.headers = { authorization: `Bearer ${validToken}` };

      const mockUser = { id: 1, name: "Test User", email: "test@example.com", created_at: new Date() };
      vi.mocked(pool.query as any).mockResolvedValueOnce({
        rows: [mockUser],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      await optionalAuthenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.user).toEqual(mockUser);
    });
  });
});
