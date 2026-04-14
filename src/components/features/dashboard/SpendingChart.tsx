"use client";

// =============================================================================
// SpendingChart Component
// =============================================================================
// Displays spending breakdown by category as a donut chart.
// =============================================================================

import { Card } from "@tremor/react";
import { DonutChart } from "@tremor/react";
import { formatCurrency } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================
interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

interface SpendingChartProps {
  data: CategorySpending[];
  title?: string;
}

// =============================================================================
// Custom Tooltip
// =============================================================================
interface CustomTooltipProps {
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: { name: string; value: number };
  }>;
  active?: boolean;
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
export default function SpendingChart({ 
  data, 
  title = "Spending by Category" 
}: SpendingChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No expense data available
        </div>
      </Card>
    );
  }

  // Transform data for Tremor chart
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount,
    color: item.color,
  }));

  // Extract colors for the chart
  const colors = data.map((item) => item.color);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="w-full lg:w-1/2">
          <DonutChart
            data={chartData}
            category="value"
            index="name"
            colors={colors}
            valueFormatter={formatCurrency}
            showAnimation
            className="h-64"
            customTooltip={CustomTooltip}
          />
        </div>

        {/* Legend */}
        <div className="w-full lg:w-1/2 space-y-3">
          {data.slice(0, 6).map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">
                  {item.icon} {item.category}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">
                  {formatCurrency(item.amount)}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
          {data.length > 6 && (
            <p className="text-xs text-muted-foreground text-center">
              +{data.length - 6} more categories
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
