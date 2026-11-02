import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("../../src/config/db", () => {
  return {
    default: {
      query: vi.fn(),
      connect: vi.fn().mockResolvedValue({
        query: vi.fn(),
        release: vi.fn(),
      }),
    },
    initDB: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("../../src/config/gemini", () => {
  return {
    ai: {
      files: {
        upload: vi.fn(),
        get: vi.fn(),
      },
    },
    analyseResumeFromGemini: vi.fn(),
    generateTailoredResumeFromGemini: vi.fn(),
  };
});

import app from "../../src/app";
import pool from "../../src/config/db";

describe("Server Integration & Routing Tests", () => {
  describe("GET /api/health", () => {
    it("should return 200 OK with health status and timestamp", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("404 Not Found Handler", () => {
    it("should return 404 for unknown endpoints", async () => {
      const response = await request(app).get("/api/non-existent-endpoint");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("Route GET /api/non-existent-endpoint not found");
    });
  });

  describe("POST /api/users/register Validation", () => {
    it("should return 400 when request payload is empty or invalid", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send({
          name: "Ab",
          email: "invalid-email",
          password: "short",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("errors");
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("should return 400 if user already exists", async () => {
      vi.mocked(pool.query as any).mockResolvedValueOnce({
        rows: [{ email: "existing@example.com" }],
        command: "",
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app)
        .post("/api/users/register")
        .send({
          name: "Valid User",
          email: "existing@example.com",
          password: "Password123!",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("User Already Exists");
    });
  });

  describe("Protected Endpoints Security", () => {
    it("should reject /api/users/me without Authorization token", async () => {
      const response = await request(app).get("/api/users/me");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("No token provided");
    });

    it("should reject /api/resume/history without Authorization token", async () => {
      const response = await request(app).get("/api/resume/history");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});

