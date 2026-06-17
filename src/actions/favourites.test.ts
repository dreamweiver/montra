import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSql, mockGetAuthUser } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockGetAuthUser: vi.fn(),
}));

vi.mock("@/db/neon", () => ({ sql: mockSql }));
vi.mock("@/actions/auth", () => ({ getAuthUser: mockGetAuthUser }));

import {
  getFavouriteStockIds,
  toggleFavouriteStock,
  getFavouriteStocksStatus,
} from "@/actions/favourites";

describe("favourites actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getFavouriteStockIds", () => {
    it("returns empty array when not authenticated", async () => {
      mockGetAuthUser.mockResolvedValue(null);
      const result = await getFavouriteStockIds();
      expect(result).toEqual([]);
    });

    it("returns empty array when no settings row", async () => {
      mockGetAuthUser.mockResolvedValue({ id: "u1" });
      mockSql.mockResolvedValue([]);
      const result = await getFavouriteStockIds();
      expect(result).toEqual([]);
    });

    it("returns empty array when favourite_stock_ids is null", async () => {
      mockGetAuthUser.mockResolvedValue({ id: "u1" });
      mockSql.mockResolvedValue([{ favourite_stock_ids: null }]);
      const result = await getFavouriteStockIds();
      expect(result).toEqual([]);
    });

    it("parses valid JSON array", async () => {
      mockGetAuthUser.mockResolvedValue({ id: "u1" });
      mockSql.mockResolvedValue([{ favourite_stock_ids: "[1,2,3]" }]);
      const result = await getFavouriteStockIds();
      expect(result).toEqual([1, 2, 3]);
    });

    it("returns empty array on invalid JSON", async () => {
      mockGetAuthUser.mockResolvedValue({ id: "u1" });
      mockSql.mockResolvedValue([{ favourite_stock_ids: "invalid" }]);
      const result = await getFavouriteStockIds();
      expect(result).toEqual([]);
    });
  });

  describe("toggleFavouriteStock", () => {
    it("returns error when not authenticated", async () => {
      mockGetAuthUser.mockResolvedValue(null);
      const result = await toggleFavouriteStock(1);
      expect(result.success).toBe(false);
      expect(result.error).toBe("You must be logged in");
    });

    it("returns error when investment not found", async () => {
      mockGetAuthUser.mockResolvedValue({ id: "u1" });
      mockSql.mockResolvedValueOnce([]);
      const result = await toggleFavouriteStock(999);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Investment not found");
    });

    it("returns error when investment is not a stock", async () => {
      mockGetAuthUser.mockResolvedValue({ id: "u1" });
      mockSql.mockResolvedValueOnce([{ id: 1, type: "mutual_fund" }]);
      const result = await toggleFavouriteStock(1);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Only stocks can be favourited");
    });

    it("adds stock to favourites", async () => {
      mockGetAuthUser.mockResolvedValue({ id: "u1" });
      mockSql
        .mockResolvedValueOnce([{ id: 1, type: "stock" }])
        .mockResolvedValueOnce([{ favourite_stock_ids: "[2]" }])
        .mockResolvedValueOnce(undefined);

      const result = await toggleFavouriteStock(1);
      expect(result.success).toBe(true);
      expect(result.isFavourite).toBe(true);
    });

    it("removes stock from favourites", async () => {
      mockGetAuthUser.mockResolvedValue({ id: "u1" });
      mockSql
        .mockResolvedValueOnce([{ id: 1, type: "stock" }])
        .mockResolvedValueOnce([{ favourite_stock_ids: "[1,2]" }])
        .mockResolvedValueOnce(undefined);

      const result = await toggleFavouriteStock(1);
      expect(result.success).toBe(true);
      expect(result.isFavourite).toBe(false);
    });

    it("rejects when at max capacity", async () => {
      mockGetAuthUser.mockResolvedValue({ id: "u1" });
      mockSql
        .mockResolvedValueOnce([{ id: 4, type: "stock" }])
        .mockResolvedValueOnce([{ favourite_stock_ids: "[1,2,3]" }]);

      const result = await toggleFavouriteStock(4);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Maximum");
    });
  });

  describe("getFavouriteStocksStatus", () => {
    it("returns empty array when not authenticated", async () => {
      mockGetAuthUser.mockResolvedValue(null);
      const result = await getFavouriteStocksStatus();
      expect(result).toEqual([]);
    });

    it("returns empty array when no favourites set", async () => {
      mockGetAuthUser.mockResolvedValue({ id: "u1" });
      mockSql.mockResolvedValueOnce([{ favourite_stock_ids: null }]);
      const result = await getFavouriteStocksStatus();
      expect(result).toEqual([]);
    });

    it("returns stock status with gain data", async () => {
      mockGetAuthUser.mockResolvedValue({ id: "u1" });
      mockSql
        .mockResolvedValueOnce([{ favourite_stock_ids: "[1]" }])
        .mockResolvedValueOnce([
          {
            id: 1,
            name: "Apple",
            symbol: "AAPL",
            type: "stock",
            quantity: "10",
            purchase_price: "100",
            current_price: "120",
            currency: "USD",
            market_price: null,
            market_currency: null,
            user_id: "u1",
            purchase_date: "2024-01-01",
            notes: null,
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
          },
        ]);

      const result = await getFavouriteStocksStatus();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].symbol).toBe("AAPL");
      expect(result[0].gain_percentage).toBe(20);
      expect(result[0].is_positive).toBe(true);
      expect(result[0].currency).toBe("USD");
      expect(result[0].current_price).toBe(120);
      expect(result[0].market_price).toBeNull();
      expect(result[0].market_currency).toBeNull();
    });

    it("includes native market price and currency when present", async () => {
      mockGetAuthUser.mockResolvedValue({ id: "u1" });
      mockSql
        .mockResolvedValueOnce([{ favourite_stock_ids: "[1]" }])
        .mockResolvedValueOnce([
          {
            id: 1,
            name: "SAP",
            symbol: "SAP.DE",
            type: "stock",
            quantity: "5",
            purchase_price: "20000",
            current_price: "27500",
            currency: "INR",
            market_price: "312.45",
            market_currency: "EUR",
            user_id: "u1",
            purchase_date: "2024-01-01",
            notes: null,
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
          },
        ]);

      const result = await getFavouriteStocksStatus();
      expect(result[0].currency).toBe("INR");
      expect(result[0].market_price).toBe(312.45);
      expect(result[0].market_currency).toBe("EUR");
    });
  });
});
