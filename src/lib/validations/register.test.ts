import { describe, it, expect } from "vitest";
import { registerSchema } from "@/lib/validations";

describe("registerSchema", () => {
  const validData = {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "2000-01-15",
    email: "john@example.com",
    password: "secret123",
  };

  it("should accept valid registration data", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should trim first and last name", () => {
    const result = registerSchema.safeParse({
      ...validData,
      firstName: "  John  ",
      lastName: "  Doe  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe("John");
      expect(result.data.lastName).toBe("Doe");
    }
  });

  it("should reject empty first name", () => {
    const result = registerSchema.safeParse({ ...validData, firstName: "" });
    expect(result.success).toBe(false);
  });

  it("should reject empty last name", () => {
    const result = registerSchema.safeParse({ ...validData, lastName: "" });
    expect(result.success).toBe(false);
  });

  it("should reject empty date of birth", () => {
    const result = registerSchema.safeParse({ ...validData, dateOfBirth: "" });
    expect(result.success).toBe(false);
  });

  it("should reject user under 18", () => {
    const today = new Date();
    const underageDate = `${today.getFullYear() - 10}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const result = registerSchema.safeParse({ ...validData, dateOfBirth: underageDate });
    expect(result.success).toBe(false);
    if (!result.success) {
      const dobError = result.error.issues.find((i) => i.path.includes("dateOfBirth"));
      expect(dobError?.message).toBe("You must be at least 18 years old");
    }
  });

  it("should accept user exactly 18", () => {
    const today = new Date();
    const exactlyEighteen = `${today.getFullYear() - 18}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const result = registerSchema.safeParse({ ...validData, dateOfBirth: exactlyEighteen });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = registerSchema.safeParse({ ...validData, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("should reject empty email", () => {
    const result = registerSchema.safeParse({ ...validData, email: "" });
    expect(result.success).toBe(false);
  });

  it("should reject password shorter than 6 characters", () => {
    const result = registerSchema.safeParse({ ...validData, password: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const pwError = result.error.issues.find((i) => i.path.includes("password"));
      expect(pwError?.message).toBe("Password must be at least 6 characters");
    }
  });

  it("should accept password with exactly 6 characters", () => {
    const result = registerSchema.safeParse({ ...validData, password: "123456" });
    expect(result.success).toBe(true);
  });
});
