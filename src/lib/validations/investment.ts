import { z } from "zod";

export const investmentSchema = z.object({
  name: z
    .string()
    .min(1, "Investment name is required")
    .max(100, "Name must be 100 characters or less"),
  type: z.enum(["stock", "mutual_fund", "fixed_deposit", "gold", "crypto", "bond", "real_estate"]),
  symbol: z.string().optional(),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Quantity must be greater than 0",
    }),
  purchase_price: z
    .string()
    .min(1, "Purchase price is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Purchase price must be greater than 0",
    }),
  current_price: z
    .string()
    .min(1, "Current price is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Current price must be greater than 0",
    }),
  currency: z.string().min(1, "Please select a currency"),
  purchase_date: z.date(),
  notes: z.string().optional(),
});

export type InvestmentFormData = z.infer<typeof investmentSchema>;
