// =============================================================================
// InvestmentTable Component
// =============================================================================
// Desktop table view of investment holdings with gain/loss display.
// =============================================================================

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { getTypeLabel } from "@/lib/investment";
import type { Investment, InvestmentWithGains } from "@/types";

// =============================================================================
// Props
// =============================================================================
interface InvestmentTableProps {
  investments: InvestmentWithGains[];
  onEdit: (investment: Investment) => void;
  onDelete: (id: number) => void;
}

// =============================================================================
// Main Component
// =============================================================================
export default function InvestmentTable({ investments, onEdit, onDelete }: InvestmentTableProps) {
  return (
    <div className="hidden md:block rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Name</th>
            <th className="text-left px-4 py-3 font-medium">Type</th>
            <th className="text-right px-4 py-3 font-medium">Qty</th>
            <th className="text-right px-4 py-3 font-medium">Buy Price</th>
            <th className="text-right px-4 py-3 font-medium">Current Price</th>
            <th className="text-right px-4 py-3 font-medium">Invested</th>
            <th className="text-right px-4 py-3 font-medium">Current Value</th>
            <th className="text-right px-4 py-3 font-medium">Gain/Loss</th>
            <th className="text-right px-4 py-3 font-medium">Gain %</th>
            <th className="text-right px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {investments.map((inv) => {
            const isPositive = inv.gain_loss >= 0;
            const gainClass = isPositive ? "text-green-600" : "text-red-600";

            return (
              <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium">{inv.name}</div>
                  {inv.symbol && (
                    <div className="text-xs text-muted-foreground">{inv.symbol}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                    {getTypeLabel(inv.type)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{parseFloat(inv.quantity)}</td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(parseFloat(inv.purchase_price), inv.currency)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(parseFloat(inv.current_price), inv.currency)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(inv.invested_amount, inv.currency)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(inv.current_value, inv.currency)}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${gainClass}`}>
                  {isPositive ? "+" : ""}
                  {formatCurrency(inv.gain_loss, inv.currency)}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${gainClass}`}>
                  {isPositive ? "+" : ""}
                  {inv.gain_percentage.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(inv)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(inv.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
