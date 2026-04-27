import { describe, it, expect } from "vitest";
import { escapeCSV, generateTransactionCSV } from "@/lib/csv";
import type { Transaction } from "@/types";

// =============================================================================
// CSV Export Logic Tests
// =============================================================================
// Tests the CSV generation logic from the shared csv module.
// =============================================================================

describe("CSV Export", () => {
  // ---------------------------------------------------------------------------
  // escapeCSV
  // ---------------------------------------------------------------------------
  describe("escapeCSV", () => {
    it("should return plain text as-is", () => {
      expect(escapeCSV("hello")).toBe("hello");
    });

    it("should wrap text with commas in quotes", () => {
      expect(escapeCSV("hello, world")).toBe('"hello, world"');
    });

    it("should escape double quotes", () => {
      expect(escapeCSV('say "hello"')).toBe('"say ""hello"""');
    });

    it("should wrap text with newlines in quotes", () => {
      expect(escapeCSV("line1\nline2")).toBe('"line1\nline2"');
    });

    it("should handle empty string", () => {
      expect(escapeCSV("")).toBe("");
    });
  });

  // ---------------------------------------------------------------------------
  // CSV Generation
  // ---------------------------------------------------------------------------
  describe("generateTransactionCSV", () => {
    const mockTransactions: Transaction[] = [
      {
        id: 1,
        user_id: "user-1",
        amount: "5000",
        type: "income",
        description: "Salary",
        category: "Salary",
        currency: "INR",
        transaction_date: "2026-04-01T00:00:00.000Z",
        created_at: "2026-04-01T00:00:00.000Z",
      },
      {
        id: 2,
        user_id: "user-1",
        amount: "1500",
        type: "expense",
        description: "Groceries",
        category: "Food",
        currency: "INR",
        transaction_date: "2026-04-05T00:00:00.000Z",
        created_at: "2026-04-05T00:00:00.000Z",
      },
    ];

    it("should include summary section at the top", () => {
      const csv = generateTransactionCSV(mockTransactions);
      const lines = csv.split("\n");
      expect(lines[0]).toBe("Summary,,,,,");
      expect(lines[1]).toContain("Total Income");
      expect(lines[1]).toContain("5000.00");
      expect(lines[2]).toContain("Total Expense");
      expect(lines[2]).toContain("1500.00");
      expect(lines[3]).toContain("Net");
      expect(lines[3]).toContain("3500.00");
    });

    it("should include column headers after summary", () => {
      const csv = generateTransactionCSV(mockTransactions);
      const lines = csv.split("\n");
      expect(lines[5]).toBe("Date,Type,Category,Description,Amount,Currency");
    });

    it("should format income amounts without negative sign", () => {
      const csv = generateTransactionCSV(mockTransactions);
      const lines = csv.split("\n");
      expect(lines[6]).toContain("5000");
      expect(lines[6]).not.toContain("-5000");
    });

    it("should format expense amounts with negative sign", () => {
      const csv = generateTransactionCSV(mockTransactions);
      const lines = csv.split("\n");
      expect(lines[7]).toContain("-1500");
    });

    it("should handle empty transactions", () => {
      const csv = generateTransactionCSV([]);
      const lines = csv.split("\n");
      expect(lines[1]).toContain("0.00");
      expect(lines[5]).toBe("Date,Type,Category,Description,Amount,Currency");
      expect(lines.length).toBe(6); // summary (5) + headers (1), no data rows
    });

    it("should handle null description and category", () => {
      const tx: Transaction[] = [{
        id: 1,
        user_id: "user-1",
        amount: "100",
        type: "expense",
        description: null,
        category: null,
        currency: "USD",
        transaction_date: "2026-04-10T00:00:00.000Z",
        created_at: "2026-04-10T00:00:00.000Z",
      }];
      const csv = generateTransactionCSV(tx);
      const lines = csv.split("\n");
      // Last line should have empty fields for null values
      expect(lines[6]).toContain(",,");
    });

    it("should escape descriptions containing commas", () => {
      const tx: Transaction[] = [{
        id: 1,
        user_id: "user-1",
        amount: "200",
        type: "expense",
        description: "Rent, utilities, and internet",
        category: "Bills",
        currency: "INR",
        transaction_date: "2026-04-01T00:00:00.000Z",
        created_at: "2026-04-01T00:00:00.000Z",
      }];
      const csv = generateTransactionCSV(tx);
      expect(csv).toContain('"Rent, utilities, and internet"');
    });

    it("should show correct transaction counts in summary", () => {
      const csv = generateTransactionCSV(mockTransactions);
      const lines = csv.split("\n");
      expect(lines[1]).toContain("1 transactions");
      expect(lines[2]).toContain("1 transactions");
      expect(lines[3]).toContain("2 transactions");
    });
  });
});
