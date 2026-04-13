"use server";

// =============================================================================
// Transaction Server Actions
// =============================================================================
// Server-side actions for CRUD operations on transactions.
// All actions require authentication via Supabase.
// =============================================================================

import { sql } from "@/db/neon";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ---------------------------------------------
// Helper: Get Authenticated User
// ---------------------------------------------
// Returns the current user or null if not authenticated.
// ---------------------------------------------
async function getAuthUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// =============================================================================
// Add Transaction
// =============================================================================
export async function addTransaction(formData: FormData) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const amount = formData.get("amount") as string;
    const type = formData.get("type") as "income" | "expense";
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const transaction_date = formData.get("transaction_date") as string;

    await sql`
      INSERT INTO transactions 
        (user_id, amount, type, description, category, transaction_date)
      VALUES 
        (${user.id}, ${parseFloat(amount)}, ${type}, ${description || null}, ${category}, ${new Date(transaction_date)})
    `;

    revalidatePath("/dashboard/transactions");

    return { success: true };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add transaction";
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

    // Build dynamic query based on filters
    let transactions;

    if (filters?.startDate && filters?.endDate && filters?.type && filters?.type !== "all" && filters?.category && filters.category !== "all") {
      // All filters
      transactions = await sql`
        SELECT id, amount, type, description, category, transaction_date, created_at
        FROM transactions
        WHERE user_id = ${user.id}
          AND transaction_date >= ${filters.startDate}
          AND transaction_date <= ${filters.endDate}
          AND type = ${filters.type}
          AND category = ${filters.category}
        ORDER BY transaction_date DESC, created_at DESC
      `;
    } else if (filters?.startDate && filters?.endDate && filters?.type && filters.type !== "all") {
      // Date + type
      transactions = await sql`
        SELECT id, amount, type, description, category, transaction_date, created_at
        FROM transactions
        WHERE user_id = ${user.id}
          AND transaction_date >= ${filters.startDate}
          AND transaction_date <= ${filters.endDate}
          AND type = ${filters.type}
        ORDER BY transaction_date DESC, created_at DESC
      `;
    } else if (filters?.startDate && filters?.endDate && filters?.category && filters.category !== "all") {
      // Date + category
      transactions = await sql`
        SELECT id, amount, type, description, category, transaction_date, created_at
        FROM transactions
        WHERE user_id = ${user.id}
          AND transaction_date >= ${filters.startDate}
          AND transaction_date <= ${filters.endDate}
          AND category = ${filters.category}
        ORDER BY transaction_date DESC, created_at DESC
      `;
    } else if (filters?.startDate && filters?.endDate) {
      // Date only
      transactions = await sql`
        SELECT id, amount, type, description, category, transaction_date, created_at
        FROM transactions
        WHERE user_id = ${user.id}
          AND transaction_date >= ${filters.startDate}
          AND transaction_date <= ${filters.endDate}
        ORDER BY transaction_date DESC, created_at DESC
      `;
    } else if (filters?.type && filters.type !== "all" && filters?.category && filters.category !== "all") {
      // Type + category
      transactions = await sql`
        SELECT id, amount, type, description, category, transaction_date, created_at
        FROM transactions
        WHERE user_id = ${user.id}
          AND type = ${filters.type}
          AND category = ${filters.category}
        ORDER BY transaction_date DESC, created_at DESC
      `;
    } else if (filters?.type && filters.type !== "all") {
      // Type only
      transactions = await sql`
        SELECT id, amount, type, description, category, transaction_date, created_at
        FROM transactions
        WHERE user_id = ${user.id}
          AND type = ${filters.type}
        ORDER BY transaction_date DESC, created_at DESC
      `;
    } else if (filters?.category && filters.category !== "all") {
      // Category only
      transactions = await sql`
        SELECT id, amount, type, description, category, transaction_date, created_at
        FROM transactions
        WHERE user_id = ${user.id}
          AND category = ${filters.category}
        ORDER BY transaction_date DESC, created_at DESC
      `;
    } else {
      // No filters
      transactions = await sql`
        SELECT id, amount, type, description, category, transaction_date, created_at
        FROM transactions
        WHERE user_id = ${user.id}
        ORDER BY transaction_date DESC, created_at DESC
      `;
    }

    return { success: true, data: transactions };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch transactions";
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

    return { success: true };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete transaction";
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

    const amount = formData.get("amount") as string;
    const type = formData.get("type") as "income" | "expense";
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const transaction_date = formData.get("transaction_date") as string;

    // Update only if transaction belongs to user (security check)
    const result = await sql`
      UPDATE transactions 
      SET 
        amount = ${parseFloat(amount)},
        type = ${type},
        description = ${description || null},
        category = ${category},
        transaction_date = ${new Date(transaction_date)}
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return { success: false, error: "Transaction not found" };
    }

    revalidatePath("/dashboard/transactions");

    return { success: true };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update transaction";
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
      SELECT id, amount, type, description, category, transaction_date, created_at
      FROM transactions
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    if (transactions.length === 0) {
      return { success: false, error: "Transaction not found", data: null };
    }

    return { success: true, data: transactions[0] };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch transaction";
    console.error("Get transaction error:", error);
    return { success: false, error: message, data: null };
  }
}