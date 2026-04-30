// =============================================================================
// Type Exports (Barrel File)
// =============================================================================
// Central export point for all TypeScript types.
// Import from "@/types" instead of individual files.
// =============================================================================

export type {
  Transaction,
  TransactionType,
  TransactionFormData,
  TransactionWithAmount,
} from "./transaction";

export type {
  Category,
  CategoryFormData,
} from "./category";

export {
  DEFAULT_CATEGORY_ICONS,
  DEFAULT_CATEGORY_COLORS,
} from "./category";

export type {
  RecurringTransaction,
  RecurringTransactionFormData,
  RecurrenceFrequency,
} from "./recurring";

export type { UserSettings } from "./settings";

export type { Budget, BudgetStatus } from "./budget";

export type {
  Investment,
  InvestmentWithGains,
  InvestmentStats,
  InvestmentType,
  SymbolSearchResult,
  FavouriteStockStatus,
} from "./investment";
