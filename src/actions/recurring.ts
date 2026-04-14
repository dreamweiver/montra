"use server";

// =============================================================================
// Recurring Transaction Server Actions
// =============================================================================
// CRUD operations + auto-generation logic for recurring transactions.
// =============================================================================

import { sql } from "@/db/neon";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/actions/auth";
import type { RecurringTransaction } from "@/types/recurring";

// ---------------------------------------------
// Helper: Format date as YYYY-MM-DD (timezone-safe)
// ---------------------------------------------
function toDateString(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T00:00:00.000Z`;
}

// =============================================================================
// Get Recurring Transactions
// =============================================================================
export async function getRecurringTransactions(): Promise<RecurringTransaction[]> {
  try {
    const user = await getAuthUser();
    if (!user) return [];

    const result = await sql`
      SELECT * FROM recurring_transactions
      WHERE user_id = ${user.id}
      ORDER BY next_date ASC
    `;

    return result as RecurringTransaction[];
  } catch (error) {
    console.error("Failed to fetch recurring transactions:", error);
    return [];
  }
}

// =============================================================================
// Add Recurring Transaction
// =============================================================================
export async function addRecurringTransaction(data: {
  amount: string;
  type: string;
  description?: string;
  category: string;
  frequency: string;
  start_date: Date;
  end_date?: Date | null;
}) {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const startDateStr = toDateString(data.start_date);
    const endDateStr = data.end_date ? toDateString(data.end_date) : null;

    await sql`
      INSERT INTO recurring_transactions (
        user_id, amount, type, description, category,
        frequency, start_date, end_date, next_date, is_active
      ) VALUES (
        ${user.id}, ${data.amount}, ${data.type}, ${data.description || null}, ${data.category},
        ${data.frequency}, ${startDateStr}, ${endDateStr},
        ${startDateStr}, true
      )
    `;

    revalidatePath("/dashboard/recurring");
    return { success: true };
  } catch (error) {
    console.error("Failed to add recurring transaction:", error);
    return { success: false, error: "Failed to create recurring transaction" };
  }
}

// =============================================================================
// Update Recurring Transaction
// =============================================================================
export async function updateRecurringTransaction(
  id: number,
  data: {
    amount: string;
    type: string;
    description?: string;
    category: string;
    frequency: string;
    start_date: Date;
    end_date?: Date | null;
    is_active?: boolean;
  }
) {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const startDateStr = toDateString(data.start_date);
    const endDateStr = data.end_date ? toDateString(data.end_date) : null;

    await sql`
      UPDATE recurring_transactions
      SET
        amount = ${data.amount},
        type = ${data.type},
        description = ${data.description || null},
        category = ${data.category},
        frequency = ${data.frequency},
        start_date = ${startDateStr},
        end_date = ${endDateStr},
        is_active = ${data.is_active ?? true}
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    revalidatePath("/dashboard/recurring");
    return { success: true };
  } catch (error) {
    console.error("Failed to update recurring transaction:", error);
    return { success: false, error: "Failed to update recurring transaction" };
  }
}

// =============================================================================
// Delete Recurring Transaction
// =============================================================================
export async function deleteRecurringTransaction(id: number) {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await sql`
      DELETE FROM recurring_transactions
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    revalidatePath("/dashboard/recurring");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete recurring transaction:", error);
    return { success: false, error: "Failed to delete recurring transaction" };
  }
}

// =============================================================================
// Toggle Recurring Transaction Active/Inactive
// =============================================================================
export async function toggleRecurringTransaction(id: number, isActive: boolean) {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await sql`
      UPDATE recurring_transactions
      SET is_active = ${isActive}
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    revalidatePath("/dashboard/recurring");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle recurring transaction:", error);
    return { success: false, error: "Failed to toggle recurring transaction" };
  }
}

// =============================================================================
// Process Due Recurring Transactions
// =============================================================================
// Checks for active recurring transactions where next_date <= today,
// creates the actual transaction, and advances next_date.
// Called on dashboard/recurring page load.
// =============================================================================
export async function processDueRecurringTransactions() {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, processed: 0 };

    const now = new Date();
    const todayStr = toDateString(now);

    // Get all due recurring transactions for this user
    const dueItems = await sql`
      SELECT * FROM recurring_transactions
      WHERE user_id = ${user.id}
        AND is_active = true
        AND next_date <= ${todayStr}
        AND (end_date IS NULL OR end_date >= ${todayStr})
    `;

    let processed = 0;

    for (const item of dueItems) {
      let nextDate = new Date(item.next_date);

      // Generate transactions for each missed date up to today
      while (nextDate <= now) {
        // Create the actual transaction
        await sql`
          INSERT INTO transactions (
            user_id, amount, type, description, category, transaction_date
          ) VALUES (
            ${user.id}, ${item.amount}, ${item.type},
            ${item.description}, ${item.category},
            ${toDateString(nextDate)}
          )
        `;

        processed++;

        // Advance next_date based on frequency
        nextDate = advanceDate(nextDate, item.frequency as string);
      }

      // Check if end_date has passed
      const endDate = item.end_date ? new Date(item.end_date) : null;
      if (endDate && nextDate > endDate) {
        // Deactivate if past end date
        await sql`
          UPDATE recurring_transactions
          SET is_active = false, next_date = ${toDateString(nextDate)}
          WHERE id = ${item.id} AND user_id = ${user.id}
        `;
      } else {
        // Update next_date
        await sql`
          UPDATE recurring_transactions
          SET next_date = ${toDateString(nextDate)}
          WHERE id = ${item.id} AND user_id = ${user.id}
        `;
      }
    }

    if (processed > 0) {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/transactions");
      revalidatePath("/dashboard/recurring");
    }

    return { success: true, processed };
  } catch (error) {
    console.error("Failed to process recurring transactions:", error);
    return { success: false, processed: 0 };
  }
}

// =============================================================================
// Helper: Advance Date by Frequency
// =============================================================================
function advanceDate(date: Date, frequency: string): Date {
  const next = new Date(date);

  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}
