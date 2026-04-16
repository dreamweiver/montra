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

import { getBudget, upsertBudget, checkBudgetStatus } from "@/actions/budgets";

// =============================================================================
// Tests
// =============================================================================
describe("Budget Server Actions", () => {
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthUser.mockResolvedValue(mockUser);
  });

  // ---------------------------------------------------------------------------
  // getBudget
  // ---------------------------------------------------------------------------
  describe("getBudget", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await getBudget();
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should return undefined data if no budget set", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await getBudget();
      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it("should return budget for authenticated user", async () => {
      const budget = { id: 1, user_id: "user-123", monthly_limit: "50000", currency: "INR" };
      mockSql.mockResolvedValueOnce([budget]);
      const result = await getBudget();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(budget);
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Connection failed"));
      const result = await getBudget();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Connection failed");
    });
  });

  // ---------------------------------------------------------------------------
  // upsertBudget
  // ---------------------------------------------------------------------------
  describe("upsertBudget", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const formData = new FormData();
      formData.set("monthly_limit", "50000");
      formData.set("currency", "INR");
      const result = await upsertBudget(formData);
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should reject zero or negative budget", async () => {
      const formData = new FormData();
      formData.set("monthly_limit", "0");
      formData.set("currency", "INR");
      const result = await upsertBudget(formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain("greater than 0");
    });

    it("should reject empty budget amount", async () => {
      const formData = new FormData();
      formData.set("monthly_limit", "");
      formData.set("currency", "INR");
      const result = await upsertBudget(formData);
      expect(result.success).toBe(false);
    });

    it("should upsert budget successfully", async () => {
      mockSql.mockResolvedValueOnce([]);
      const formData = new FormData();
      formData.set("monthly_limit", "50000");
      formData.set("currency", "INR");
      const result = await upsertBudget(formData);
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/budgets");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Insert failed"));
      const formData = new FormData();
      formData.set("monthly_limit", "50000");
      formData.set("currency", "INR");
      const result = await upsertBudget(formData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Insert failed");
    });
  });

  // ---------------------------------------------------------------------------
  // checkBudgetStatus
  // ---------------------------------------------------------------------------
  describe("checkBudgetStatus", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await checkBudgetStatus();
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should return hasBudget false if no budget set", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await checkBudgetStatus();
      expect(result.success).toBe(true);
      expect(result.data?.hasBudget).toBe(false);
    });

    it("should calculate correct percentage when under budget", async () => {
      mockSql.mockResolvedValueOnce([{ id: 1, monthly_limit: "10000", currency: "INR" }]);
      mockSql.mockResolvedValueOnce([{ total: "3000" }]);
      const result = await checkBudgetStatus();
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        hasBudget: true,
        spent: 3000,
        limit: 10000,
        percentage: 30,
        currency: "INR",
      });
    });

    it("should calculate 100%+ when over budget", async () => {
      mockSql.mockResolvedValueOnce([{ id: 1, monthly_limit: "5000", currency: "USD" }]);
      mockSql.mockResolvedValueOnce([{ total: "7500" }]);
      const result = await checkBudgetStatus();
      expect(result.success).toBe(true);
      expect(result.data?.percentage).toBe(150);
      expect(result.data?.spent).toBe(7500);
    });

    it("should handle zero expenses", async () => {
      mockSql.mockResolvedValueOnce([{ id: 1, monthly_limit: "10000", currency: "INR" }]);
      mockSql.mockResolvedValueOnce([{ total: "0" }]);
      const result = await checkBudgetStatus();
      expect(result.success).toBe(true);
      expect(result.data?.percentage).toBe(0);
      expect(result.data?.spent).toBe(0);
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Query failed"));
      const result = await checkBudgetStatus();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Query failed");
    });
  });
});
