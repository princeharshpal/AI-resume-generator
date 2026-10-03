import type { Response, Request } from "express";
import AsyncWrapper from "../utils/asyncWrapper";
import pool from "../config/db";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import ApiError from "../utils/ApiError";

interface TokenPayload extends JwtPayload {
  user_id: number;
  email: string;
  name: string;
}

const isProduction = process.env.NODE_ENV === "production";

const getUser = AsyncWrapper(async (req: Request, res: Response) => {
  const query = "SELECT * FROM users";
  const rows = await pool.query(query);
  res.json(rows);
});

const registerUser = AsyncWrapper(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const user = await pool.query("SELECT email FROM users WHERE email=$1", [
    email,
  ]);

  if (user.rows.length > 0) throw new ApiError(400, "User Already Exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const rows = await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, hashedPassword],
  );

  return res.status(201).json({ message: "User registered Successfully" });
});

const loginUser = AsyncWrapper(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (user.rows.length === 0) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const isMatch = await bcrypt.compare(password, user.rows[0].password);
  if (!isMatch) throw new ApiError(401, "Invalid Credentials");

  const tokenPayload = {
    user_id: user.rows[0].id,
    email: user.rows[0].email,
    name: user.rows[0].name,
  };

  const accessToken = jwt.sign(
    tokenPayload,
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign(
    tokenPayload,
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" },
  );

  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [
      user.rows[0].id,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ],
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { password: _, ...userWithOutPassword } = user.rows[0];

  return res.status(200).json({
    message: "User logged in Successfully",
    accessToken,
    user: userWithOutPassword,
  });
});

const refreshToken = AsyncWrapper(async (req: Request, res: Response) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    req.headers.authorization?.split(" ")[1];

  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as TokenPayload;
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (!decoded?.user_id) throw new ApiError(401, "Invalid token payload");

  const isTokenValid = await pool.query(
    "SELECT * FROM refresh_tokens WHERE user_id = $1 AND token = $2",
    [decoded.user_id, incomingRefreshToken],
  );

  if (isTokenValid.rows.length === 0) {
    throw new ApiError(401, "Invalid refresh token or session expired");
  }

  const user = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1",
    [decoded.user_id],
  );

  if (user.rows.length === 0) throw new ApiError(401, "User not found");

  const existingUser = user.rows[0];

  const tokenPayload: TokenPayload = {
    user_id: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
  };

  const newAccessToken = jwt.sign(
    tokenPayload,
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: "15m" },
  );

  const newRefreshToken = jwt.sign(
    tokenPayload,
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" },
  );

  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    "UPDATE refresh_tokens SET token = $1, expires_at = $2 WHERE user_id = $3 AND token = $4",
    [newRefreshToken, newExpiresAt, decoded.user_id, incomingRefreshToken],
  );

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    accessToken: newAccessToken,
    user: existingUser,
  });
});

export { getUser, loginUser, registerUser, refreshToken };
