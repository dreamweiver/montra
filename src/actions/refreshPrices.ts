"use server";

// =============================================================================
// Refresh Investment Prices
// =============================================================================
// Fetches live prices from Yahoo Finance for all eligible holdings
// (stock, mutual_fund, crypto with symbols) and updates the DB.
// Converts prices from the quote's trading currency to the investment's
// stored currency using Yahoo Finance forex rates.
// =============================================================================

import { sql } from "@/db/neon";
import { getAuthUser } from "@/actions/auth";
import { LIVE_FETCH_TYPES } from "@/lib/constants";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

interface QuoteResult {
  regularMarketPrice?: number | null;
  currency?: string;
}

export async function refreshInvestmentPrices(): Promise<{ updated: number }> {
  try {
    const user = await getAuthUser();
    if (!user) return { updated: 0 };

    const investments = await sql`
      SELECT id, symbol, type, currency FROM investments
      WHERE user_id = ${user.id}
        AND symbol IS NOT NULL
        AND symbol != ''
        AND type = ANY(${LIVE_FETCH_TYPES as unknown as string[]})
    `;

    if (investments.length === 0) return { updated: 0 };

    // Fetch quotes in parallel
    const quotes = new Map<number, { price: number; quoteCurrency: string; targetCurrency: string }>();

    await Promise.all(
      investments.map(async (inv) => {
        try {
          const quote = await yahooFinance.quote(inv.symbol) as QuoteResult;
          if (quote.regularMarketPrice != null) {
            quotes.set(inv.id, {
              price: quote.regularMarketPrice,
              quoteCurrency: (quote.currency || "USD").toUpperCase(),
              targetCurrency: (inv.currency || "INR").toUpperCase(),
            });
          }
        } catch {
          // Skip symbols that fail
        }
      })
    );

    if (quotes.size === 0) return { updated: 0 };

    // Collect unique forex pairs needed (e.g., "USDINR=X")
    const forexPairs = new Set<string>();
    for (const { quoteCurrency, targetCurrency } of quotes.values()) {
      if (quoteCurrency !== targetCurrency) {
        forexPairs.add(`${quoteCurrency}${targetCurrency}=X`);
      }
    }

    // Fetch exchange rates
    const exchangeRates = new Map<string, number>();
    if (forexPairs.size > 0) {
      await Promise.all(
        [...forexPairs].map(async (pair) => {
          try {
            const fxQuote = await yahooFinance.quote(pair) as QuoteResult;
            if (fxQuote.regularMarketPrice != null) {
              exchangeRates.set(pair, fxQuote.regularMarketPrice);
            }
          } catch {
            // Skip failed forex lookups
          }
        })
      );
    }

    // Apply conversion and update DB
    let updated = 0;
    for (const [id, { price, quoteCurrency, targetCurrency }] of quotes) {
      let convertedPrice = price;

      if (quoteCurrency !== targetCurrency) {
        const pair = `${quoteCurrency}${targetCurrency}=X`;
        const rate = exchangeRates.get(pair);
        if (rate) {
          convertedPrice = Math.round(price * rate * 100) / 100;
        } else {
          // Can't convert — skip this investment
          continue;
        }
      }

      await sql`
        UPDATE investments
        SET current_price = ${convertedPrice}, updated_at = NOW()
        WHERE id = ${id} AND user_id = ${user.id}
      `;
      updated++;
    }

    return { updated };
  } catch {
    return { updated: 0 };
  }
}
