"use client";

// =============================================================================
// TransactionPieChart Component
// =============================================================================
// Displays transaction breakdown by category as a donut chart.
// =============================================================================

import { Card } from "@tremor/react";
import { DonutChart } from "@tremor/react";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types";

// =============================================================================
// Types
// =============================================================================
interface TransactionPieChartProps {
  transactions: Transaction[];
  title?: string;
}

// =============================================================================
// Color Palette for Categories (Tremor color names)
// =============================================================================
const TREMOR_COLORS = [
  "red", "orange", "amber", "yellow", "lime",
  "green", "emerald", "teal", "cyan", "sky",
  "blue", "indigo", "violet", "purple", "fuchsia",
  "pink", "rose", "slate", "gray", "zinc",
];

// Hex colors for legend (matching Tremor colors)
const HEX_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#64748b", "#6b7280", "#71717a",
];

// =============================================================================
// Custom Tooltip
// =============================================================================
interface CustomTooltipProps {
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
    payload: { name: string; value: number };
  }>;
  active?: boolean;
  label?: string;
}

function CustomTooltip({ payload, active }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        padding: "0.5rem 0.75rem",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        minWidth: "120px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div
          style={{
            width: "0.75rem",
            height: "0.75rem",
            borderRadius: "9999px",
            backgroundColor: item.color || "#3b82f6",
            flexShrink: 0,
          }}
        />
        <span style={{ color: "#111827", fontWeight: 500, fontSize: "0.875rem" }}>
          {item.payload.name}
        </span>
      </div>
      <div style={{ color: "#374151", fontSize: "0.875rem", marginTop: "0.25rem", paddingLeft: "1.25rem" }}>
        {formatCurrency(item.value)}
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================
export default function TransactionPieChart({
  transactions,
  title = "Spending by Category",
}: TransactionPieChartProps) {
  // Filter only expenses for pie chart
  const expenses = transactions.filter((tx) => tx.type === "expense");

  if (expenses.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          No expense data
        </div>
      </Card>
    );
  }

  // Aggregate by category
  const categoryMap = new Map<string, number>();
  expenses.forEach((tx) => {
    const cat = tx.category || "Uncategorized";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + parseFloat(tx.amount));
  });

  // Convert to array and sort by amount
  const categoryData = Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const totalExpense = categoryData.reduce((sum, c) => sum + c.value, 0);

  // Get colors for number of categories
  const chartColors = TREMOR_COLORS.slice(0, categoryData.length);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <DonutChart
            data={categoryData}
            category="value"
            index="name"
            valueFormatter={formatCurrency}
            showAnimation
            className="h-52 w-52"
            colors={chartColors}
            customTooltip={CustomTooltip}
          />
        </div>

        {/* Legend with values */}
        <div className="w-full lg:w-1/2 space-y-2 max-h-52 overflow-y-auto">
          {categoryData.map((item, idx) => {
            const percentage = ((item.value / totalExpense) * 100).toFixed(1);
            return (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: HEX_COLORS[idx % HEX_COLORS.length] }}
                  />
                  <span className="truncate max-w-[120px]">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="font-medium">{formatCurrency(item.value)}</span>
                  <span className="text-muted-foreground text-xs w-12">
                    ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <span className="font-medium">Total Expenses</span>
        <span className="text-lg font-bold text-rose-600">
          {formatCurrency(totalExpense)}
        </span>
      </div>
    </Card>
  );
}
