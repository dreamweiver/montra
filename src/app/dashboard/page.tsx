"use client";

// =============================================================================
// Dashboard Page
// =============================================================================
// Main dashboard showing financial overview with stats and charts.
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import {
  getDashboardStats,
  getSpendingByCategory,
  getMonthlyTrend,
  getRecentTransactions,
  type DashboardStats,
  type CategorySpending,
  type MonthlyTrend,
} from "@/actions/stats";
import {
  StatsCards,
  SpendingChart,
  MonthlyTrendChart,
  RecentTransactions,
} from "@/components/features/dashboard";

// =============================================================================
// Types
// =============================================================================
interface DashboardData {
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
      const [stats, spending, trend, recentTransactions] = await Promise.all([
        getDashboardStats(),
        getSpendingByCategory(),
        getMonthlyTrend(),
        getRecentTransactions(5),
      ]);

      setData({
        stats,
        spending,
        trend,
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