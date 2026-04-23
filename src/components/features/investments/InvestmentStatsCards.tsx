"use client";

import { Card } from "@tremor/react";
import { Wallet, TrendingUp, ArrowUpDown, PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface InvestmentStatsCardsProps {
  totalInvested: number;
  currentValue: number;
  totalGainLoss: number;
  gainPercentage: number;
  holdingCount: number;
  currency?: string;
}

export default function InvestmentStatsCards({
  totalInvested,
  currentValue,
  totalGainLoss,
  gainPercentage,
  holdingCount,
  currency = "INR",
}: InvestmentStatsCardsProps) {
  const gainColor = totalGainLoss >= 0 ? "text-green-600" : "text-red-600";
  const gainBg = totalGainLoss >= 0 ? "bg-green-50" : "bg-red-50";

  const stats = [
    {
      title: "Total Invested",
      value: formatCurrency(totalInvested, currency),
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Current Value",
      value: formatCurrency(currentValue, currency),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Gain / Loss",
      value: `${formatCurrency(totalGainLoss, currency)} (${gainPercentage}%)`,
      icon: ArrowUpDown,
      color: gainColor,
      bgColor: gainBg,
    },
    {
      title: "Holdings",
      value: holdingCount.toString(),
      icon: PieChart,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <p className={`mt-2 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
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
