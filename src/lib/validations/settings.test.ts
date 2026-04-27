import { describe, it, expect } from "vitest";
import { settingsSchema } from "@/lib/validations";

describe("settingsSchema", () => {
  const validData = {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1990-05-15",
    defaultCurrency: "INR",
    dateFormat: "dd/MM/yyyy",
  };

  it("should accept valid settings data", () => {
    const result = settingsSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept empty first name (optional)", () => {
    const result = settingsSchema.safeParse({ ...validData, firstName: "" });
    expect(result.success).toBe(true);
  });

  it("should accept empty last name (optional)", () => {
    const result = settingsSchema.safeParse({ ...validData, lastName: "" });
    expect(result.success).toBe(true);
  });

  it("should accept empty date of birth (optional)", () => {
    const result = settingsSchema.safeParse({ ...validData, dateOfBirth: "" });
    expect(result.success).toBe(true);
  });

  it("should accept missing optional fields", () => {
    const result = settingsSchema.safeParse({
      defaultCurrency: "USD",
      dateFormat: "MM/dd/yyyy",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty currency", () => {
    const result = settingsSchema.safeParse({ ...validData, defaultCurrency: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const error = result.error.issues.find((i) => i.path.includes("defaultCurrency"));
      expect(error?.message).toBe("Please select a currency");
    }
  });

  it("should reject empty date format", () => {
    const result = settingsSchema.safeParse({ ...validData, dateFormat: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const error = result.error.issues.find((i) => i.path.includes("dateFormat"));
      expect(error?.message).toBe("Please select a date format");
    }
  });

  it("should accept with only required fields", () => {
    const result = settingsSchema.safeParse({
      defaultCurrency: "EUR",
      dateFormat: "yyyy-MM-dd",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe("");
      expect(result.data.lastName).toBe("");
      expect(result.data.dateOfBirth).toBe("");
    }
  });
});
