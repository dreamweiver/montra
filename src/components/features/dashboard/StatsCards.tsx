"use client";

// =============================================================================
// StatsCards Component
// =============================================================================
// Displays summary statistics cards for the dashboard.
// Shows total income, expense, balance, and transaction count.
// =============================================================================

import { Card } from "@tremor/react";
import { TrendingUp, TrendingDown, Wallet, Receipt } from "lucide-react";
import { CURRENCY } from "@/lib/constants";

// =============================================================================
// Types
// =============================================================================
interface StatsCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
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
export default function StatsCards({
  totalIncome,
  totalExpense,
  balance,
  transactionCount,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Expense",
      value: formatCurrency(totalExpense),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Balance",
      value: formatCurrency(balance),
      icon: Wallet,
      color: balance >= 0 ? "text-blue-600" : "text-red-600",
      bgColor: balance >= 0 ? "bg-blue-50" : "bg-red-50",
    },
    {
      title: "Transactions",
      value: transactionCount.toString(),
      icon: Receipt,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <p className={`mt-2 text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
            <div className={`rounded-full p-3 ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
