import { describe, it, expect } from "vitest";
import {
  TRANSACTION_CATEGORIES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CURRENCY,
  SUPPORTED_CURRENCIES,
  DATE_FORMATS,
  PAGINATION,
  CATEGORY_EMOJIS,
  CATEGORY_COLORS,
  FREQUENCY_OPTIONS,
  FREQUENCY_LABELS,
} from "@/lib/constants";

describe("Constants", () => {
  describe("TRANSACTION_CATEGORIES", () => {
    it("should contain expected categories", () => {
      expect(TRANSACTION_CATEGORIES).toContain("Food");
      expect(TRANSACTION_CATEGORIES).toContain("Salary");
      expect(TRANSACTION_CATEGORIES).toContain("Others");
    });

    it("should be non-empty", () => {
      expect(TRANSACTION_CATEGORIES.length).toBeGreaterThan(0);
    });
  });

  describe("EXPENSE_CATEGORIES", () => {
    it("should be a subset of TRANSACTION_CATEGORIES", () => {
      for (const cat of EXPENSE_CATEGORIES) {
        expect(TRANSACTION_CATEGORIES).toContain(cat);
      }
    });

    it("should not contain income-only categories", () => {
      expect(EXPENSE_CATEGORIES).not.toContain("Salary");
      expect(EXPENSE_CATEGORIES).not.toContain("Freelance");
    });
  });

  describe("INCOME_CATEGORIES", () => {
    it("should be a subset of TRANSACTION_CATEGORIES", () => {
      for (const cat of INCOME_CATEGORIES) {
        expect(TRANSACTION_CATEGORIES).toContain(cat);
      }
    });

    it("should contain Salary and Freelance", () => {
      expect(INCOME_CATEGORIES).toContain("Salary");
      expect(INCOME_CATEGORIES).toContain("Freelance");
    });
  });

  describe("CURRENCY", () => {
    it("should have INR configuration", () => {
      expect(CURRENCY.code).toBe("INR");
      expect(CURRENCY.symbol).toBe("₹");
      expect(CURRENCY.locale).toBe("en-IN");
    });
  });

  describe("DATE_FORMATS", () => {
    it("should have all format keys", () => {
      expect(DATE_FORMATS).toHaveProperty("display");
      expect(DATE_FORMATS).toHaveProperty("displayLong");
      expect(DATE_FORMATS).toHaveProperty("input");
      expect(DATE_FORMATS).toHaveProperty("monthYear");
    });
  });

  describe("PAGINATION", () => {
    it("should have a default page size", () => {
      expect(PAGINATION.defaultPageSize).toBe(10);
    });

    it("should have page size options including the default", () => {
      expect(PAGINATION.pageSizeOptions).toContain(
        PAGINATION.defaultPageSize,
      );
    });
  });

  describe("CATEGORY_EMOJIS", () => {
    it("should contain 30 emojis", () => {
      expect(CATEGORY_EMOJIS).toHaveLength(30);
    });

    it("should contain common emojis", () => {
      expect(CATEGORY_EMOJIS).toContain("🍔");
      expect(CATEGORY_EMOJIS).toContain("📦");
    });
  });

  describe("CATEGORY_COLORS", () => {
    it("should contain 20 colors", () => {
      expect(CATEGORY_COLORS).toHaveLength(20);
    });

    it("should contain valid hex colors", () => {
      for (const color of CATEGORY_COLORS) {
        expect(color).toMatch(/^#[0-9a-f]{6}$/);
      }
    });
  });

  describe("FREQUENCY_OPTIONS", () => {
    it("should contain 4 frequency options", () => {
      expect(FREQUENCY_OPTIONS).toHaveLength(4);
    });

    it("should have value and label for each option", () => {
      for (const opt of FREQUENCY_OPTIONS) {
        expect(opt).toHaveProperty("value");
        expect(opt).toHaveProperty("label");
      }
    });

    it("should include monthly", () => {
      expect(FREQUENCY_OPTIONS.map((o) => o.value)).toContain("monthly");
    });
  });

  describe("FREQUENCY_LABELS", () => {
    it("should map all frequency values", () => {
      expect(FREQUENCY_LABELS.daily).toBe("Daily");
      expect(FREQUENCY_LABELS.weekly).toBe("Weekly");
      expect(FREQUENCY_LABELS.monthly).toBe("Monthly");
      expect(FREQUENCY_LABELS.yearly).toBe("Yearly");
    });
  });

  describe("SUPPORTED_CURRENCIES", () => {
    it("should contain at least 10 currencies", () => {
      expect(SUPPORTED_CURRENCIES.length).toBeGreaterThanOrEqual(10);
    });

    it("should include INR as default", () => {
      const inr = SUPPORTED_CURRENCIES.find((c) => c.code === "INR");
      expect(inr).toBeDefined();
      expect(inr?.symbol).toBe("₹");
    });

    it("should include USD", () => {
      const usd = SUPPORTED_CURRENCIES.find((c) => c.code === "USD");
      expect(usd).toBeDefined();
      expect(usd?.symbol).toBe("$");
    });

    it("should have code, symbol, locale, and name for each currency", () => {
      for (const c of SUPPORTED_CURRENCIES) {
        expect(c.code).toBeTruthy();
        expect(c.symbol).toBeTruthy();
        expect(c.locale).toBeTruthy();
        expect(c.name).toBeTruthy();
      }
    });

    it("should have unique codes", () => {
      const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
      expect(new Set(codes).size).toBe(codes.length);
    });
  });
});
