import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import ApiError from "../utils/ApiError";
import AsyncWrapper from "../utils/asyncWrapper";
import type { AuthenticatedUser, TokenPayload } from "../types/auth.types";

/**
 * Extracts the access token from Authorization header (Bearer token) or Cookies
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7).trim();
    }
    return authHeader.trim();
  }

  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};

/**
 * Middleware to authenticate requests using JWT access token.
 * Populates req.user if valid, otherwise passes ApiError.unauthorized to next.
 */
export const authenticate = AsyncWrapper(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token = extractToken(req);

    if (!token) {
      return next(ApiError.unauthorized("Authentication required: No token provided"));
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      return next(ApiError.internal("JWT access secret is not configured on the server"));
    }

    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(token, secret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(
          ApiError.unauthorized("Access token has expired. Please refresh your token.")
        );
      }
      return next(ApiError.unauthorized("Invalid access token"));
    }

    if (!decoded || !decoded.user_id) {
      return next(ApiError.unauthorized("Invalid token payload"));
    }

    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [decoded.user_id]
    );

    if (result.rows.length === 0) {
      return next(ApiError.unauthorized("User account no longer exists"));
    }

    req.user = result.rows[0] as AuthenticatedUser;
    next();
  }
);

/**
 * Middleware for optional authentication.
 * Attaches user to req.user if a valid token is provided, but continues if not.
 */
export const optionalAuthenticate = AsyncWrapper(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, secret) as TokenPayload;
      if (decoded?.user_id) {
        const result = await pool.query(
          "SELECT id, name, email, created_at FROM users WHERE id = $1",
          [decoded.user_id]
        );
        if (result.rows.length > 0) {
          req.user = result.rows[0] as AuthenticatedUser;
        }
      }
    } catch {
      // For optional auth, continue even if token is invalid or expired
    }

    next();
  }
);

export default authenticate;
