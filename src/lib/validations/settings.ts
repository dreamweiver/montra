import { z } from "zod";

export const settingsSchema = z.object({
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  dateOfBirth: z.string().optional().default(""),
  defaultCurrency: z.string().min(1, "Please select a currency"),
  dateFormat: z.string().min(1, "Please select a date format"),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
