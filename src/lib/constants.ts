// =============================================================================
// Application Constants
// =============================================================================
// Centralized constants used throughout the application.
// Import from "@/lib/constants" to use.
// =============================================================================

// ---------------------------------------------
// Transaction Categories
// ---------------------------------------------
// Predefined categories for income and expense transactions.
// Used in AddTransactionSheet and transaction filters.
// ---------------------------------------------
export const TRANSACTION_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Rent",
  "Salary",
  "Freelance",
  "Entertainment",
  "Bills",
  "Healthcare",
  "Others",
] as const;

// Type for category values
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

// ---------------------------------------------
// Expense Categories (subset for filtering)
// ---------------------------------------------
export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Rent",
  "Entertainment",
  "Bills",
  "Healthcare",
  "Others",
] as const;

// ---------------------------------------------
// Income Categories (subset for filtering)
// ---------------------------------------------
export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Others",
] as const;

// ---------------------------------------------
// Currency Configuration
// ---------------------------------------------
export const CURRENCY = {
  code: "INR",
  symbol: "₹",
  locale: "en-IN",
} as const;

// ---------------------------------------------
// Date Formats
// ---------------------------------------------
export const DATE_FORMATS = {
  display: "dd MMM yyyy",       // 10 Apr 2026
  displayLong: "PPP",           // April 10th, 2026
  input: "yyyy-MM-dd",          // 2026-04-10
  monthYear: "MMMM yyyy",       // April 2026
} as const;

// ---------------------------------------------
// Pagination
// ---------------------------------------------
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
} as const;

// ---------------------------------------------
// Routes
// ---------------------------------------------
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  transactions: "/dashboard/transactions",
  investments: "/dashboard/investments",
  settings: "/dashboard/settings",
} as const;

// ---------------------------------------------
// Category Emojis
// ---------------------------------------------
export const CATEGORY_EMOJIS = [
  "🍔", "🍕", "☕", "🛒", "🛍️", "🏠", "🚗", "⛽", "🚌", "✈️",
  "🎬", "🎮", "📱", "💻", "📄", "💡", "🏥", "💊", "🎓", "📚",
  "💰", "💵", "💳", "📈", "🏦", "👔", "👗", "💼", "🎁", "📦",
] as const;

// ---------------------------------------------
// Category Colors
// ---------------------------------------------
export const CATEGORY_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#6b7280", "#78716c", "#71717a",
] as const;

// ---------------------------------------------
// Frequency Options (Recurring Transactions)
// ---------------------------------------------
export const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};
