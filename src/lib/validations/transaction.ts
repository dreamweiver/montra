// =============================================================================
// Transaction Validation Schema (Zod)
// =============================================================================
// Centralized validation schema for transaction forms.
// Used by AddTransactionSheet and EditTransactionSheet.
// =============================================================================

import { z } from "zod";

// ---------------------------------------------
// Transaction Form Schema
// ---------------------------------------------
// Validates transaction form input before submission.
// - amount: Required, must be a positive number
// - type: Must be either "income" or "expense"
// - description: Optional text field
// - category: Required, must be non-empty
// - transaction_date: Required date field
// ---------------------------------------------
export const transactionSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  type: z.enum(["income", "expense"]),
  description: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
  transaction_date: z.date(),
});

// Infer TypeScript type from schema
export type TransactionFormData = z.infer<typeof transactionSchema>;

// ---------------------------------------------
// Transaction Filter Schema
// ---------------------------------------------
// Validates transaction filter/search parameters.
// All fields are optional for flexible filtering.
// ---------------------------------------------
export const transactionFilterSchema = z.object({
  type: z.enum(["income", "expense", "all"]).optional(),
  category: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
});

export type TransactionFilterData = z.infer<typeof transactionFilterSchema>;
