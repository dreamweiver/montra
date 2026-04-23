import { describe, it, expect, vi, beforeEach } from "vitest";

// =============================================================================
// Mocks
// =============================================================================
const { mockSql, mockGetAuthUser, mockRevalidatePath } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockGetAuthUser: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock("@/db/neon", () => ({ sql: mockSql }));
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidatePath }));
vi.mock("@/actions/auth", () => ({ getAuthUser: mockGetAuthUser }));

import {
  getInvestments,
  addInvestment,
  updateInvestment,
  deleteInvestment,
  getInvestmentStats,
  updateInvestmentPrices,
} from "@/actions/investments";

// =============================================================================
// Tests
// =============================================================================
describe("Investment Server Actions", () => {
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthUser.mockResolvedValue(mockUser);
  });

  // ---------------------------------------------------------------------------
  // getInvestments
  // ---------------------------------------------------------------------------
  describe("getInvestments", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await getInvestments();
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should return investments for authenticated user", async () => {
      const investments = [
        { id: 1, user_id: "user-123", name: "Apple Inc.", symbol: "AAPL", type: "stock" },
        { id: 2, user_id: "user-123", name: "Gold ETF", symbol: null, type: "gold" },
      ];
      mockSql.mockResolvedValueOnce(investments);
      const result = await getInvestments();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(investments);
    });

    it("should return empty array when no investments", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await getInvestments();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Connection failed"));
      const result = await getInvestments();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Connection failed");
    });
  });

  // ---------------------------------------------------------------------------
  // addInvestment
  // ---------------------------------------------------------------------------
  describe("addInvestment", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const formData = new FormData();
      formData.set("name", "Apple Inc.");
      formData.set("type", "stock");
      formData.set("quantity", "10");
      formData.set("purchase_price", "150.00");
      formData.set("current_price", "175.00");
      formData.set("currency", "USD");
      formData.set("purchase_date", "2024-01-15");
      const result = await addInvestment(formData);
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should add investment successfully", async () => {
      mockSql.mockResolvedValueOnce([]);
      const formData = new FormData();
      formData.set("name", "Apple Inc.");
      formData.set("symbol", "AAPL");
      formData.set("type", "stock");
      formData.set("quantity", "10");
      formData.set("purchase_price", "150.00");
      formData.set("current_price", "175.00");
      formData.set("currency", "USD");
      formData.set("purchase_date", "2024-01-15");
      formData.set("notes", "Long-term hold");
      const result = await addInvestment(formData);
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/investments");
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Insert failed"));
      const formData = new FormData();
      formData.set("name", "Apple Inc.");
      formData.set("type", "stock");
      formData.set("quantity", "10");
      formData.set("purchase_price", "150.00");
      formData.set("current_price", "175.00");
      formData.set("currency", "USD");
      formData.set("purchase_date", "2024-01-15");
      const result = await addInvestment(formData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Insert failed");
    });
  });

  // ---------------------------------------------------------------------------
  // updateInvestment
  // ---------------------------------------------------------------------------
  describe("updateInvestment", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const formData = new FormData();
      formData.set("name", "Apple Inc.");
      formData.set("type", "stock");
      formData.set("quantity", "10");
      formData.set("purchase_price", "150.00");
      formData.set("current_price", "180.00");
      formData.set("currency", "USD");
      formData.set("purchase_date", "2024-01-15");
      const result = await updateInvestment(1, formData);
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should update investment successfully", async () => {
      mockSql.mockResolvedValueOnce([{ id: 1 }]);
      const formData = new FormData();
      formData.set("name", "Apple Inc. Updated");
      formData.set("symbol", "AAPL");
      formData.set("type", "stock");
      formData.set("quantity", "15");
      formData.set("purchase_price", "150.00");
      formData.set("current_price", "185.00");
      formData.set("currency", "USD");
      formData.set("purchase_date", "2024-01-15");
      formData.set("notes", "Added more shares");
      const result = await updateInvestment(1, formData);
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/investments");
    });

    it("should return error when investment not found (non-owner)", async () => {
      mockSql.mockResolvedValueOnce([]);
      const formData = new FormData();
      formData.set("name", "Apple Inc.");
      formData.set("type", "stock");
      formData.set("quantity", "10");
      formData.set("purchase_price", "150.00");
      formData.set("current_price", "175.00");
      formData.set("currency", "USD");
      formData.set("purchase_date", "2024-01-15");
      const result = await updateInvestment(999, formData);
      expect(result).toEqual({ success: false, error: "Investment not found" });
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Update failed"));
      const formData = new FormData();
      formData.set("name", "Apple Inc.");
      formData.set("type", "stock");
      formData.set("quantity", "10");
      formData.set("purchase_price", "150.00");
      formData.set("current_price", "175.00");
      formData.set("currency", "USD");
      formData.set("purchase_date", "2024-01-15");
      const result = await updateInvestment(1, formData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Update failed");
    });
  });

  // ---------------------------------------------------------------------------
  // deleteInvestment
  // ---------------------------------------------------------------------------
  describe("deleteInvestment", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await deleteInvestment(1);
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should delete investment successfully", async () => {
      mockSql.mockResolvedValueOnce([{ id: 1 }]);
      const result = await deleteInvestment(1);
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/investments");
    });

    it("should return error when investment not found", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await deleteInvestment(999);
      expect(result).toEqual({ success: false, error: "Investment not found" });
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Delete failed"));
      const result = await deleteInvestment(1);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Delete failed");
    });
  });

  // ---------------------------------------------------------------------------
  // getInvestmentStats
  // ---------------------------------------------------------------------------
  describe("getInvestmentStats", () => {
    const zeroStats = {
      totalInvested: 0,
      currentValue: 0,
      totalGainLoss: 0,
      gainPercentage: 0,
      holdingCount: 0,
    };

    it("should return zeros if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await getInvestmentStats();
      expect(result).toEqual(zeroStats);
    });

    it("should return correct aggregates (totalInvested=5000, currentValue=6500, gain=1500, pct=30)", async () => {
      mockSql.mockResolvedValueOnce([
        {
          holding_count: "2",
          total_invested: "5000",
          total_current: "6500",
        },
      ]);
      const result = await getInvestmentStats();
      expect(result).toEqual({
        totalInvested: 5000,
        currentValue: 6500,
        totalGainLoss: 1500,
        gainPercentage: 30,
        holdingCount: 2,
      });
    });

    it("should return zeros when no investments", async () => {
      mockSql.mockResolvedValueOnce([{ holding_count: "0", total_invested: null, total_current: null }]);
      const result = await getInvestmentStats();
      expect(result).toEqual(zeroStats);
    });

    it("should handle negative gains (-2000, -20%)", async () => {
      mockSql.mockResolvedValueOnce([
        {
          holding_count: "3",
          total_invested: "10000",
          total_current: "8000",
        },
      ]);
      const result = await getInvestmentStats();
      expect(result).toEqual({
        totalInvested: 10000,
        currentValue: 8000,
        totalGainLoss: -2000,
        gainPercentage: -20,
        holdingCount: 3,
      });
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Stats query failed"));
      const result = await getInvestmentStats();
      expect(result).toEqual(zeroStats);
    });
  });

  // ---------------------------------------------------------------------------
  // updateInvestmentPrices
  // ---------------------------------------------------------------------------
  describe("updateInvestmentPrices", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await updateInvestmentPrices([{ id: 1, currentPrice: 180 }]);
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should update prices for multiple items", async () => {
      mockSql.mockResolvedValue([]);
      const updates = [
        { id: 1, currentPrice: 180.5 },
        { id: 2, currentPrice: 95.25 },
        { id: 3, currentPrice: 4500 },
      ];
      const result = await updateInvestmentPrices(updates);
      expect(result).toEqual({ success: true });
      expect(mockSql).toHaveBeenCalledTimes(3);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/investments");
    });

    it("should handle empty array without calling sql", async () => {
      const result = await updateInvestmentPrices([]);
      expect(result).toEqual({ success: true });
      expect(mockSql).not.toHaveBeenCalled();
      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Price update failed"));
      const result = await updateInvestmentPrices([{ id: 1, currentPrice: 200 }]);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Price update failed");
    });
  });
});
