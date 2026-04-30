"use server";

import { sql } from "@/db/neon";
import { getAuthUser } from "@/actions/auth";
import { computeGains } from "@/lib/investment";
import { MAX_FAVOURITE_STOCKS } from "@/lib/constants";
import type { Investment, FavouriteStockStatus } from "@/types";

export async function getFavouriteStockIds(): Promise<number[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const result = await sql`
    SELECT favourite_stock_ids FROM user_settings WHERE user_id = ${user.id} LIMIT 1
  `;

  if (result.length === 0 || !result[0].favourite_stock_ids) return [];

  try {
    return JSON.parse(result[0].favourite_stock_ids) as number[];
  } catch {
    return [];
  }
}

export async function toggleFavouriteStock(
  investmentId: number
): Promise<{ success: boolean; error?: string; isFavourite?: boolean }> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "You must be logged in" };

  const invResult = await sql`
    SELECT id, type FROM investments WHERE id = ${investmentId} AND user_id = ${user.id} LIMIT 1
  `;
  if (invResult.length === 0) return { success: false, error: "Investment not found" };
  if (invResult[0].type !== "stock") return { success: false, error: "Only stocks can be favourited" };

  const currentIds = await getFavouriteStockIds();
  const isCurrent = currentIds.includes(investmentId);

  let newIds: number[];
  if (isCurrent) {
    newIds = currentIds.filter((id) => id !== investmentId);
  } else {
    if (currentIds.length >= MAX_FAVOURITE_STOCKS) {
      return { success: false, error: `Maximum ${MAX_FAVOURITE_STOCKS} favourite stocks allowed` };
    }
    newIds = [...currentIds, investmentId];
  }

  await sql`
    UPDATE user_settings
    SET favourite_stock_ids = ${JSON.stringify(newIds)}, updated_at = NOW()
    WHERE user_id = ${user.id}
  `;

  return { success: true, isFavourite: !isCurrent };
}

export async function getFavouriteStocksStatus(): Promise<FavouriteStockStatus[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const ids = await getFavouriteStockIds();
  if (ids.length === 0) return [];

  const investments = await sql`
    SELECT * FROM investments
    WHERE id = ANY(${ids}) AND user_id = ${user.id} AND type = 'stock'
  `;

  return (investments as unknown as Investment[]).map((inv) => {
    const withGains = computeGains(inv);
    return {
      id: inv.id,
      name: inv.name,
      symbol: inv.symbol,
      gain_percentage: withGains.gain_percentage,
      is_positive: withGains.gain_loss >= 0,
    };
  });
}
