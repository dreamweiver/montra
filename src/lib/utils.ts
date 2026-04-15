import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CURRENCY, SUPPORTED_CURRENCIES } from "@/lib/constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, currencyCode?: string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCY;
  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    maximumFractionDigits: 0,
  }).format(value);
}

export function extractErrorMessage(error: unknown, fallback = "An error occurred"): string {
  return error instanceof Error ? error.message : fallback;
}
