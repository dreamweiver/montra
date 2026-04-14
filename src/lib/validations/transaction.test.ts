import { describe, it, expect } from "vitest";
import { transactionSchema, transactionFilterSchema } from "@/lib/validations";

describe("transactionSchema", () => {
  const validData = {
    amount: "100.50",
    type: "expense" as const,
    description: "Groceries",
    category: "Food",
    transaction_date: new Date("2026-04-10"),
  };

  it("should accept valid transaction data", () => {
    const result = transactionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept transaction without description", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { description, ...data } = validData;
    const result = transactionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject empty amount", () => {
    const result = transactionSchema.safeParse({ ...validData, amount: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Amount is required");
    }
  });

  it("should reject zero amount", () => {
    const result = transactionSchema.safeParse({ ...validData, amount: "0" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Amount must be greater than 0",
      );
    }
  });

  it("should reject negative amount", () => {
    const result = transactionSchema.safeParse({
      ...validData,
      amount: "-50",
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-numeric amount", () => {
    const result = transactionSchema.safeParse({
      ...validData,
      amount: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid type", () => {
    const result = transactionSchema.safeParse({
      ...validData,
      type: "transfer",
    });
    expect(result.success).toBe(false);
  });

  it("should accept income type", () => {
    const result = transactionSchema.safeParse({
      ...validData,
      type: "income",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty category", () => {
    const result = transactionSchema.safeParse({
      ...validData,
      category: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Please select a category");
    }
  });

  it("should reject missing transaction_date", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { transaction_date, ...data } = validData;
    const result = transactionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-date transaction_date", () => {
    const result = transactionSchema.safeParse({
      ...validData,
      transaction_date: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});

describe("transactionFilterSchema", () => {
  it("should accept empty filters", () => {
    const result = transactionFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept all filter types", () => {
    const result = transactionFilterSchema.safeParse({
      type: "expense",
      category: "Food",
      dateFrom: new Date("2026-01-01"),
      dateTo: new Date("2026-12-31"),
      search: "groceries",
    });
    expect(result.success).toBe(true);
  });

  it("should accept 'all' as type filter", () => {
    const result = transactionFilterSchema.safeParse({ type: "all" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid type filter", () => {
    const result = transactionFilterSchema.safeParse({ type: "transfer" });
    expect(result.success).toBe(false);
  });
});
