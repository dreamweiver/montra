"use client";

// =============================================================================
// RecentTransactions Component
// =============================================================================
// Displays a list of recent transactions on the dashboard.
// =============================================================================

import { Card } from "@tremor/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { CURRENCY } from "@/lib/constants";

// =============================================================================
// Types
// =============================================================================
interface Transaction {
  id: number;
  amount: string;
  type: "income" | "expense";
  description: string | null;
  category: string | null;
  transaction_date: string;
  category_icon?: string | null;
  category_color?: string | null;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  title?: string;
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
export default function RecentTransactions({
  transactions,
  title = "Recent Transactions",
}: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No transactions yet
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between py-2 border-b last:border-0"
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === "income" ? "bg-green-50" : "bg-red-50"
                }`}
              >
                {tx.category_icon ? (
                  <span className="text-lg">{tx.category_icon}</span>
                ) : tx.type === "income" ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>

              {/* Details */}
              <div>
                <p className="font-medium text-sm">
                  {tx.description || tx.category || "Transaction"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tx.category} • {format(new Date(tx.transaction_date), "dd MMM yyyy")}
                </p>
              </div>
            </div>

            {/* Amount */}
            <p
              className={`font-semibold ${
                tx.type === "income" ? "text-green-600" : "text-red-600"
              }`}
            >
              {tx.type === "income" ? "+" : "-"}
              {formatCurrency(parseFloat(tx.amount))}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
