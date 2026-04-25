"use server";

// =============================================================================
// Budget Server Actions
// =============================================================================
// Server-side actions for managing monthly budget and checking budget status.
// All actions require authentication via Supabase.
// =============================================================================

import { sql } from "@/db/neon";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/actions/auth";
import { extractErrorMessage } from "@/lib/utils";
import type { Budget, BudgetStatus } from "@/types/budget";

export interface BudgetPageData {
  budget: Budget | null;
  status: BudgetStatus;
  defaultCurrency: string;
}

// =============================================================================
// Get Budget
// =============================================================================
export async function getBudget(): Promise<{ success: boolean; data?: Budget; error?: string }> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const result = await sql`
      SELECT * FROM budgets WHERE user_id = ${user.id} LIMIT 1
    `;

    if (result.length === 0) {
      return { success: true, data: undefined };
    }

    return { success: true, data: result[0] as Budget };
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to get budget");
    console.error("Get budget error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Upsert Budget
// =============================================================================
export async function upsertBudget(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const monthlyLimit = formData.get("monthly_limit") as string;
    const currency = formData.get("currency") as string;

    if (!monthlyLimit || parseFloat(monthlyLimit) <= 0) {
      return { success: false, error: "Budget amount must be greater than 0" };
    }

    await sql`
      INSERT INTO budgets (user_id, monthly_limit, currency, updated_at)
      VALUES (${user.id}, ${monthlyLimit}, ${currency}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        monthly_limit = ${monthlyLimit},
        currency = ${currency},
        updated_at = NOW()
    `;

    revalidatePath("/dashboard/budgets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to save budget");
    console.error("Upsert budget error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Check Budget Status
// =============================================================================
// Calculates current month's total expenses and compares against budget limit.
// Returns spending percentage and amounts for UI display and toast alerts.
// =============================================================================
export async function checkBudgetStatus(): Promise<{ success: boolean; data?: BudgetStatus; error?: string }> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    // Get user's budget
    const budgetResult = await sql`
      SELECT * FROM budgets WHERE user_id = ${user.id} LIMIT 1
    `;

    if (budgetResult.length === 0) {
      return {
        success: true,
        data: { hasBudget: false, spent: 0, limit: 0, percentage: 0, currency: "INR" },
      };
    }

    const budget = budgetResult[0] as Budget;
    const limit = parseFloat(budget.monthly_limit);

    // Get current month's total expenses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const spentResult = await sql`
      SELECT COALESCE(SUM(amount::numeric), 0) as total
      FROM transactions
      WHERE user_id = ${user.id}
        AND type = 'expense'
        AND transaction_date >= ${startOfMonth.toISOString()}
        AND transaction_date <= ${endOfMonth.toISOString()}
    `;

    const spent = parseFloat(spentResult[0]?.total || "0");
    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    return {
      success: true,
      data: {
        hasBudget: true,
        spent,
        limit,
        percentage,
        currency: budget.currency,
      },
    };
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to check budget");
    console.error("Check budget status error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Get Budget Page Data (consolidated)
// =============================================================================
export async function getBudgetPageData(): Promise<BudgetPageData> {
  const user = await getAuthUser();
  const empty: BudgetPageData = {
    budget: null,
    status: { hasBudget: false, spent: 0, limit: 0, percentage: 0, currency: "INR" },
    defaultCurrency: "INR",
  };

  if (!user) return empty;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [budgetRows, spentRows, settingsRows] = await Promise.all([
    sql`SELECT * FROM budgets WHERE user_id = ${user.id} LIMIT 1`,
    sql`
      SELECT COALESCE(SUM(amount::numeric), 0) as total
      FROM transactions
      WHERE user_id = ${user.id}
        AND type = 'expense'
        AND transaction_date >= ${startOfMonth.toISOString()}
        AND transaction_date <= ${endOfMonth.toISOString()}
    `,
    sql`SELECT * FROM user_settings WHERE user_id = ${user.id} LIMIT 1`,
  ]);

  const budget = budgetRows.length > 0 ? (budgetRows[0] as Budget) : null;
  const defaultCurrency = (settingsRows[0]?.default_currency as string) || "INR";

  if (!budget) {
    return { budget: null, status: empty.status, defaultCurrency };
  }

  const limit = parseFloat(budget.monthly_limit);
  const spent = parseFloat(spentRows[0]?.total || "0");
  const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

  return {
    budget,
    status: { hasBudget: true, spent, limit, percentage, currency: budget.currency },
    defaultCurrency,
  };
}
