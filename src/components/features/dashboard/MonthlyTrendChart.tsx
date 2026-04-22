"use client";

// =============================================================================
// MonthlyTrendChart Component
// =============================================================================
// Displays income vs expense trend over the last 6 months.
// =============================================================================

import { Card } from "@tremor/react";
import { BarChart } from "@tremor/react";
import { formatCurrency } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// =============================================================================
// Types
// =============================================================================
interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyTrend[];
  title?: string;
}

// =============================================================================
// Main Component
// =============================================================================
export default function MonthlyTrendChart({ 
  data, 
  title = "Monthly Trend" 
}: MonthlyTrendChartProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 md:h-64 text-muted-foreground">
          No transaction data available
        </div>
      </Card>
    );
  }

  // Transform for display
  const chartData = data.map((item) => ({
    month: item.month,
    Income: item.income,
    Expense: item.expense,
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      <BarChart
        data={chartData}
        index="month"
        categories={["Income", "Expense"]}
        colors={["emerald", "rose"]}
        valueFormatter={formatCurrency}
        yAxisWidth={isDesktop ? 80 : 50}
        showAnimation
        className="h-48 md:h-64 lg:h-72"
      />
    </Card>
  );
}
