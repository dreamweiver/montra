"use client";

// =============================================================================
// Transactions Page
// =============================================================================
// Displays all user transactions in a table with CRUD functionality.
// =============================================================================

import AddTransactionSheet from "@/components/features/transactions/AddTransactionSheet";
import EditTransactionSheet from "@/components/features/transactions/EditTransactionSheet";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getTransactions, deleteTransaction } from "@/actions/transactions";
import { format } from "date-fns";
import { EmptyState, ConfirmDialog } from "@/components/shared";
import type { Transaction } from "@/types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // ---------------------------------------------
  // Fetch Transactions
  // ---------------------------------------------
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const result = await getTransactions();
    
    if (!result.success) {
      toast.error(result.error || "Failed to load transactions");
    } else {
      setTransactions(result.data as Transaction[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses</p>
        </div>

        <AddTransactionSheet onSuccess={fetchTransactions} />
      </div>

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
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Start tracking your finances by adding your first income or expense transaction."
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
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-right py-3 px-4">Amount</th>
                    <th className="text-right py-3 px-4 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {format(new Date(tx.transaction_date), "dd MMM yyyy")}
                      </td>
                      <td className="py-3 px-4">{tx.description || "-"}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted">
                          {tx.category}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${
                        tx.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {tx.type === "income" ? "+" : "-"} ₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          {/* Edit Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingTransaction(tx)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>

                          {/* Delete Button with Confirmation */}
                          <ConfirmDialog
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
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