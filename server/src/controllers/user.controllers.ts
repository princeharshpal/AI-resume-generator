import type { Response, Request } from "express";
import AsyncWrapper from "../utils/asyncWrapper";
import pool from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import type { TokenPayload } from "../types/auth.types";

const isProduction = process.env.NODE_ENV === "production";

const registerUser = AsyncWrapper(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const user = await pool.query("SELECT email FROM users WHERE email=$1", [
    email,
  ]);

  if (user.rows.length > 0) throw new ApiError(400, "User Already Exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
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
    secure: isProduction,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
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

  if (!incomingRefreshToken) {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
    });
    throw new ApiError(401, "Unauthorized request");
  }

  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as TokenPayload;
  } catch (error) {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
      incomingRefreshToken,
    ]);
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
    });
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (!decoded?.user_id) throw new ApiError(401, "Invalid token payload");

  const isTokenValid = await pool.query(
    "SELECT * FROM refresh_tokens WHERE user_id = $1 AND token = $2",
    [decoded.user_id, incomingRefreshToken],
  );

  if (isTokenValid.rows.length === 0) {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
    });
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
    path: "/",
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    accessToken: newAccessToken,
    user: existingUser,
  });
});

const getProfile = AsyncWrapper(async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

const logoutUser = AsyncWrapper(async (req: Request, res: Response) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.substring(7)
      : req.headers.authorization);

  if (incomingRefreshToken) {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
      incomingRefreshToken,
    ]);
  }

  const incomingAccessToken =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.substring(7)
      : null);

  if (incomingAccessToken) {
    try {
      const decoded = jwt.decode(incomingAccessToken) as TokenPayload | null;
      if (decoded?.user_id && !incomingRefreshToken) {
        await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [
          decoded.user_id,
        ]);
      }
    } catch {}
  }

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export { loginUser, registerUser, refreshToken, getProfile, logoutUser };
