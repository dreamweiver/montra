"use client";

// =============================================================================
// TransactionStats Component
// =============================================================================
// Summary statistics for filtered transactions.
// =============================================================================

import { Card } from "@tremor/react";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";
import { CURRENCY } from "@/lib/constants";
import type { Transaction } from "@/types";

// =============================================================================
// Types
// =============================================================================
interface TransactionStatsProps {
  transactions: Transaction[];
}

// =============================================================================
// Helper: Format Currency
// =============================================================================
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
    maximumFractionDigits: 0,
  }).format(amount);
}

// =============================================================================
// Main Component
// =============================================================================
export default function TransactionStats({ transactions }: TransactionStatsProps) {
  // Calculate totals
  const totals = transactions.reduce(
    (acc, tx) => {
      const amount = parseFloat(tx.amount);
      if (tx.type === "income") {
        acc.income += amount;
        acc.incomeCount++;
      } else {
        acc.expense += amount;
        acc.expenseCount++;
      }
      return acc;
    },
    { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 }
  );

  const balance = totals.income - totals.expense;

  const stats = [
    {
      label: "Income",
      value: formatCurrency(totals.income),
      count: totals.incomeCount,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Expense",
      value: formatCurrency(totals.expense),
      count: totals.expenseCount,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Net",
      value: formatCurrency(balance),
      count: transactions.length,
      icon: Scale,
      color: balance >= 0 ? "text-blue-600" : "text-red-600",
      bgColor: balance >= 0 ? "bg-blue-50" : "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">
                {stat.count} transaction{stat.count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
