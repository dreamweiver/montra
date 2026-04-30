// =============================================================================
// CSV Utilities
// =============================================================================
// Functions for generating CSV exports from transaction data.
// =============================================================================

import { format } from "date-fns";
import type { Transaction } from "@/types";

export function escapeCSV(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function generateTransactionCSV(transactions: Transaction[]): string {
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
  const net = totals.income - totals.expense;

  const summaryRows = [
    ["Summary", "", "", "", "", ""],
    ["Total Income", "", "", "", String(totals.income.toFixed(2)), `${totals.incomeCount} transactions`],
    ["Total Expense", "", "", "", String(totals.expense.toFixed(2)), `${totals.expenseCount} transactions`],
    ["Net", "", "", "", String(net.toFixed(2)), `${transactions.length} transactions`],
    ["", "", "", "", "", ""],
  ];

  const headers = ["Date", "Type", "Category", "Description", "Amount", "Currency"];
  const rows = transactions.map((tx) => [
    format(new Date(tx.transaction_date), "dd MMM yyyy"),
    tx.type,
    tx.category || "",
    tx.description || "",
    `${tx.type === "income" ? "" : "-"}${tx.amount}`,
    tx.currency,
  ]);

  return [...summaryRows, headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n");
}
