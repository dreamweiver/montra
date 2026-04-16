import { describe, it, expect } from "vitest";
import { format } from "date-fns";

// =============================================================================
// CSV Export Logic Tests
// =============================================================================
// Tests the CSV generation logic extracted from the transactions page.
// =============================================================================

// Replicate the escapeCSV function from the transactions page
function escapeCSV(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

interface MockTransaction {
  id: number;
  amount: string;
  type: "income" | "expense";
  description: string | null;
  category: string | null;
  currency: string;
  transaction_date: string;
}

function generateCSV(transactions: MockTransaction[]): string {
  const totals = transactions.reduce(
    (acc, tx) => {
      const amount = parseFloat(tx.amount);
      if (tx.type === "income") {
        acc.income += amount;
        acc.incomeCount++;
      } else {
        acc.expense += amount;
        acc.expenseCount++;
      }
      return acc;
    },
    { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 }
  );
  const net = totals.income - totals.expense;

  const summaryRows = [
    ["Summary", "", "", "", "", ""],
    ["Total Income", "", "", "", String(totals.income.toFixed(2)), `${totals.incomeCount} transactions`],
    ["Total Expense", "", "", "", String(totals.expense.toFixed(2)), `${totals.expenseCount} transactions`],
    ["Net", "", "", "", String(net.toFixed(2)), `${transactions.length} transactions`],
    ["", "", "", "", "", ""],
  ];

  const headers = ["Date", "Type", "Category", "Description", "Amount", "Currency"];
  const rows = transactions.map((tx) => [
    format(new Date(tx.transaction_date), "dd MMM yyyy"),
    tx.type,
    tx.category || "",
    tx.description || "",
    `${tx.type === "income" ? "" : "-"}${tx.amount}`,
    tx.currency,
  ]);

  return [...summaryRows, headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n");
}

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
  describe("generateCSV", () => {
    const mockTransactions: MockTransaction[] = [
      {
        id: 1,
        amount: "5000",
        type: "income",
        description: "Salary",
        category: "Salary",
        currency: "INR",
        transaction_date: "2026-04-01T00:00:00.000Z",
      },
      {
        id: 2,
        amount: "1500",
        type: "expense",
        description: "Groceries",
        category: "Food",
        currency: "INR",
        transaction_date: "2026-04-05T00:00:00.000Z",
      },
    ];

    it("should include summary section at the top", () => {
      const csv = generateCSV(mockTransactions);
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
      const csv = generateCSV(mockTransactions);
      const lines = csv.split("\n");
      expect(lines[5]).toBe("Date,Type,Category,Description,Amount,Currency");
    });

    it("should format income amounts without negative sign", () => {
      const csv = generateCSV(mockTransactions);
      const lines = csv.split("\n");
      expect(lines[6]).toContain("5000");
      expect(lines[6]).not.toContain("-5000");
    });

    it("should format expense amounts with negative sign", () => {
      const csv = generateCSV(mockTransactions);
      const lines = csv.split("\n");
      expect(lines[7]).toContain("-1500");
    });

    it("should handle empty transactions", () => {
      const csv = generateCSV([]);
      const lines = csv.split("\n");
      expect(lines[1]).toContain("0.00");
      expect(lines[5]).toBe("Date,Type,Category,Description,Amount,Currency");
      expect(lines.length).toBe(6); // summary (5) + headers (1), no data rows
    });

    it("should handle null description and category", () => {
      const tx: MockTransaction[] = [{
        id: 1,
        amount: "100",
        type: "expense",
        description: null,
        category: null,
        currency: "USD",
        transaction_date: "2026-04-10T00:00:00.000Z",
      }];
      const csv = generateCSV(tx);
      const lines = csv.split("\n");
      // Last line should have empty fields for null values
      expect(lines[6]).toContain(",,");
    });

    it("should escape descriptions containing commas", () => {
      const tx: MockTransaction[] = [{
        id: 1,
        amount: "200",
        type: "expense",
        description: "Rent, utilities, and internet",
        category: "Bills",
        currency: "INR",
        transaction_date: "2026-04-01T00:00:00.000Z",
      }];
      const csv = generateCSV(tx);
      expect(csv).toContain('"Rent, utilities, and internet"');
    });

    it("should show correct transaction counts in summary", () => {
      const csv = generateCSV(mockTransactions);
      const lines = csv.split("\n");
      expect(lines[1]).toContain("1 transactions");
      expect(lines[2]).toContain("1 transactions");
      expect(lines[3]).toContain("2 transactions");
    });
  });
});
