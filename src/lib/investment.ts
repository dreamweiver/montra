// =============================================================================
// Investment Utilities
// =============================================================================
// Pure helper functions for investment calculations and display.
// =============================================================================

import { INVESTMENT_TYPES } from "@/lib/constants";
import type { Investment, InvestmentWithGains, InvestmentStats } from "@/types";

export function computeGains(investment: Investment): InvestmentWithGains {
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

export function getTypeLabel(value: string): string {
  return INVESTMENT_TYPES.find((t) => t.value === value)?.label ?? value;
}

// =============================================================================
// Stats Parsing
// =============================================================================

const ZERO_STATS: InvestmentStats = {
  totalInvested: 0,
  currentValue: 0,
  totalGainLoss: 0,
  gainPercentage: 0,
  holdingCount: 0,
};

export function parseInvestmentStats(
  row: Record<string, string | null> | undefined
): InvestmentStats {
  const holdingCount = parseInt(row?.holding_count || "0", 10);
  const totalInvested = parseFloat(row?.total_invested || "0");
  const currentValue = parseFloat(row?.total_current || "0");

  if (!row?.total_invested || holdingCount === 0) {
    return ZERO_STATS;
  }

  const totalGainLoss = currentValue - totalInvested;
  const gainPercentage =
    totalInvested > 0 ? Math.round((totalGainLoss / totalInvested) * 100) : 0;

  return { totalInvested, currentValue, totalGainLoss, gainPercentage, holdingCount };
}
