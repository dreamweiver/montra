"use server";

// =============================================================================
// Investment Server Actions
// =============================================================================
// Server-side actions for CRUD operations on investments and price tracking.
// All actions require authentication via getAuthUser.
// =============================================================================

import { sql } from "@/db/neon";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/actions/auth";
import { extractErrorMessage } from "@/lib/utils";
import { parseInvestmentStats } from "@/lib/investment";
import { parseInvestmentFormData } from "@/lib/formData";
import type { Investment, InvestmentStats } from "@/types";
import { refreshInvestmentPrices } from "@/actions/refreshPrices";

export interface InvestmentPageData {
  investments: Investment[];
  stats: InvestmentStats;
}

// =============================================================================
// Get Investments
// =============================================================================
export async function getInvestments(): Promise<{
  success: boolean;
  data?: Investment[];
  error?: string;
}> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const result = await sql`
      SELECT * FROM investments
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return { success: true, data: result as Investment[] };
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to get investments");
    console.error("Get investments error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Add Investment
// =============================================================================
export async function addInvestment(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const { name, symbol, type, quantity, purchase_price, current_price, currency, purchase_date, notes } = parseInvestmentFormData(formData);

    await sql`
      INSERT INTO investments
        (user_id, name, symbol, type, quantity, purchase_price, current_price, currency, purchase_date, notes)
      VALUES
        (${user.id}, ${name}, ${symbol}, ${type}, ${parseFloat(quantity)}, ${parseFloat(purchase_price)}, ${parseFloat(current_price)}, ${currency}, ${new Date(purchase_date)}, ${notes})
    `;

    revalidatePath("/dashboard/investments");
    return { success: true };
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to add investment");
    console.error("Add investment error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Update Investment
// =============================================================================
export async function updateInvestment(
  id: number,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const { name, symbol, type, quantity, purchase_price, current_price, currency, purchase_date, notes } = parseInvestmentFormData(formData);

    const result = await sql`
      UPDATE investments
      SET
        name = ${name},
        symbol = ${symbol},
        type = ${type},
        quantity = ${parseFloat(quantity)},
        purchase_price = ${parseFloat(purchase_price)},
        current_price = ${parseFloat(current_price)},
        currency = ${currency},
        purchase_date = ${new Date(purchase_date)},
        notes = ${notes},
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return { success: false, error: "Investment not found" };
    }

    revalidatePath("/dashboard/investments");
    return { success: true };
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to update investment");
    console.error("Update investment error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Delete Investment
// =============================================================================
export async function deleteInvestment(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const result = await sql`
      DELETE FROM investments
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return { success: false, error: "Investment not found" };
    }

    revalidatePath("/dashboard/investments");
    return { success: true };
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to delete investment");
    console.error("Delete investment error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Get Investment Stats
// =============================================================================
export async function getInvestmentStats(): Promise<InvestmentStats> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return parseInvestmentStats(undefined);
    }

    const result = await sql`
      SELECT
        COUNT(*) as holding_count,
        SUM(quantity * purchase_price) as total_invested,
        SUM(quantity * current_price) as total_current
      FROM investments
      WHERE user_id = ${user.id}
    `;

    return parseInvestmentStats(result[0]);
  } catch (error: unknown) {
    console.error("Get investment stats error:", error);
    return parseInvestmentStats(undefined);
  }
}

// =============================================================================
// Update Investment Prices
// =============================================================================
export async function updateInvestmentPrices(
  updates: { id: number; currentPrice: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    if (updates.length === 0) {
      return { success: true };
    }

    for (const { id, currentPrice } of updates) {
      await sql`
        UPDATE investments
        SET current_price = ${currentPrice}, updated_at = NOW()
        WHERE id = ${id} AND user_id = ${user.id}
      `;
    }

    revalidatePath("/dashboard/investments");
    return { success: true };
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to update investment prices");
    console.error("Update investment prices error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Get Investment Page Data (consolidated)
// =============================================================================
export async function getInvestmentPageData(): Promise<InvestmentPageData> {
  const user = await getAuthUser();
  if (!user) return { investments: [], stats: parseInvestmentStats(undefined) };

  await refreshInvestmentPrices();

  const [investmentRows, statsRows] = await Promise.all([
    sql`
      SELECT * FROM investments
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `,
    sql`
      SELECT
        COUNT(*) as holding_count,
        SUM(quantity * purchase_price) as total_invested,
        SUM(quantity * current_price) as total_current
      FROM investments
      WHERE user_id = ${user.id}
    `,
  ]);

  const investments = investmentRows as Investment[];
  const stats = parseInvestmentStats(statsRows[0]);

  return { investments, stats };
}
