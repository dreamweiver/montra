import { describe, it, expect, vi, beforeEach } from "vitest";

// =============================================================================
// Mocks
// =============================================================================
const { mockSql, mockGetUser } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockGetUser: vi.fn(),
}));

vi.mock("@/db/neon", () => ({
  sql: mockSql,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

import {
  getDashboardStats,
  getSpendingByCategory,
  getIncomeByCategory,
} from "@/actions/stats";

// =============================================================================
// Tests
// =============================================================================
describe("Stats Server Actions", () => {
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
  });

  // ---------------------------------------------------------------------------
  // getDashboardStats
  // ---------------------------------------------------------------------------
  describe("getDashboardStats", () => {
    it("should return zeroed stats if not authenticated", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const result = await getDashboardStats();
      expect(result).toEqual({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
        incomeCount: 0,
        expenseCount: 0,
      });
    });

    it("should return computed stats", async () => {
      mockSql.mockResolvedValueOnce([
        {
          total_income: "5000",
          total_expense: "3000",
          transaction_count: "10",
          income_count: "4",
          expense_count: "6",
        },
      ]);
      const result = await getDashboardStats();
      expect(result.totalIncome).toBe(5000);
      expect(result.totalExpense).toBe(3000);
      expect(result.balance).toBe(2000);
      expect(result.transactionCount).toBe(10);
    });

    it("should accept date range filters", async () => {
      mockSql.mockResolvedValueOnce([
        {
          total_income: "1000",
          total_expense: "500",
          transaction_count: "3",
          income_count: "1",
          expense_count: "2",
        },
      ]);
      const result = await getDashboardStats(
        new Date("2026-01-01"),
        new Date("2026-03-31"),
      );
      expect(result.totalIncome).toBe(1000);
      expect(result.balance).toBe(500);
    });

    it("should return zeroed stats on error", async () => {
      mockSql.mockRejectedValueOnce(new Error("DB error"));
      const result = await getDashboardStats();
      expect(result.balance).toBe(0);
      expect(result.transactionCount).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // getSpendingByCategory
  // ---------------------------------------------------------------------------
  describe("getSpendingByCategory", () => {
    it("should return empty array if not authenticated", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const result = await getSpendingByCategory();
      expect(result).toEqual([]);
    });

    it("should return spending breakdown with percentages", async () => {
      mockSql.mockResolvedValueOnce([
        { category: "Food", total: "600", color: "#ef4444", icon: "🍔" },
        { category: "Transport", total: "400", color: "#f97316", icon: "🚗" },
      ]);
      const result = await getSpendingByCategory();
      expect(result).toHaveLength(2);
      expect(result[0].category).toBe("Food");
      expect(result[0].amount).toBe(600);
      expect(result[0].percentage).toBe(60);
      expect(result[1].percentage).toBe(40);
    });

    it("should handle null category/color/icon with defaults", async () => {
      mockSql.mockResolvedValueOnce([
        { category: null, total: "100", color: null, icon: null },
      ]);
      const result = await getSpendingByCategory();
      expect(result[0].category).toBe("Uncategorized");
      expect(result[0].color).toBe("#6b7280");
      expect(result[0].icon).toBe("📦");
    });

    it("should return empty array on error", async () => {
      mockSql.mockRejectedValueOnce(new Error("DB error"));
      const result = await getSpendingByCategory();
      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // getIncomeByCategory
  // ---------------------------------------------------------------------------
  describe("getIncomeByCategory", () => {
    it("should return empty array if not authenticated", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const result = await getIncomeByCategory();
      expect(result).toEqual([]);
    });

    it("should return income breakdown with percentages", async () => {
      mockSql.mockResolvedValueOnce([
        { category: "Salary", total: "3000", color: "#10b981", icon: "💰" },
        { category: "Freelance", total: "1000", color: "#6366f1", icon: "💻" },
      ]);
      const result = await getIncomeByCategory();
      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(3000);
      expect(result[0].percentage).toBe(75);
      expect(result[1].percentage).toBe(25);
    });

    it("should return empty array on error", async () => {
      mockSql.mockRejectedValueOnce(new Error("DB error"));
      const result = await getIncomeByCategory();
      expect(result).toEqual([]);
    });
  });
});
