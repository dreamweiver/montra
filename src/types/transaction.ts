// =============================================================================
// Transaction Types
// =============================================================================
// Type definitions for transaction-related data structures.
// =============================================================================

/**
 * Transaction type - either income or expense
 */
export type TransactionType = "income" | "expense";

/**
 * Transaction record from database
 */
export interface Transaction {
  id: number;
  user_id: string;
  amount: string;                    // Stored as string from numeric DB type
  type: TransactionType;
  description: string | null;
  category: string | null;
  transaction_date: string;          // ISO date string
  created_at: string;                // ISO date string
}

/**
 * Transaction form data (before submission)
 */
export interface TransactionFormData {
  amount: string;
  type: TransactionType;
  description?: string;
  category: string;
  transaction_date: Date;
}

/**
 * Transaction with parsed numeric amount (for calculations)
 */
export interface TransactionWithAmount extends Omit<Transaction, "amount"> {
  amount: number;
}
