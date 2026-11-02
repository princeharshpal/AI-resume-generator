import { describe, it, expect } from "vitest";
import { ApiError } from "../../src/utils/ApiError";

describe("ApiError Utility", () => {
  it("should create an instance with default and custom values", () => {
    const error = new ApiError(400, "Custom Bad Request", [
      { field: "name", message: "Required" },
    ]);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Custom Bad Request");
    expect(error.isOperational).toBe(true);
    expect(error.errors).toEqual([{ field: "name", message: "Required" }]);
  });

  it("should set default message if not provided", () => {
    const error = new ApiError(500);
    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(500);
    expect(error.errors).toBeUndefined();
  });

  it("should create badRequest error correctly", () => {
    const error = ApiError.badRequest("Invalid input", [{ field: "email" }]);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Invalid input");
    expect(error.errors).toEqual([{ field: "email" }]);
  });

  it("should create unauthorized error correctly", () => {
    const error = ApiError.unauthorized();
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Unauthorized");
  });

  it("should create forbidden error correctly", () => {
    const error = ApiError.forbidden("Access denied");
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe("Access denied");
  });

  it("should create notFound error correctly", () => {
    const error = ApiError.notFound("User not found");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("User not found");
  });

  it("should create conflict error correctly", () => {
    const error = ApiError.conflict("Email already in use");
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe("Email already in use");
  });

  it("should create internal server error correctly", () => {
    const error = ApiError.internal("Database unreachable");
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Database unreachable");
  });
});
