// =============================================================================
// Recurring Transaction Validation Schema (Zod)
// =============================================================================
// Validation schema for recurring transaction forms.
// =============================================================================

import { z } from "zod";

export const recurringTransactionSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  type: z.enum(["income", "expense"]),
  description: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
  currency: z.string().min(1, "Please select a currency"),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  start_date: z.date(),
  end_date: z.date().nullable().optional(),
});

export type RecurringTransactionFormData = z.infer<typeof recurringTransactionSchema>;
