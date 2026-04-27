"use server";

import { sql } from "@/db/neon";
import { getAuthUser } from "@/actions/auth";
import type {
  DashboardStats,
  CategorySpending,
  MonthlyTrend,
} from "@/actions/stats";
import type { BudgetStatus } from "@/types/budget";
import type { InvestmentStats } from "@/types";
import { refreshInvestmentPrices } from "@/actions/refreshPrices";
import { seedDefaultCategories } from "@/actions/categories";
import { getMonthRange } from "@/lib/date";
import { computeBudgetPercentage } from "@/lib/budget";
import { parseInvestmentStats } from "@/lib/investment";

export interface DashboardData {
  stats: DashboardStats;
  spending: CategorySpending[];
  trend: MonthlyTrend[];
  recentTransactions: Array<{
    id: number;
    amount: string;
    type: "income" | "expense";
    description: string | null;
    category: string | null;
    transaction_date: string;
    category_icon?: string | null;
    category_color?: string | null;
  }>;
  budgetStatus: BudgetStatus | null;
  investmentStats: InvestmentStats | null;
}


export async function getDashboardData(): Promise<DashboardData> {
  const user = await getAuthUser();

  if (!user) {
    return {
      stats: { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0, incomeCount: 0, expenseCount: 0 },
      spending: [],
      trend: [],
      recentTransactions: [],
      budgetStatus: null,
      investmentStats: null,
    };
  }

  const userId = user.id;

  const { start: startOfMonth, end: endOfMonth } = getMonthRange();

  const [, , statsRows, spendingRows, trendRows, recentRows, budgetRows, budgetSpentRows, investmentRows] = await Promise.all([
    seedDefaultCategories(),
    refreshInvestmentPrices(),
    sql`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount::numeric ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount::numeric ELSE 0 END), 0) as total_expense,
        COUNT(*) as transaction_count,
        COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
        COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
      FROM transactions
      WHERE user_id = ${userId}
    `,
    sql`
      SELECT
        t.category,
        SUM(t.amount::numeric) as total,
        c.color,
        c.icon
      FROM transactions t
      LEFT JOIN categories c ON c.name = t.category AND c.user_id = t.user_id AND c.type = 'expense'
      WHERE t.user_id = ${userId} AND t.type = 'expense'
      GROUP BY t.category, c.color, c.icon
      ORDER BY total DESC
    `,
    sql`
      SELECT
        TO_CHAR(transaction_date, 'Mon YYYY') as month,
        DATE_TRUNC('month', transaction_date) as month_start,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount::numeric ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount::numeric ELSE 0 END), 0) as expense
      FROM transactions
      WHERE user_id = ${userId}
        AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY month, month_start
      ORDER BY month_start ASC
    `,
    sql`
      SELECT
        t.*,
        c.icon as category_icon,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON c.name = t.category AND c.user_id = t.user_id AND c.type = t.type
      WHERE t.user_id = ${userId}
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT 5
    `,
    sql`
      SELECT * FROM budgets WHERE user_id = ${userId} LIMIT 1
    `,
    sql`
      SELECT COALESCE(SUM(amount::numeric), 0) as total
      FROM transactions
      WHERE user_id = ${userId}
        AND type = 'expense'
        AND transaction_date >= ${startOfMonth.toISOString()}
        AND transaction_date <= ${endOfMonth.toISOString()}
    `,
    sql`
      SELECT
        COUNT(*) as holding_count,
        SUM(quantity * purchase_price) as total_invested,
        SUM(quantity * current_price) as total_current
      FROM investments
      WHERE user_id = ${userId}
    `,
  ]);

  // Stats
  const sr = statsRows[0];
  const totalIncome = parseFloat(sr.total_income) || 0;
  const totalExpense = parseFloat(sr.total_expense) || 0;
  const stats: DashboardStats = {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: parseInt(sr.transaction_count) || 0,
    incomeCount: parseInt(sr.income_count) || 0,
    expenseCount: parseInt(sr.expense_count) || 0,
  };

  // Spending by category
  const spendingTotal = spendingRows.reduce((sum, row) => sum + parseFloat(row.total), 0);
  const spending: CategorySpending[] = spendingRows.map((row) => ({
    category: row.category || "Uncategorized",
    amount: parseFloat(row.total) || 0,
    percentage: spendingTotal > 0 ? (parseFloat(row.total) / spendingTotal) * 100 : 0,
    color: row.color || "#6b7280",
    icon: row.icon || "📦",
  }));

  // Monthly trend
  const trend: MonthlyTrend[] = trendRows.map((row) => ({
    month: row.month,
    income: parseFloat(row.income) || 0,
    expense: parseFloat(row.expense) || 0,
  }));

  // Recent transactions
  const recentTransactions = recentRows as DashboardData["recentTransactions"];

  // Budget status
  let budgetStatus: BudgetStatus | null = null;
  if (budgetRows.length > 0) {
    const budget = budgetRows[0];
    const limit = parseFloat(budget.monthly_limit);
    const spent = parseFloat(budgetSpentRows[0]?.total || "0");
    const percentage = computeBudgetPercentage(spent, limit);
    budgetStatus = { hasBudget: true, spent, limit, percentage, currency: budget.currency };
  }

  // Investment stats
  const parsedStats = parseInvestmentStats(investmentRows[0]);
  const investmentStats: InvestmentStats | null = parsedStats.holdingCount > 0 ? parsedStats : null;

  return { stats, spending, trend, recentTransactions, budgetStatus, investmentStats };
}
