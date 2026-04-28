import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSql, mockGetAuthUser, mockRefreshPrices, mockSeedCategories } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockGetAuthUser: vi.fn(),
  mockRefreshPrices: vi.fn(),
  mockSeedCategories: vi.fn(),
}));

vi.mock("@/db/neon", () => ({ sql: mockSql }));
vi.mock("@/actions/auth", () => ({ getAuthUser: mockGetAuthUser }));
vi.mock("@/actions/refreshPrices", () => ({ refreshInvestmentPrices: mockRefreshPrices }));
vi.mock("@/actions/categories", () => ({ seedDefaultCategories: mockSeedCategories }));

import { getDashboardData } from "@/actions/dashboard";

describe("getDashboardData", () => {
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthUser.mockResolvedValue(mockUser);
    mockRefreshPrices.mockResolvedValue({ updated: 0 });
    mockSeedCategories.mockResolvedValue(undefined);
  });

  function setupSqlMocks(overrides: Partial<{
    stats: Record<string, string>[];
    spending: Record<string, string>[];
    trend: Record<string, string>[];
    recent: Record<string, string>[];
    budgets: Record<string, string>[];
    budgetSpent: Record<string, string>[];
    investments: Record<string, string | null>[];
  }> = {}) {
    const defaults = {
      stats: [{ total_income: "0", total_expense: "0", transaction_count: "0", income_count: "0", expense_count: "0" }],
      spending: [],
      trend: [],
      recent: [],
      budgets: [],
      budgetSpent: [{ total: "0" }],
      investments: [{ holding_count: "0", total_invested: null, total_current: "0" }],
    };
    const data = { ...defaults, ...overrides };

    // Promise.all order: seedCategories, refreshPrices, stats, spending, trend, recent, budgets, budgetSpent, investments
    // sql is called for: stats, spending, trend, recent, budgets, budgetSpent, investments (7 calls)
    mockSql
      .mockResolvedValueOnce(data.stats)
      .mockResolvedValueOnce(data.spending)
      .mockResolvedValueOnce(data.trend)
      .mockResolvedValueOnce(data.recent)
      .mockResolvedValueOnce(data.budgets)
      .mockResolvedValueOnce(data.budgetSpent)
      .mockResolvedValueOnce(data.investments);
  }

  it("should return empty data when user is not authenticated", async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const result = await getDashboardData();

    expect(result.stats.totalIncome).toBe(0);
    expect(result.stats.totalExpense).toBe(0);
    expect(result.spending).toEqual([]);
    expect(result.trend).toEqual([]);
    expect(result.recentTransactions).toEqual([]);
    expect(result.budgetStatus).toBeNull();
    expect(result.investmentStats).toBeNull();
  });

  it("should aggregate dashboard data for authenticated user", async () => {
    setupSqlMocks({
      stats: [{ total_income: "5000", total_expense: "3000", transaction_count: "10", income_count: "4", expense_count: "6" }],
      spending: [{ category: "Food", total: "1500", color: "#ef4444", icon: "🍕" }],
      trend: [{ month: "Apr 2026", income: "5000", expense: "3000" }],
      recent: [{ id: "1", amount: "100", type: "expense", description: "Lunch", category: "Food", transaction_date: "2026-04-01" }],
    });

    const result = await getDashboardData();

    expect(result.stats.totalIncome).toBe(5000);
    expect(result.stats.totalExpense).toBe(3000);
    expect(result.stats.balance).toBe(2000);
    expect(result.stats.transactionCount).toBe(10);
    expect(result.spending).toHaveLength(1);
    expect(result.spending[0].category).toBe("Food");
    expect(result.spending[0].percentage).toBe(100);
    expect(result.trend).toHaveLength(1);
    expect(result.recentTransactions).toHaveLength(1);
  });

  it("should include budget status when budget exists", async () => {
    setupSqlMocks({
      budgets: [{ monthly_limit: "50000", currency: "INR" }],
      budgetSpent: [{ total: "25000" }],
    });

    const result = await getDashboardData();

    expect(result.budgetStatus).not.toBeNull();
    expect(result.budgetStatus!.hasBudget).toBe(true);
    expect(result.budgetStatus!.limit).toBe(50000);
    expect(result.budgetStatus!.spent).toBe(25000);
    expect(result.budgetStatus!.percentage).toBe(50);
  });

  it("should return null budget status when no budget set", async () => {
    setupSqlMocks();

    const result = await getDashboardData();
    expect(result.budgetStatus).toBeNull();
  });

  it("should include investment stats when holdings exist", async () => {
    setupSqlMocks({
      investments: [{ holding_count: "3", total_invested: "100000", total_current: "120000" }],
    });

    const result = await getDashboardData();

    expect(result.investmentStats).not.toBeNull();
    expect(result.investmentStats!.holdingCount).toBe(3);
    expect(result.investmentStats!.totalInvested).toBe(100000);
    expect(result.investmentStats!.currentValue).toBe(120000);
  });

  it("should return null investment stats when no holdings", async () => {
    setupSqlMocks();

    const result = await getDashboardData();
    expect(result.investmentStats).toBeNull();
  });
});
