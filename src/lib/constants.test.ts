import { describe, it, expect } from "vitest";
import {
  TRANSACTION_CATEGORIES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CURRENCY,
  DATE_FORMATS,
  PAGINATION,
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
});
