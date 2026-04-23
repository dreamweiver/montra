import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const searchResult = await yahooFinance.search(q, { quotesCount: 8, newsCount: 0 }) as {
      quotes: Array<{
        symbol: string;
        shortname?: string;
        longname?: string;
        exchange?: string;
        exchDisp?: string;
        quoteType?: string;
        isYahooFinance: boolean;
        score?: number;
      }>;
    };

    const results = searchResult.quotes
      .filter((quote) => quote.isYahooFinance === true)
      .map((quote) => ({
        symbol: quote.symbol,
        name: quote.shortname || quote.symbol,
        exchange: quote.exchDisp || quote.exchange,
        quoteType: quote.quoteType,
      }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
