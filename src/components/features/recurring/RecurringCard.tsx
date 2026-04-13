"use client";

// =============================================================================
// RecurringCard Component
// =============================================================================
// Displays a single recurring transaction with edit/delete/toggle actions.
// =============================================================================

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Pencil,
  Trash2,
  Pause,
  Play,
  CalendarClock,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import type { RecurringTransaction } from "@/types";
import { CURRENCY } from "@/lib/constants";

// =============================================================================
// Props
// =============================================================================
interface RecurringCardProps {
  recurring: RecurringTransaction;
  onEdit: (recurring: RecurringTransaction) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number, isActive: boolean) => void;
}

// =============================================================================
// Helpers
// =============================================================================
function formatCurrency(amount: string): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}

/** Parse a date string and format in UTC to avoid timezone shifts */
function formatDateUTC(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

// =============================================================================
// Main Component
// =============================================================================
export default function RecurringCard({
  recurring,
  onEdit,
  onDelete,
  onToggle,
}: RecurringCardProps) {
  const isExpense = recurring.type === "expense";

  return (
    <Card className={`p-5 transition-opacity ${!recurring.is_active ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between">
        {/* Left: Icon + Details */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`p-2 rounded-full ${
              isExpense ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
            }`}
          >
            {isExpense ? (
              <ArrowDownCircle className="h-5 w-5" />
            ) : (
              <ArrowUpCircle className="h-5 w-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">
                {recurring.description || recurring.category || "Recurring"}
              </p>
              {!recurring.is_active && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  Paused
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
              <span className="bg-secondary px-2 py-0.5 rounded text-xs">
                {recurring.category}
              </span>
              <span className="text-xs">•</span>
              <CalendarClock className="h-3 w-3" />
              <span className="text-xs">{FREQUENCY_LABELS[recurring.frequency]}</span>
            </div>
          </div>
        </div>

        {/* Center: Dates & Amount */}
        <div className="text-right mr-4">
          <p className={`font-semibold ${isExpense ? "text-rose-600" : "text-emerald-600"}`}>
            {isExpense ? "-" : "+"}{formatCurrency(recurring.amount)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Next: {formatDateUTC(recurring.next_date)}
          </p>
          {recurring.end_date && (
            <p className="text-xs text-muted-foreground">
              Until: {formatDateUTC(recurring.end_date)}
            </p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggle(recurring.id, !recurring.is_active)}
            title={recurring.is_active ? "Pause" : "Resume"}
          >
            {recurring.is_active ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(recurring)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700"
            onClick={() => onDelete(recurring.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
