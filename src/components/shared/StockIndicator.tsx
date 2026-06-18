"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { getFavouriteStocksStatus } from "@/actions/favourites";
import { refreshInvestmentPrices } from "@/actions/refreshPrices";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";
import type { FavouriteStockStatus } from "@/types";

// Format the native market price using the supported-currencies table when
// available; fall back to a generic Intl currency formatter for codes Yahoo
// can return that we don't list (e.g. KRW, HKD).
function formatNativePrice(price: number, currencyCode: string): string {
  const supported = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  const locale = supported?.locale;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    // Invalid currency code — show the raw number with the code as a suffix.
    return `${price.toFixed(2)} ${currencyCode}`;
  }
}

export default function StockIndicator() {
  const [stocks, setStocks] = useState<FavouriteStockStatus[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const fetchStatus = useCallback(() => {
    getFavouriteStocksStatus().then((data) => {
      setStocks(data);
    });
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [pathname, fetchStatus]);

  useEffect(() => {
    window.addEventListener("stock-refresh", fetchStatus);
    return () => window.removeEventListener("stock-refresh", fetchStatus);
  }, [fetchStatus]);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshing(true);
    await refreshInvestmentPrices();
    await fetchStatus();
    setRefreshing(false);
  };

  if (stocks.length === 0) return null;

  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => router.push("/dashboard/investments")}
    >
      {stocks.map((stock) => {
        // Prefer the native market quote when available (populated by refresh
        // after migration 0008). Otherwise fall back to the stored
        // current_price + holding currency so the user always sees a price.
        const displayPrice = stock.market_price ?? stock.current_price;
        const displayCurrency = stock.market_currency ?? stock.currency;
        return (
          <div
            key={stock.id}
            className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1"
          >
            {stock.is_positive ? (
              <TrendingUp className="h-3.5 w-3.5 text-green-600 shrink-0" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-600 shrink-0" />
            )}
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground truncate max-w-[60px]">
              {stock.symbol || stock.name}
            </span>
            <span className="text-sm font-bold tabular-nums leading-none">
              {formatNativePrice(displayPrice, displayCurrency)}
            </span>
            <span
              className={`text-xs font-semibold tabular-nums ${stock.is_positive ? "text-green-600" : "text-red-600"}`}
            >
              {stock.is_positive ? "+" : ""}
              {stock.gain_percentage.toFixed(1)}%
            </span>
          </div>
        );
      })}
      <button
        onClick={handleRefresh}
        className="p-1 rounded hover:bg-muted transition-colors"
        aria-label="Refresh stock prices"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`}
        />
      </button>
    </div>
  );
}
