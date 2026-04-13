// =============================================================================
// Category Types
// =============================================================================
// Type definitions for category-related data structures.
// =============================================================================

import { TransactionType } from "./transaction";

/**
 * Category record from database
 */
export interface Category {
  id: number;
  user_id: string;
  name: string;
  type: TransactionType;
  icon: string | null;
  color: string | null;
  created_at: string;
}

/**
 * Category form data (for create/edit)
 */
export interface CategoryFormData {
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
}

/**
 * Default category icons by type
 */
export const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  // Expense categories
  Food: "🍔",
  Transport: "🚗",
  Shopping: "🛍️",
  Rent: "🏠",
  Entertainment: "🎬",
  Bills: "📄",
  Healthcare: "🏥",
  // Income categories
  Salary: "💰",
  Freelance: "💻",
  Investment: "📈",
  // Generic
  Others: "📦",
};

/**
 * Default category colors
 */
export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  Food: "#ef4444",
  Transport: "#f97316",
  Shopping: "#eab308",
  Rent: "#22c55e",
  Entertainment: "#06b6d4",
  Bills: "#3b82f6",
  Healthcare: "#8b5cf6",
  Salary: "#10b981",
  Freelance: "#6366f1",
  Investment: "#14b8a6",
  Others: "#6b7280",
};
