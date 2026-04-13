import { describe, it, expect } from "vitest";
import { recurringTransactionSchema } from "@/lib/validations";

describe("recurringTransactionSchema", () => {
  const validData = {
    amount: "500",
    type: "expense" as const,
    description: "Monthly rent",
    category: "Rent",
    frequency: "monthly" as const,
    start_date: new Date("2026-04-01"),
    end_date: null,
  };

  it("should accept valid recurring transaction data", () => {
    const result = recurringTransactionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept data without description", () => {
    const { description, ...data } = validData;
    const result = recurringTransactionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept data without end_date", () => {
    const { end_date, ...data } = validData;
    const result = recurringTransactionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept data with a valid end_date", () => {
    const result = recurringTransactionSchema.safeParse({
      ...validData,
      end_date: new Date("2027-04-01"),
    });
    expect(result.success).toBe(true);
  });

  // Amount validation
  it("should reject empty amount", () => {
    const result = recurringTransactionSchema.safeParse({
      ...validData,
      amount: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Amount is required");
    }
  });

  it("should reject zero amount", () => {
    const result = recurringTransactionSchema.safeParse({
      ...validData,
      amount: "0",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Amount must be greater than 0",
      );
    }
  });

  it("should reject negative amount", () => {
    const result = recurringTransactionSchema.safeParse({
      ...validData,
      amount: "-100",
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-numeric amount", () => {
    const result = recurringTransactionSchema.safeParse({
      ...validData,
      amount: "xyz",
    });
    expect(result.success).toBe(false);
  });

  // Type validation
  it("should accept income type", () => {
    const result = recurringTransactionSchema.safeParse({
      ...validData,
      type: "income",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid type", () => {
    const result = recurringTransactionSchema.safeParse({
      ...validData,
      type: "transfer",
    });
    expect(result.success).toBe(false);
  });

  // Category validation
  it("should reject empty category", () => {
    const result = recurringTransactionSchema.safeParse({
      ...validData,
      category: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Please select a category");
    }
  });

  // Frequency validation
  it.each(["daily", "weekly", "monthly", "yearly"] as const)(
    "should accept '%s' frequency",
    (frequency) => {
      const result = recurringTransactionSchema.safeParse({
        ...validData,
        frequency,
      });
      expect(result.success).toBe(true);
    },
  );

  it("should reject invalid frequency", () => {
    const result = recurringTransactionSchema.safeParse({
      ...validData,
      frequency: "biweekly",
    });
    expect(result.success).toBe(false);
  });

  // Date validation
  it("should reject missing start_date", () => {
    const { start_date, ...data } = validData;
    const result = recurringTransactionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-date start_date", () => {
    const result = recurringTransactionSchema.safeParse({
      ...validData,
      start_date: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});
