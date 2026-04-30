"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { getFavouriteStocksStatus } from "@/actions/favourites";
import { refreshInvestmentPrices } from "@/actions/refreshPrices";
import type { FavouriteStockStatus } from "@/types";

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
      className="flex items-center gap-3 cursor-pointer"
      onClick={() => router.push("/dashboard/investments")}
    >
      {stocks.map((stock) => (
        <div key={stock.id} className="flex items-center gap-1">
          {stock.is_positive ? (
            <TrendingUp className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-600" />
          )}
          <span className="text-xs font-medium truncate max-w-[60px]">
            {stock.symbol || stock.name}
          </span>
          <span
            className={`text-xs font-semibold ${stock.is_positive ? "text-green-600" : "text-red-600"}`}
          >
            {stock.is_positive ? "+" : ""}
            {stock.gain_percentage.toFixed(1)}%
          </span>
        </div>
      ))}
      <button
        onClick={handleRefresh}
        className="p-0.5 rounded hover:bg-muted transition-colors"
        aria-label="Refresh stock prices"
      >
        <RefreshCw
          className={`h-3 w-3 text-muted-foreground ${refreshing ? "animate-spin" : ""}`}
        />
      </button>
    </div>
  );
}
