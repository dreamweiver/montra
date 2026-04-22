"use client";

// =============================================================================
// Transactions Page
// =============================================================================
// Displays all user transactions with filters, stats, charts, and CRUD.
// =============================================================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Loader2, Pencil, Trash2, PieChart, List, Download } from "lucide-react";
import { toast } from "sonner";
import { getTransactions, deleteTransaction } from "@/actions/transactions";
import { format } from "date-fns";
import { EmptyState, ConfirmDialog } from "@/components/shared";
import { formatCurrency } from "@/lib/utils";
import {
  AddTransactionSheet,
  EditTransactionSheet,
  TransactionFilters,
  TransactionStats,
  TransactionChart,
  TransactionPieChart,
  type TransactionFiltersType,
} from "@/components/features/transactions";
import type { Transaction } from "@/types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showChart, setShowChart] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState<TransactionFiltersType>({
    startDate: undefined,
    endDate: undefined,
    type: "all",
    category: "all",
    search: "",
  });

  // ---------------------------------------------
  // Fetch Transactions
  // ---------------------------------------------
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const result = await getTransactions({
      startDate: filters.startDate,
      endDate: filters.endDate,
      type: filters.type,
      category: filters.category,
    });
    
    if (!result.success) {
      toast.error(result.error || "Failed to load transactions");
    } else {
      setTransactions(result.data as Transaction[]);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    let cancelled = false;

    getTransactions({
      startDate: filters.startDate,
      endDate: filters.endDate,
      type: filters.type,
      category: filters.category,
    }).then((result) => {
      if (cancelled) return;
      if (!result.success) {
        toast.error(result.error || "Failed to load transactions");
      } else {
        setTransactions(result.data as Transaction[]);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  // ---------------------------------------------
  // Client-side search filter
  // ---------------------------------------------
  const filteredTransactions = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    if (!query) return transactions;
    return transactions.filter((tx) => {
      const description = (tx.description || "").toLowerCase();
      const category = (tx.category || "").toLowerCase();
      const amount = formatCurrency(parseFloat(tx.amount), tx.currency);
      return (
        description.includes(query) ||
        category.includes(query) ||
        amount.includes(query)
      );
    });
  }, [transactions, filters.search]);

  // ---------------------------------------------
  // Delete Transaction Handler
  // ---------------------------------------------
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    const result = await deleteTransaction(id);
    
    if (result.success) {
      toast.success("Transaction deleted successfully");
      fetchTransactions();
    } else {
      toast.error(result.error || "Failed to delete transaction");
    }
    setDeletingId(null);
  };

  // ---------------------------------------------
  // Export to CSV
  // ---------------------------------------------
  const handleExportCSV = () => {
    const escapeCSV = (val: string) => {
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    // Calculate summary totals (same logic as TransactionStats)
    const totals = filteredTransactions.reduce(
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

    // Summary section
    const summaryRows = [
      ["Summary", "", "", "", "", ""],
      ["Total Income", "", "", "", String(totals.income.toFixed(2)), `${totals.incomeCount} transactions`],
      ["Total Expense", "", "", "", String(totals.expense.toFixed(2)), `${totals.expenseCount} transactions`],
      ["Net", "", "", "", String(net.toFixed(2)), `${filteredTransactions.length} transactions`],
      ["", "", "", "", "", ""],
    ];

    // Transaction rows
    const headers = ["Date", "Type", "Category", "Description", "Amount", "Currency"];
    const rows = filteredTransactions.map((tx) => [
      format(new Date(tx.transaction_date), "dd MMM yyyy"),
      tx.type,
      tx.category || "",
      tx.description || "",
      `${tx.type === "income" ? "" : "-"}${tx.amount}`,
      tx.currency,
    ]);

    const csv = [...summaryRows, headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `montra-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredTransactions.length} transactions`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export CSV */}
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={loading || filteredTransactions.length === 0}
          >
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Export CSV</span>
          </Button>

          {/* Toggle Chart/List View */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowChart(!showChart)}
            title={showChart ? "Hide charts" : "Show charts"}
          >
            {showChart ? <List className="h-4 w-4" /> : <PieChart className="h-4 w-4" />}
          </Button>
          
          <AddTransactionSheet onSuccess={fetchTransactions} />
        </div>
      </div>

      {/* Filters */}
      <TransactionFilters filters={filters} onFiltersChange={setFilters} />

      {/* Stats Summary */}
      {!loading && filteredTransactions.length > 0 && (
        <TransactionStats transactions={filteredTransactions} />
      )}

      {/* Charts Row */}
      {showChart && !loading && filteredTransactions.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <TransactionChart transactions={filteredTransactions} />
          <TransactionPieChart transactions={filteredTransactions} />
        </div>
      )}

      {/* Edit Transaction Sheet */}
      <EditTransactionSheet
        transaction={editingTransaction}
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        onSuccess={() => {
          setEditingTransaction(null);
          fetchTransactions();
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            All Transactions
            {filters.search && filteredTransactions.length !== transactions.length && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredTransactions.length} of {transactions.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              title={filters.search ? "No matching transactions" : "No transactions yet"}
              description={filters.search ? `No transactions match "${filters.search}".` : "Start tracking your finances by adding your first income or expense transaction."}
            >
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Track income</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span>Monitor expenses</span>
                </div>
              </div>
            </EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 md:py-3 md:px-4">Date</th>
                    <th className="text-left py-2 px-2 md:py-3 md:px-4">Description</th>
                    <th className="hidden sm:table-cell text-left py-2 px-2 md:py-3 md:px-4">Category</th>
                    <th className="text-right py-2 px-2 md:py-3 md:px-4">Amount</th>
                    <th className="text-right py-2 px-2 md:py-3 md:px-4 w-16 md:w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 md:py-3 md:px-4 whitespace-nowrap">
                        <span className="md:hidden">{format(new Date(tx.transaction_date), "dd/MM")}</span>
                        <span className="hidden md:inline">{format(new Date(tx.transaction_date), "dd MMM yyyy")}</span>
                      </td>
                      <td className="py-2 px-2 md:py-3 md:px-4">{tx.description || "-"}</td>
                      <td className="hidden sm:table-cell py-2 px-2 md:py-3 md:px-4">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted">
                          {tx.category}
                        </span>
                      </td>
                      <td className={`py-2 px-2 md:py-3 md:px-4 text-right font-medium ${
                        tx.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {tx.type === "income" ? "+" : "-"} {formatCurrency(parseFloat(tx.amount), tx.currency)}
                      </td>
                      <td className="py-2 px-2 md:py-3 md:px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 md:h-8 md:w-8"
                            onClick={() => setEditingTransaction(tx)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>

                          <ConfirmDialog
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 md:h-8 md:w-8 text-destructive hover:text-destructive"
                                disabled={deletingId === tx.id}
                              >
                                {deletingId === tx.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                <span className="sr-only">Delete</span>
                              </Button>
                            }
                            title="Delete Transaction"
                            description={`Are you sure you want to delete this ${tx.type}? This action cannot be undone.`}
                            confirmText="Delete"
                            destructive
                            onConfirm={() => handleDelete(tx.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}