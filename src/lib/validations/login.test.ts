import { describe, it, expect } from "vitest";
import { loginSchema } from "@/lib/validations";

describe("loginSchema", () => {
  const validData = {
    email: "user@example.com",
    password: "secret123",
  };

  it("should accept valid login data", () => {
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty email", () => {
    const result = loginSchema.safeParse({ ...validData, email: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path.includes("email"));
      expect(emailError?.message).toBe("Email is required");
    }
  });

  it("should reject invalid email format", () => {
    const result = loginSchema.safeParse({ ...validData, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path.includes("email"));
      expect(emailError?.message).toBe("Please enter a valid email address");
    }
  });

  it("should reject empty password", () => {
    const result = loginSchema.safeParse({ ...validData, password: "" });
    expect(result.success).toBe(false);
  });

  it("should reject password shorter than 6 characters", () => {
    const result = loginSchema.safeParse({ ...validData, password: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const pwError = result.error.issues.find((i) => i.path.includes("password"));
      expect(pwError?.message).toBe("Password must be at least 6 characters");
    }
  });

  it("should accept password with exactly 6 characters", () => {
    const result = loginSchema.safeParse({ ...validData, password: "123456" });
    expect(result.success).toBe(true);
  });

  it("should reject when both fields are empty", () => {
    const result = loginSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});
