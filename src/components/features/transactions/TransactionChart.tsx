"use client";

// =============================================================================
// TransactionChart Component
// =============================================================================
// Displays transactions over time as a bar chart with clear income/expense.
// =============================================================================

import { Card } from "@tremor/react";
import { BarChart } from "@tremor/react";
import { format, eachDayOfInterval, startOfDay, subDays } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Transaction } from "@/types";

// =============================================================================
// Types
// =============================================================================
interface TransactionChartProps {
  transactions: Transaction[];
  title?: string;
}

// =============================================================================
// Helper: Format Currency for Chart (compact - K, L, Cr)
// =============================================================================
function formatChartValue(amount: number): string {
  if (amount === 0) return "₹0";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

// =============================================================================
// Helper: Parse Date (handles both string and Date)
// =============================================================================
function parseDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  return new Date(date);
}

// =============================================================================
// Main Component
// =============================================================================
export default function TransactionChart({
  transactions,
  title = "Income vs Expense",
}: TransactionChartProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (transactions.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          No data to display
        </div>
      </Card>
    );
  }

  // Get date range - use last 14 days for cleaner display
  const dates = transactions.map((tx) => startOfDay(parseDate(tx.transaction_date)));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  
  // Limit range to avoid too many bars
  const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const effectiveMinDate = daysDiff > 14 ? subDays(maxDate, 13) : minDate;

  // Generate all days in range
  const allDays = eachDayOfInterval({ start: effectiveMinDate, end: maxDate });

  // Aggregate by day
  const dailyData = allDays.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayTransactions = transactions.filter(
      (tx) => format(parseDate(tx.transaction_date), "yyyy-MM-dd") === dayStr
    );

    const income = dayTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    const expense = dayTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    return {
      date: format(day, "dd MMM"),
      Income: income,
      Expense: expense,
    };
  });

  // Calculate totals for summary
  const totalIncome = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  const totalExpense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-2 mb-4 md:flex-row md:items-center md:justify-between md:mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>

        {/* Custom Legend */}
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-sm font-medium">Income</span>
            <span className="text-sm text-green-600 font-bold">
              {formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-sm font-medium">Expense</span>
            <span className="text-sm text-red-600 font-bold">
              {formatCurrency(totalExpense)}
            </span>
          </div>
        </div>
      </div>

      <BarChart
        data={dailyData}
        index="date"
        categories={["Income", "Expense"]}
        colors={["green", "red"] as const}
        valueFormatter={formatChartValue}
        yAxisWidth={isDesktop ? 65 : 45}
        showAnimation
        className="h-48 md:h-64 lg:h-72"
        showLegend={false}
        minValue={0}
        allowDecimals={false}
      />
    </Card>
  );
}
