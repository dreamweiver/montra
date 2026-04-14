"use server";

// =============================================================================
// Dashboard Stats Server Actions
// =============================================================================
// Server-side actions for fetching dashboard statistics and analytics.
// =============================================================================

import { sql } from "@/db/neon";
import { getAuthUser } from "@/actions/auth";

// =============================================================================
// Dashboard Summary Stats
// =============================================================================
export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}

export async function getDashboardStats(
  startDate?: Date,
  endDate?: Date
): Promise<DashboardStats> {
  try {
    const user = await getAuthUser();

    if (!user) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
        incomeCount: 0,
        expenseCount: 0,
      };
    }

    let query;
    if (startDate && endDate) {
      query = await sql`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount::numeric ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount::numeric ELSE 0 END), 0) as total_expense,
          COUNT(*) as transaction_count,
          COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
          COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
        FROM transactions
        WHERE user_id = ${user.id}
          AND transaction_date >= ${startDate}
          AND transaction_date <= ${endDate}
      `;
    } else {
      query = await sql`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount::numeric ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount::numeric ELSE 0 END), 0) as total_expense,
          COUNT(*) as transaction_count,
          COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
          COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
        FROM transactions
        WHERE user_id = ${user.id}
      `;
    }

    const result = query[0];
    const totalIncome = parseFloat(result.total_income) || 0;
    const totalExpense = parseFloat(result.total_expense) || 0;

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: parseInt(result.transaction_count) || 0,
      incomeCount: parseInt(result.income_count) || 0,
      expenseCount: parseInt(result.expense_count) || 0,
    };
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      transactionCount: 0,
      incomeCount: 0,
      expenseCount: 0,
    };
  }
}

// =============================================================================
// Spending by Category
// =============================================================================
export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export async function getSpendingByCategory(
  startDate?: Date,
  endDate?: Date
): Promise<CategorySpending[]> {
  try {
    const user = await getAuthUser();

    if (!user) {
      return [];
    }

    let query;
    if (startDate && endDate) {
      query = await sql`
        SELECT 
          t.category,
          SUM(t.amount::numeric) as total,
          c.color,
          c.icon
        FROM transactions t
        LEFT JOIN categories c ON c.name = t.category AND c.user_id = t.user_id AND c.type = 'expense'
        WHERE t.user_id = ${user.id} 
          AND t.type = 'expense'
          AND t.transaction_date >= ${startDate}
          AND t.transaction_date <= ${endDate}
        GROUP BY t.category, c.color, c.icon
        ORDER BY total DESC
      `;
    } else {
      query = await sql`
        SELECT 
          t.category,
          SUM(t.amount::numeric) as total,
          c.color,
          c.icon
        FROM transactions t
        LEFT JOIN categories c ON c.name = t.category AND c.user_id = t.user_id AND c.type = 'expense'
        WHERE t.user_id = ${user.id} AND t.type = 'expense'
        GROUP BY t.category, c.color, c.icon
        ORDER BY total DESC
      `;
    }

    const totalExpense = query.reduce((sum, row) => sum + parseFloat(row.total), 0);

    return query.map((row) => ({
      category: row.category || "Uncategorized",
      amount: parseFloat(row.total) || 0,
      percentage: totalExpense > 0 ? (parseFloat(row.total) / totalExpense) * 100 : 0,
      color: row.color || "#6b7280",
      icon: row.icon || "📦",
    }));
  } catch (error) {
    console.error("Get spending by category error:", error);
    return [];
  }
}

// =============================================================================
// Income by Category
// =============================================================================
export interface CategoryIncome {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export async function getIncomeByCategory(
  startDate?: Date,
  endDate?: Date
): Promise<CategoryIncome[]> {
  try {
    const user = await getAuthUser();

    if (!user) {
      return [];
    }

    let query;
    if (startDate && endDate) {
      query = await sql`
        SELECT 
          t.category,
          SUM(t.amount::numeric) as total,
          c.color,
          c.icon
        FROM transactions t
        LEFT JOIN categories c ON c.name = t.category AND c.user_id = t.user_id AND c.type = 'income'
        WHERE t.user_id = ${user.id} 
          AND t.type = 'income'
          AND t.transaction_date >= ${startDate}
          AND t.transaction_date <= ${endDate}
        GROUP BY t.category, c.color, c.icon
        ORDER BY total DESC
      `;
    } else {
      query = await sql`
        SELECT 
          t.category,
          SUM(t.amount::numeric) as total,
          c.color,
          c.icon
        FROM transactions t
        LEFT JOIN categories c ON c.name = t.category AND c.user_id = t.user_id AND c.type = 'income'
        WHERE t.user_id = ${user.id} AND t.type = 'income'
        GROUP BY t.category, c.color, c.icon
        ORDER BY total DESC
      `;
    }

    const totalIncome = query.reduce((sum, row) => sum + parseFloat(row.total), 0);

    return query.map((row) => ({
      category: row.category || "Uncategorized",
      amount: parseFloat(row.total) || 0,
      percentage: totalIncome > 0 ? (parseFloat(row.total) / totalIncome) * 100 : 0,
      color: row.color || "#6b7280",
      icon: row.icon || "📦",
    }));
  } catch (error) {
    console.error("Get income by category error:", error);
    return [];
  }
}

// =============================================================================
// Monthly Trend (Last 6 months)
// =============================================================================
export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export async function getMonthlyTrend(): Promise<MonthlyTrend[]> {
  try {
    const user = await getAuthUser();

    if (!user) {
      return [];
    }

    const query = await sql`
      SELECT 
        TO_CHAR(transaction_date, 'Mon YYYY') as month,
        DATE_TRUNC('month', transaction_date) as month_start,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount::numeric ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount::numeric ELSE 0 END), 0) as expense
      FROM transactions
      WHERE user_id = ${user.id}
        AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY month, month_start
      ORDER BY month_start ASC
    `;

    return query.map((row) => ({
      month: row.month,
      income: parseFloat(row.income) || 0,
      expense: parseFloat(row.expense) || 0,
    }));
  } catch (error) {
    console.error("Get monthly trend error:", error);
    return [];
  }
}

// =============================================================================
// Recent Transactions (Last 5)
// =============================================================================
export async function getRecentTransactions(limit: number = 5) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return [];
    }

    const query = await sql`
      SELECT 
        t.*,
        c.icon as category_icon,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON c.name = t.category AND c.user_id = t.user_id AND c.type = t.type
      WHERE t.user_id = ${user.id}
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT ${limit}
    `;

    return query;
  } catch (error) {
    console.error("Get recent transactions error:", error);
    return [];
  }
}
