// =============================================================================
// InvestmentCardList Component
// =============================================================================
// Mobile card view of investment holdings with gain/loss display.
// =============================================================================

import { Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { getTypeLabel } from "@/lib/investment";
import type { Investment, InvestmentWithGains } from "@/types";

// =============================================================================
// Props
// =============================================================================
interface InvestmentCardListProps {
  investments: InvestmentWithGains[];
  favouriteIds: number[];
  onToggleFavourite: (id: number) => void;
  onEdit: (investment: Investment) => void;
  onDelete: (id: number) => void;
}

// =============================================================================
// Main Component
// =============================================================================
export default function InvestmentCardList({ investments, favouriteIds, onToggleFavourite, onEdit, onDelete }: InvestmentCardListProps) {
  return (
    <div className="md:hidden space-y-3">
      {investments.map((inv) => {
        const isPositive = inv.gain_loss >= 0;
        const gainClass = isPositive ? "text-green-600" : "text-red-600";

        return (
          <div key={inv.id} className="rounded-lg border bg-card p-4 space-y-3">
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{inv.name}</div>
                {inv.symbol && (
                  <div className="text-xs text-muted-foreground">{inv.symbol}</div>
                )}
              </div>
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                {getTypeLabel(inv.type)}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Invested</p>
                <p className="font-medium">
                  {formatCurrency(inv.invested_amount, inv.currency)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Current Value</p>
                <p className="font-medium">
                  {formatCurrency(inv.current_value, inv.currency)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Gain/Loss</p>
                <p className={`font-medium ${gainClass}`}>
                  {isPositive ? "+" : ""}
                  {formatCurrency(inv.gain_loss, inv.currency)} ({isPositive ? "+" : ""}
                  {inv.gain_percentage.toFixed(2)}%)
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Qty</p>
                <p className="font-medium">{parseFloat(inv.quantity)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t">
              {inv.type === "stock" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => onToggleFavourite(inv.id)}
                >
                  <Star
                    className={`h-3.5 w-3.5 mr-1 ${favouriteIds.includes(inv.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                  />
                  Fav
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => onEdit(inv)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(inv.id)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
