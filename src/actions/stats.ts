// =============================================================================
// Dashboard Stats Types
// =============================================================================
// Type definitions for dashboard statistics used by getDashboardData().
// =============================================================================

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}
