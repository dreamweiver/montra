import { describe, it, expect } from "vitest";
import { budgetSchema } from "@/lib/validations";

describe("budgetSchema", () => {
  const validData = {
    monthlyLimit: "50000",
    currency: "INR",
  };

  it("should accept valid budget data", () => {
    const result = budgetSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept decimal amounts", () => {
    const result = budgetSchema.safeParse({ ...validData, monthlyLimit: "1500.50" });
    expect(result.success).toBe(true);
  });

  it("should reject empty monthly limit", () => {
    const result = budgetSchema.safeParse({ ...validData, monthlyLimit: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const error = result.error.issues.find((i) => i.path.includes("monthlyLimit"));
      expect(error?.message).toBe("Budget amount is required");
    }
  });

  it("should reject zero amount", () => {
    const result = budgetSchema.safeParse({ ...validData, monthlyLimit: "0" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const error = result.error.issues.find((i) => i.path.includes("monthlyLimit"));
      expect(error?.message).toBe("Budget amount must be greater than 0");
    }
  });

  it("should reject negative amount", () => {
    const result = budgetSchema.safeParse({ ...validData, monthlyLimit: "-100" });
    expect(result.success).toBe(false);
  });

  it("should reject non-numeric amount", () => {
    const result = budgetSchema.safeParse({ ...validData, monthlyLimit: "abc" });
    expect(result.success).toBe(false);
  });

  it("should reject empty currency", () => {
    const result = budgetSchema.safeParse({ ...validData, currency: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const error = result.error.issues.find((i) => i.path.includes("currency"));
      expect(error?.message).toBe("Please select a currency");
    }
  });

  it("should accept valid currency code", () => {
    const result = budgetSchema.safeParse({ ...validData, currency: "USD" });
    expect(result.success).toBe(true);
  });
});
