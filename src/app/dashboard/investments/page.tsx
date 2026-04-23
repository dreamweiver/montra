"use client";

// =============================================================================
// Investments Page
// =============================================================================
// Displays all investment holdings with stats, filters, and live price refresh.
// Supports add, edit, delete, and type-based filtering.
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw, Pencil, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getInvestments,
  deleteInvestment,
  getInvestmentStats,
  updateInvestmentPrices,
} from "@/actions/investments";
import {
  InvestmentStatsCards,
  AddInvestmentSheet,
  EditInvestmentSheet,
} from "@/components/features/investments";
import { ConfirmDialog, EmptyState } from "@/components/shared";
import { formatCurrency } from "@/lib/utils";
import { INVESTMENT_TYPES, LIVE_FETCH_TYPES } from "@/lib/constants";
import type { Investment, InvestmentStats, InvestmentWithGains } from "@/types";

// =============================================================================
// Helpers
// =============================================================================

function computeGains(investment: Investment): InvestmentWithGains {
  const qty = parseFloat(investment.quantity);
  const purchasePrice = parseFloat(investment.purchase_price);
  const currentPrice = parseFloat(investment.current_price);

  const invested_amount = qty * purchasePrice;
  const current_value = qty * currentPrice;
  const gain_loss = current_value - invested_amount;
  const gain_percentage =
    invested_amount > 0
      ? Math.round((gain_loss / invested_amount) * 10000) / 100
      : 0;

  return { ...investment, invested_amount, current_value, gain_loss, gain_percentage };
}

function getTypeLabel(value: string): string {
  return INVESTMENT_TYPES.find((t) => t.value === value)?.label ?? value;
}

// =============================================================================
// Zero Stats
// =============================================================================
const ZERO_STATS: InvestmentStats = {
  totalInvested: 0,
  currentValue: 0,
  totalGainLoss: 0,
  gainPercentage: 0,
  holdingCount: 0,
};

// =============================================================================
// Main Component
// =============================================================================
export default function InvestmentsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const [investments, setInvestments] = useState<InvestmentWithGains[]>([]);
  const [stats, setStats] = useState<InvestmentStats>(ZERO_STATS);
  const [filterType, setFilterType] = useState("all");
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch Data
  // ---------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [investmentsResult, statsResult] = await Promise.all([
        getInvestments(),
        getInvestmentStats(),
      ]);

      if (investmentsResult.success && investmentsResult.data) {
        setInvestments(investmentsResult.data.map(computeGains));
      }
      setStats(statsResult);
    } catch (error) {
      console.error("Failed to fetch investments:", error);
      toast.error("Failed to load investments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // Refresh Live Prices
  // ---------------------------------------------------------------------------
  const handleRefreshPrices = async () => {
    const liveFetchable = investments.filter(
      (inv) => inv.symbol && LIVE_FETCH_TYPES.includes(inv.type)
    );

    if (liveFetchable.length === 0) {
      const hasLiveType = investments.some((inv) => LIVE_FETCH_TYPES.includes(inv.type));
      if (hasLiveType) {
        toast.info("Add a ticker symbol to your holdings to enable live price fetch (edit the holding and add the symbol)");
      } else {
        toast.info("No holdings eligible for live price fetch (only stocks, mutual funds, and crypto are supported)");
      }
      return;
    }

    setRefreshingPrices(true);
    try {
      const symbols = liveFetchable.map((inv) => inv.symbol).join(",");
      const response = await fetch(`/api/investments/prices?symbols=${symbols}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch prices");
      }

      const prices = data.prices ?? data;
      const updates = liveFetchable
        .filter((inv) => prices[inv.symbol!] !== undefined)
        .map((inv) => ({ id: inv.id, currentPrice: prices[inv.symbol!] }));

      if (updates.length > 0) {
        await updateInvestmentPrices(updates);
        toast.success(`Updated prices for ${updates.length} holding(s)`);
      } else {
        toast.info("No price updates available");
      }

      await fetchData();
    } catch (error) {
      console.error("Failed to refresh prices:", error);
      toast.error("Failed to refresh prices");
    } finally {
      setRefreshingPrices(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------
  const handleDelete = async () => {
    if (deleteId === null) return;
    const result = await deleteInvestment(deleteId);
    if (result.success) {
      toast.success("Investment deleted");
    } else {
      toast.error(result.error ?? "Failed to delete investment");
    }
    setDeleteId(null);
    await fetchData();
  };

  // ---------------------------------------------------------------------------
  // Edit
  // ---------------------------------------------------------------------------
  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setEditSheetOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Filtered Investments
  // ---------------------------------------------------------------------------
  const filteredInvestments =
    filterType === "all"
      ? investments
      : investments.filter((inv) => inv.type === filterType);

  // =============================================================================
  // Loading State
  // =============================================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // =============================================================================
  // Main Render
  // =============================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Investments</h1>
        <p className="text-muted-foreground mt-1">
          Track your portfolio and monitor gains across all holdings.
        </p>
      </div>

      {/* Stats Cards */}
      <InvestmentStatsCards
        totalInvested={stats.totalInvested}
        currentValue={stats.currentValue}
        totalGainLoss={stats.totalGainLoss}
        gainPercentage={stats.gainPercentage}
        holdingCount={stats.holdingCount}
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Add Investment */}
        <AddInvestmentSheet onSuccess={fetchData} />

        {/* Right: Filter + Refresh */}
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {INVESTMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshPrices}
            disabled={refreshingPrices}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshingPrices ? "animate-spin" : ""}`} />
            {refreshingPrices ? "Refreshing..." : "Refresh Prices"}
          </Button>
        </div>
      </div>

      {/* Holdings Table */}
      {filteredInvestments.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No investments yet"
          description={
            filterType === "all"
              ? "Add your first investment to start tracking your portfolio."
              : `No holdings of type "${getTypeLabel(filterType)}" found.`
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
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
                {filteredInvestments.map((inv) => {
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
                            onClick={() => handleEdit(inv)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(inv.id)}
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

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredInvestments.map((inv) => {
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => handleEdit(inv)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(inv.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Edit Investment Sheet */}
      <EditInvestmentSheet
        investment={editingInvestment}
        open={editSheetOpen}
        onOpenChange={(open) => {
          setEditSheetOpen(open);
          if (!open) setEditingInvestment(null);
        }}
        onSuccess={fetchData}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Delete Investment"
        description="Are you sure you want to delete this investment? This action cannot be undone."
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
