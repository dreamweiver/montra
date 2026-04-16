// =============================================================================
// Budget Types
// =============================================================================
// Type definitions for budget-related data structures.
// =============================================================================

/**
 * Budget record from database
 */
export interface Budget {
  id: number;
  user_id: string;
  monthly_limit: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

/**
 * Budget status returned by checkBudgetStatus()
 */
export interface BudgetStatus {
  hasBudget: boolean;
  spent: number;
  limit: number;
  percentage: number;
  currency: string;
}
