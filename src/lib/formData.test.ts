import { describe, it, expect } from "vitest";
import { parseTransactionFormData, parseInvestmentFormData } from "@/lib/formData";

describe("parseTransactionFormData", () => {
  it("should extract all transaction fields", () => {
    const fd = new FormData();
    fd.set("amount", "150.50");
    fd.set("type", "income");
    fd.set("description", "Freelance work");
    fd.set("category", "Salary");
    fd.set("currency", "USD");
    fd.set("transaction_date", "2026-04-15");

    const result = parseTransactionFormData(fd);

    expect(result).toEqual({
      amount: "150.50",
      type: "income",
      description: "Freelance work",
      category: "Salary",
      currency: "USD",
      transaction_date: "2026-04-15",
    });
  });

  it("should default currency to INR when not provided", () => {
    const fd = new FormData();
    fd.set("amount", "100");
    fd.set("type", "expense");
    fd.set("description", "Groceries");
    fd.set("category", "Food");
    fd.set("transaction_date", "2026-04-10");

    const result = parseTransactionFormData(fd);

    expect(result.currency).toBe("INR");
  });
});

describe("parseInvestmentFormData", () => {
  it("should extract all investment fields", () => {
    const fd = new FormData();
    fd.set("name", "Apple Inc");
    fd.set("symbol", "AAPL");
    fd.set("type", "stock");
    fd.set("quantity", "10");
    fd.set("purchase_price", "170.50");
    fd.set("current_price", "185.00");
    fd.set("currency", "USD");
    fd.set("purchase_date", "2026-01-15");
    fd.set("notes", "Long-term hold");

    const result = parseInvestmentFormData(fd);

    expect(result).toEqual({
      name: "Apple Inc",
      symbol: "AAPL",
      type: "stock",
      quantity: "10",
      purchase_price: "170.50",
      current_price: "185.00",
      currency: "USD",
      purchase_date: "2026-01-15",
      notes: "Long-term hold",
    });
  });

  it("should default symbol to null when not provided", () => {
    const fd = new FormData();
    fd.set("name", "Gold ETF");
    fd.set("type", "etf");
    fd.set("quantity", "5");
    fd.set("purchase_price", "50");
    fd.set("current_price", "55");
    fd.set("purchase_date", "2026-03-01");

    const result = parseInvestmentFormData(fd);

    expect(result.symbol).toBeNull();
  });

  it("should default notes to null when not provided", () => {
    const fd = new FormData();
    fd.set("name", "Bitcoin");
    fd.set("symbol", "BTC");
    fd.set("type", "crypto");
    fd.set("quantity", "0.5");
    fd.set("purchase_price", "60000");
    fd.set("current_price", "65000");
    fd.set("purchase_date", "2026-02-20");

    const result = parseInvestmentFormData(fd);

    expect(result.notes).toBeNull();
  });

  it("should default currency to INR when not provided", () => {
    const fd = new FormData();
    fd.set("name", "Reliance");
    fd.set("symbol", "RELIANCE");
    fd.set("type", "stock");
    fd.set("quantity", "20");
    fd.set("purchase_price", "2500");
    fd.set("current_price", "2700");
    fd.set("purchase_date", "2026-04-01");

    const result = parseInvestmentFormData(fd);

    expect(result.currency).toBe("INR");
  });
});
