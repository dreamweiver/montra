"use client";

// =============================================================================
// Dashboard Page
// =============================================================================
// Main dashboard showing financial overview with stats and charts.
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { Loader2, Target } from "lucide-react";
import {
  getDashboardStats,
  getSpendingByCategory,
  getMonthlyTrend,
  getRecentTransactions,
  type DashboardStats,
  type CategorySpending,
  type MonthlyTrend,
} from "@/actions/stats";
import { checkBudgetStatus } from "@/actions/budgets";
import { formatCurrency } from "@/lib/utils";
import {
  StatsCards,
  SpendingChart,
  MonthlyTrendChart,
  RecentTransactions,
} from "@/components/features/dashboard";
import type { BudgetStatus } from "@/types";

// =============================================================================
// Types
// =============================================================================
interface DashboardData {
  stats: DashboardStats;
  spending: CategorySpending[];
  trend: MonthlyTrend[];
  budgetStatus: BudgetStatus | null;
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
}

// =============================================================================
// Main Component
// =============================================================================
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  // Fetch all dashboard data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [stats, spending, trend, recentTransactions, budgetResult] = await Promise.all([
        getDashboardStats(),
        getSpendingByCategory(),
        getMonthlyTrend(),
        getRecentTransactions(5),
        checkBudgetStatus(),
      ]);

      setData({
        stats,
        spending,
        trend,
        budgetStatus: budgetResult.success && budgetResult.data?.hasBudget ? budgetResult.data : null,
        recentTransactions: recentTransactions as DashboardData["recentTransactions"],
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =============================================================================
  // Loading State
  // =============================================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // =============================================================================
  // Main Render
  // =============================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s your financial overview.
        </p>
      </div>

      {/* Stats Cards */}
      {data && (
        <StatsCards
          totalIncome={data.stats.totalIncome}
          totalExpense={data.stats.totalExpense}
          balance={data.stats.balance}
          transactionCount={data.stats.transactionCount}
        />
      )}

      {/* Budget Progress */}
      {data?.budgetStatus && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Monthly Budget</span>
            </div>
            <span className={`text-sm font-medium ${
              data.budgetStatus.percentage >= 100 ? "text-red-600" :
              data.budgetStatus.percentage >= 80 ? "text-orange-600" :
              "text-green-600"
            }`}>
              {data.budgetStatus.percentage}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                data.budgetStatus.percentage >= 100 ? "bg-red-500" :
                data.budgetStatus.percentage >= 80 ? "bg-orange-500" :
                data.budgetStatus.percentage >= 60 ? "bg-yellow-500" :
                "bg-green-500"
              }`}
              style={{ width: `${Math.min(data.budgetStatus.percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(data.budgetStatus.spent, data.budgetStatus.currency)} of {formatCurrency(data.budgetStatus.limit, data.budgetStatus.currency)} spent
          </p>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        {data && <MonthlyTrendChart data={data.trend} />}

        {/* Spending by Category */}
        {data && <SpendingChart data={data.spending} />}
      </div>

      {/* Recent Transactions */}
      {data && <RecentTransactions transactions={data.recentTransactions} />}
    </div>
  );
}