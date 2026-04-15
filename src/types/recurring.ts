// =============================================================================
// Recurring Transaction Types
// =============================================================================
// Type definitions for recurring transaction data structures.
// =============================================================================

import { TransactionType } from "./transaction";

/**
 * Recurrence frequency options
 */
export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly";

/**
 * Recurring transaction record from database
 */
export interface RecurringTransaction {
  id: number;
  user_id: string;
  amount: string;
  type: TransactionType;
  description: string | null;
  category: string | null;
  category_id: number | null;
  currency: string;
  frequency: RecurrenceFrequency;
  start_date: string;
  end_date: string | null;
  next_date: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Form data for creating/editing recurring transactions
 */
export interface RecurringTransactionFormData {
  amount: string;
  type: TransactionType;
  description?: string;
  category: string;
  frequency: RecurrenceFrequency;
  start_date: Date;
  end_date?: Date | null;
}
