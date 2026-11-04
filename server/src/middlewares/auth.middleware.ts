import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import ApiError from "../utils/ApiError";
import AsyncWrapper from "../utils/asyncWrapper";
import type { AuthenticatedUser, TokenPayload } from "../types/auth.types";
import redisClient from "../config/redis";

const authenticate = AsyncWrapper(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(
        ApiError.unauthorized("Authentication required: No token provided"),
      );
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    let decoded: TokenPayload;
    let sessionKey;

    try {
      decoded = jwt.verify(token, secret!) as TokenPayload;
      sessionKey = `user:session:${decoded.user_id}`;

      const cachedUser = await redisClient.get(sessionKey);
      if (cachedUser) {
        req.user = JSON.parse(cachedUser);
        return next();
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(
          ApiError.unauthorized(
            "Access token has expired. Please refresh your token.",
          ),
        );
      }
      return next(ApiError.unauthorized("Invalid access token"));
    }

    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [decoded.user_id],
    );

    if (result.rows.length === 0) {
      return next(ApiError.unauthorized("User account no longer exists"));
    }

    const user = result.rows[0] as AuthenticatedUser;

    await redisClient.set(sessionKey, JSON.stringify(user), "EX", 900);

    req.user = user;
    return next();
  },
);

export default authenticate;
