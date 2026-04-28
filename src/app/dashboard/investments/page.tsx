"use client";

// =============================================================================
// Investments Page
// =============================================================================
// Displays all investment holdings with stats, filters, and live price refresh.
// Supports add, edit, delete, and type-based filtering.
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, TrendingUp } from "lucide-react";
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
  getInvestmentPageData,
  deleteInvestment,
} from "@/actions/investments";
import { refreshInvestmentPrices } from "@/actions/refreshPrices";
import {
  InvestmentStatsCards,
  AddInvestmentSheet,
  EditInvestmentSheet,
  InvestmentTable,
  InvestmentCardList,
} from "@/components/features/investments";
import { ConfirmDialog, EmptyState, PageLoader } from "@/components/shared";
import { INVESTMENT_TYPES, LIVE_FETCH_TYPES } from "@/lib/constants";
import { computeGains, getTypeLabel } from "@/lib/investment";
import type { Investment, InvestmentStats, InvestmentWithGains } from "@/types";

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
      const { investments: data, stats: statsResult } = await getInvestmentPageData();
      setInvestments(data.map(computeGains));
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
      const { updated } = await refreshInvestmentPrices();
      if (updated > 0) {
        toast.success(`Updated prices for ${updated} holding(s)`);
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
    return <PageLoader />;
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
          <InvestmentTable
            investments={filteredInvestments}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteId(id)}
          />

          {/* Mobile Cards */}
          <InvestmentCardList
            investments={filteredInvestments}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteId(id)}
          />
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
