import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import ApiError from "../utils/ApiError";

interface ErrorResponseBody {
  success: false;
  message: string;
  errors?: unknown[];
  stack?: string;
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response | void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: unknown[] | undefined;
  let isOperational = false;
  let stack: string | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
    isOperational = err.isOperational;
    stack = err.stack;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    isOperational = true;
    stack = err.stack;
  } else if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    message = "Malformed JSON payload in request body";
    isOperational = true;
    stack = err.stack;
  } else if (typeof err === "object" && err !== null) {
    const errorObj = err as Record<string, unknown>;

    if (errorObj["code"] === "23505") {
      statusCode = 409;
      message =
        typeof errorObj["detail"] === "string"
          ? errorObj["detail"]
          : "Duplicate field value entered";
      isOperational = true;
    } else if (errorObj["code"] === "23503") {
      statusCode = 400;
      message =
        typeof errorObj["detail"] === "string"
          ? errorObj["detail"]
          : "Referenced resource does not exist";
      isOperational = true;
    } else if (errorObj["code"] === "22P02") {
      statusCode = 400;
      message = "Invalid input syntax for query parameter or field";
      isOperational = true;
    } else {
      if (typeof errorObj["statusCode"] === "number") {
        statusCode = errorObj["statusCode"];
      } else if (typeof errorObj["status"] === "number") {
        statusCode = errorObj["status"];
      }

      if (typeof errorObj["message"] === "string") {
        message = errorObj["message"];
      }

      if (Array.isArray(errorObj["errors"])) {
        errors = errorObj["errors"];
      }
    }

    if (typeof errorObj["stack"] === "string") {
      stack = errorObj["stack"];
    }
  } else if (typeof err === "string") {
    message = err;
  }

  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && !isOperational && statusCode === 500) {
    message = "Something went wrong on our end. Please try again later.";
  }

  const response: ErrorResponseBody = {
    success: false,
    message,
    ...(errors && errors.length > 0 ? { errors } : {}),
    ...(!isProduction && stack ? { stack } : {}),
  };

  return res.status(statusCode).json(response);
};

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

export default errorHandler;
