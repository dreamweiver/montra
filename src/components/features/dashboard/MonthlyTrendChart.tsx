"use client";

import { Card } from "@tremor/react";
import { BarChart } from "@tremor/react";
import { formatCurrency } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyTrend[];
  title?: string;
}

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

  const chartData = data.map((item) => ({
    month: item.month,
    Income: item.income,
    Expense: item.expense,
  }));

  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-2 mb-4 md:flex-row md:items-center md:justify-between md:mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 rounded-full" style={{ background: "linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #15803d 100%)" }} />
            <span className="text-sm font-medium">Income</span>
            <span className="text-sm text-green-600 font-bold">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 rounded-full" style={{ background: "linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)" }} />
            <span className="text-sm font-medium">Expense</span>
            <span className="text-sm text-red-600 font-bold">{formatCurrency(totalExpense)}</span>
          </div>
        </div>
      </div>

      <BarChart
        data={chartData}
        index="month"
        categories={["Income", "Expense"]}
        colors={["emerald", "rose"]}
        valueFormatter={formatCurrency}
        yAxisWidth={isDesktop ? 80 : 50}
        showAnimation
        showLegend={false}
        className="h-48 md:h-64 lg:h-72"
      />
    </Card>
  );
}
