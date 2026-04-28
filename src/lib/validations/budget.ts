import { z } from "zod";

export const budgetSchema = z.object({
  monthlyLimit: z
    .string()
    .min(1, "Budget amount is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      { message: "Budget amount must be greater than 0" }
    ),
  currency: z.string().min(1, "Please select a currency"),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;
