import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, refreshTokenSchema } from "../../src/schemas/user.schemas";

describe("User Schemas", () => {
  describe("registerSchema", () => {
    it("should accept valid registration details", () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        password: "Password123!",
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("john@example.com");
      }
    });

    it("should reject short name", () => {
      const data = {
        name: "Jo",
        email: "john@example.com",
        password: "Password123!",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const data = {
        name: "John Doe",
        email: "not-an-email",
        password: "Password123!",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject weak passwords without uppercase or number", () => {
      const dataNoUpper = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };
      expect(registerSchema.safeParse(dataNoUpper).success).toBe(false);

      const dataNoNumber = {
        name: "John Doe",
        email: "john@example.com",
        password: "PasswordOnly",
      };
      expect(registerSchema.safeParse(dataNoNumber).success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should validate correct login payload", () => {
      const validData = {
        email: "john@example.com",
        password: "Password123",
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid login email", () => {
      const data = {
        email: "bad-email",
        password: "Password123",
      };
      expect(loginSchema.safeParse(data).success).toBe(false);
    });
  });

  describe("refreshTokenSchema", () => {
    it("should validate optional refresh token payload", () => {
      expect(refreshTokenSchema.safeParse({ refreshToken: "valid-token" }).success).toBe(true);
      expect(refreshTokenSchema.safeParse({}).success).toBe(true);
      expect(refreshTokenSchema.safeParse(undefined).success).toBe(true);
    });
  });
});

