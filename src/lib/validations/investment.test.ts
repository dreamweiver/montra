import { describe, it, expect } from "vitest";
import { investmentSchema } from "@/lib/validations/investment";

describe("investmentSchema", () => {
  const validData = {
    name: "Apple Inc.",
    type: "stock" as const,
    symbol: "AAPL",
    quantity: "10",
    purchase_price: "150.50",
    current_price: "185.00",
    currency: "USD",
    purchase_date: new Date("2024-01-15"),
    notes: "Long term hold",
  };

  it("should pass with valid complete data", () => {
    const result = investmentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should pass without optional fields (symbol, notes)", () => {
    const { symbol, notes, ...required } = validData;
    const result = investmentSchema.safeParse(required);
    expect(result.success).toBe(true);
  });

  it("should fail when name is empty", () => {
    const result = investmentSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
  });

  it("should fail when name exceeds 100 characters", () => {
    const result = investmentSchema.safeParse({ ...validData, name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("should fail with invalid type value", () => {
    const result = investmentSchema.safeParse({ ...validData, type: "nft" });
    expect(result.success).toBe(false);
  });

  it("should pass with all valid type values", () => {
    const types = ["stock", "mutual_fund", "fixed_deposit", "gold", "crypto", "bond", "real_estate"];
    for (const type of types) {
      const result = investmentSchema.safeParse({ ...validData, type });
      expect(result.success).toBe(true);
    }
  });

  it("should fail when quantity is empty", () => {
    const result = investmentSchema.safeParse({ ...validData, quantity: "" });
    expect(result.success).toBe(false);
  });

  it("should fail when quantity is zero", () => {
    const result = investmentSchema.safeParse({ ...validData, quantity: "0" });
    expect(result.success).toBe(false);
  });

  it("should fail when quantity is negative", () => {
    const result = investmentSchema.safeParse({ ...validData, quantity: "-5" });
    expect(result.success).toBe(false);
  });

  it("should fail when quantity is non-numeric", () => {
    const result = investmentSchema.safeParse({ ...validData, quantity: "abc" });
    expect(result.success).toBe(false);
  });

  it("should fail when purchase_price is zero", () => {
    const result = investmentSchema.safeParse({ ...validData, purchase_price: "0" });
    expect(result.success).toBe(false);
  });

  it("should fail when purchase_price is negative", () => {
    const result = investmentSchema.safeParse({ ...validData, purchase_price: "-10" });
    expect(result.success).toBe(false);
  });

  it("should fail when current_price is zero", () => {
    const result = investmentSchema.safeParse({ ...validData, current_price: "0" });
    expect(result.success).toBe(false);
  });

  it("should fail when current_price is non-numeric", () => {
    const result = investmentSchema.safeParse({ ...validData, current_price: "xyz" });
    expect(result.success).toBe(false);
  });

  it("should fail when currency is empty", () => {
    const result = investmentSchema.safeParse({ ...validData, currency: "" });
    expect(result.success).toBe(false);
  });

  it("should fail when purchase_date is not a Date", () => {
    const result = investmentSchema.safeParse({ ...validData, purchase_date: "not-a-date" });
    expect(result.success).toBe(false);
  });
});
