"use client";

// =============================================================================
// Recurring Transactions Page
// =============================================================================
// Lists all recurring transactions with add/edit/delete/toggle functionality.
// Processes due recurring transactions on page load.
// =============================================================================

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  getRecurringPageData,
  getRecurringTransactions,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
} from "@/actions/recurring";
import { AddRecurringSheet, EditRecurringSheet, RecurringCard } from "@/components/features/recurring";
import { ConfirmDialog, EmptyState } from "@/components/shared";
import type { RecurringTransaction } from "@/types";
import { CalendarClock } from "lucide-react";

export default function RecurringPage() {
  const [recurringList, setRecurringList] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit sheet state
  const [editItem, setEditItem] = useState<RecurringTransaction | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch recurring transactions
  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await getRecurringTransactions();
    setRecurringList(data);
    setLoading(false);
  }, []);

  // Process due transactions and fetch on mount
  useEffect(() => {
    const init = async () => {
      const { items, processed } = await getRecurringPageData();
      if (processed > 0) {
        toast.info(`${processed} recurring transaction(s) generated`);
      }
      setRecurringList(items);
      setLoading(false);
    };
    init();
  }, [fetchData]);

  // Handle edit
  const handleEdit = (item: RecurringTransaction) => {
    setEditItem(item);
    setEditOpen(true);
  };

  // Handle delete
  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);

    const result = await deleteRecurringTransaction(deleteId);
    if (result.success) {
      toast.success("Recurring transaction deleted");
      await fetchData();
    } else {
      toast.error(result.error || "Failed to delete");
    }

    setDeleteLoading(false);
    setDeleteOpen(false);
    setDeleteId(null);
  };

  // Handle toggle active/inactive
  const handleToggle = async (id: number, isActive: boolean) => {
    const result = await toggleRecurringTransaction(id, isActive);
    if (result.success) {
      toast.success(isActive ? "Recurring transaction resumed" : "Recurring transaction paused");
      await fetchData();
    } else {
      toast.error(result.error || "Failed to update");
    }
  };

  // Separate active and paused
  const activeItems = recurringList.filter((item) => item.is_active);
  const pausedItems = recurringList.filter((item) => !item.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Recurring Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your automatic recurring income and expenses
          </p>
        </div>
        <AddRecurringSheet onSuccess={fetchData} />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : recurringList.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No recurring transactions"
          description="Set up transactions that repeat automatically — like rent, salary, or subscriptions."
          action={<AddRecurringSheet onSuccess={fetchData} />}
        />
      ) : (
        <div className="space-y-6">
          {/* Active recurring transactions */}
          {activeItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Active ({activeItems.length})
              </h2>
              {activeItems.map((item) => (
                <RecurringCard
                  key={item.id}
                  recurring={item}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}

          {/* Paused recurring transactions */}
          {pausedItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Paused ({pausedItems.length})
              </h2>
              {pausedItems.map((item) => (
                <RecurringCard
                  key={item.id}
                  recurring={item}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Sheet */}
      <EditRecurringSheet
        recurring={editItem}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={fetchData}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Recurring Transaction"
        description="This will stop future auto-generation. Already generated transactions won't be affected."
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
