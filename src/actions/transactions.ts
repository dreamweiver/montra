"use server";

// =============================================================================
// Transaction Server Actions
// =============================================================================
// Server-side actions for CRUD operations on transactions.
// All actions require authentication via Supabase.
// =============================================================================

import { sql } from "@/db/neon";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/actions/auth";
import { extractErrorMessage } from "@/lib/utils";
import { parseTransactionFormData } from "@/lib/formData";
import { refreshInvestmentPrices } from "@/actions/refreshPrices";

// =============================================================================
// Add Transaction
// =============================================================================
export async function addTransaction(formData: FormData) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const { amount, type, description, category, currency, transaction_date } = parseTransactionFormData(formData);

    await sql`
      INSERT INTO transactions 
        (user_id, amount, type, description, category, currency, transaction_date)
      VALUES 
        (${user.id}, ${parseFloat(amount)}, ${type}, ${description || null}, ${category}, ${currency}, ${new Date(transaction_date)})
    `;

    revalidatePath("/dashboard/transactions");
    refreshInvestmentPrices().catch(() => {});

    return { success: true };

  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to add transaction");
    console.error("Add transaction error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Get Transactions
// =============================================================================
export interface TransactionFiltersParam {
  startDate?: Date;
  endDate?: Date;
  type?: "income" | "expense" | "all";
  category?: string;
}

export async function getTransactions(filters?: TransactionFiltersParam) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in", data: [] };
    }

    const hasDateRange = filters?.startDate && filters?.endDate;
    const typeFilter = filters?.type && filters.type !== "all" ? filters.type : null;
    const categoryFilter = filters?.category && filters.category !== "all" ? filters.category : null;

    const transactions = await sql`
      SELECT id, amount, type, description, category, currency, transaction_date, created_at
      FROM transactions
      WHERE user_id = ${user.id}
        AND (${!hasDateRange}::boolean OR transaction_date >= ${filters?.startDate ?? null})
        AND (${!hasDateRange}::boolean OR transaction_date <= ${filters?.endDate ?? null})
        AND (${!typeFilter}::boolean OR type = ${typeFilter})
        AND (${!categoryFilter}::boolean OR category = ${categoryFilter})
      ORDER BY transaction_date DESC, created_at DESC
    `;

    return { success: true, data: transactions };

  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to fetch transactions");
    console.error("Get transactions error:", error);
    return { success: false, error: message, data: [] };
  }
}

// =============================================================================
// Delete Transaction
// =============================================================================
export async function deleteTransaction(id: number) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    // Delete only if transaction belongs to user (security check)
    const result = await sql`
      DELETE FROM transactions 
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return { success: false, error: "Transaction not found" };
    }

    revalidatePath("/dashboard/transactions");
    refreshInvestmentPrices().catch(() => {});

    return { success: true };

  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to delete transaction");
    console.error("Delete transaction error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Update Transaction
// =============================================================================
export async function updateTransaction(id: number, formData: FormData) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const { amount, type, description, category, currency, transaction_date } = parseTransactionFormData(formData);

    // Update only if transaction belongs to user (security check)
    const result = await sql`
      UPDATE transactions 
      SET 
        amount = ${parseFloat(amount)},
        type = ${type},
        description = ${description || null},
        category = ${category},
        currency = ${currency},
        transaction_date = ${new Date(transaction_date)}
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return { success: false, error: "Transaction not found" };
    }

    revalidatePath("/dashboard/transactions");
    refreshInvestmentPrices().catch(() => {});

    return { success: true };

  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to update transaction");
    console.error("Update transaction error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Get Single Transaction (for editing)
// =============================================================================
export async function getTransaction(id: number) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in", data: null };
    }

    const transactions = await sql`
      SELECT id, amount, type, description, category, currency, transaction_date, created_at
      FROM transactions
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    if (transactions.length === 0) {
      return { success: false, error: "Transaction not found", data: null };
    }

    return { success: true, data: transactions[0] };

  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to fetch transaction");
    console.error("Get transaction error:", error);
    return { success: false, error: message, data: null };
  }
}