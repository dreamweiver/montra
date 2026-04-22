import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols");

  if (!symbolsParam || symbolsParam.trim() === "") {
    return NextResponse.json({ prices: {} });
  }

  const symbols = symbolsParam.split(",").map((s) => s.trim()).filter(Boolean);
  const prices: Record<string, number> = {};

  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const quote = await yahooFinance.quote(symbol);
        if (quote.regularMarketPrice != null) {
          prices[symbol] = quote.regularMarketPrice;
        }
      } catch {
        // Skip symbols that fail
      }
    })
  );

  return NextResponse.json({ prices });
}
