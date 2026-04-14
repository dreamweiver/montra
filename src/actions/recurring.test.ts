import { describe, it, expect, vi, beforeEach } from "vitest";

// =============================================================================
// Mocks
// =============================================================================
const { mockSql, mockGetAuthUser, mockRevalidatePath } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockGetAuthUser: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock("@/db/neon", () => ({
  sql: mockSql,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("@/actions/auth", () => ({
  getAuthUser: mockGetAuthUser,
}));

import {
  getRecurringTransactions,
  addRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
  processDueRecurringTransactions,
} from "@/actions/recurring";

// =============================================================================
// Tests
// =============================================================================
describe("Recurring Transaction Server Actions", () => {
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthUser.mockResolvedValue(mockUser);
  });

  // ---------------------------------------------------------------------------
  // getRecurringTransactions
  // ---------------------------------------------------------------------------
  describe("getRecurringTransactions", () => {
    it("should return empty array if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await getRecurringTransactions();
      expect(result).toEqual([]);
    });

    it("should return recurring transactions", async () => {
      const items = [
        { id: 1, amount: "500", type: "expense", frequency: "monthly" },
      ];
      mockSql.mockResolvedValueOnce(items);
      const result = await getRecurringTransactions();
      expect(result).toEqual(items);
    });

    it("should return empty array on error", async () => {
      mockSql.mockRejectedValueOnce(new Error("DB error"));
      const result = await getRecurringTransactions();
      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // addRecurringTransaction
  // ---------------------------------------------------------------------------
  describe("addRecurringTransaction", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await addRecurringTransaction({
        amount: "500",
        type: "expense",
        category: "Rent",
        frequency: "monthly",
        start_date: new Date("2026-04-01"),
      });
      expect(result).toEqual({ success: false, error: "Not authenticated" });
    });

    it("should add recurring transaction successfully", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await addRecurringTransaction({
        amount: "500",
        type: "expense",
        description: "Monthly rent",
        category: "Rent",
        frequency: "monthly",
        start_date: new Date("2026-04-01"),
        end_date: new Date("2027-04-01"),
      });
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/recurring");
    });

    it("should handle null end_date", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await addRecurringTransaction({
        amount: "100",
        type: "income",
        category: "Salary",
        frequency: "monthly",
        start_date: new Date("2026-01-01"),
        end_date: null,
      });
      expect(result).toEqual({ success: true });
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Insert failed"));
      const result = await addRecurringTransaction({
        amount: "500",
        type: "expense",
        category: "Rent",
        frequency: "monthly",
        start_date: new Date("2026-04-01"),
      });
      expect(result.success).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // updateRecurringTransaction
  // ---------------------------------------------------------------------------
  describe("updateRecurringTransaction", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await updateRecurringTransaction(1, {
        amount: "600",
        type: "expense",
        category: "Rent",
        frequency: "monthly",
        start_date: new Date("2026-04-01"),
      });
      expect(result).toEqual({ success: false, error: "Not authenticated" });
    });

    it("should update recurring transaction successfully", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await updateRecurringTransaction(1, {
        amount: "600",
        type: "expense",
        description: "Updated rent",
        category: "Rent",
        frequency: "monthly",
        start_date: new Date("2026-04-01"),
        end_date: new Date("2027-04-01"),
        is_active: true,
      });
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/recurring");
    });
  });

  // ---------------------------------------------------------------------------
  // deleteRecurringTransaction
  // ---------------------------------------------------------------------------
  describe("deleteRecurringTransaction", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await deleteRecurringTransaction(1);
      expect(result).toEqual({ success: false, error: "Not authenticated" });
    });

    it("should delete recurring transaction successfully", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await deleteRecurringTransaction(1);
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/recurring");
    });
  });

  // ---------------------------------------------------------------------------
  // toggleRecurringTransaction
  // ---------------------------------------------------------------------------
  describe("toggleRecurringTransaction", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await toggleRecurringTransaction(1, false);
      expect(result).toEqual({ success: false, error: "Not authenticated" });
    });

    it("should toggle active state", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await toggleRecurringTransaction(1, false);
      expect(result).toEqual({ success: true });
    });

    it("should toggle inactive to active", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await toggleRecurringTransaction(1, true);
      expect(result).toEqual({ success: true });
    });
  });

  // ---------------------------------------------------------------------------
  // processDueRecurringTransactions
  // ---------------------------------------------------------------------------
  describe("processDueRecurringTransactions", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await processDueRecurringTransactions();
      expect(result).toEqual({ success: false, processed: 0 });
    });

    it("should process zero items when none are due", async () => {
      mockSql.mockResolvedValueOnce([]); // no due items
      const result = await processDueRecurringTransactions();
      expect(result).toEqual({ success: true, processed: 0 });
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Query failed"));
      const result = await processDueRecurringTransactions();
      expect(result).toEqual({ success: false, processed: 0 });
    });
  });
});
