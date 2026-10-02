import { z } from "zod";

const registerSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .max(100, "Name must be less than 100 characters long"),

  email: z
    .string({ message: "Email is required" })
    .trim()
    .email("Invalid email address")
    .toLowerCase(),

  password: z
    .string({ message: "Password is required" })
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password must be less than 100 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
});

const loginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .trim()
    .email("Invalid email address")
    .toLowerCase(),

  password: z
    .string({ message: "Password is required" })
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password must be less than 100 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
});

const refreshTokenSchema = z
  .object({
    refreshToken: z
      .string({ message: "Refresh token is required" })
      .trim()
      .min(1, "Refresh token is required")
      .optional(),
  })
  .optional();

export { registerSchema, loginSchema, refreshTokenSchema };
