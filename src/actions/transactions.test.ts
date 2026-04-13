import { describe, it, expect, vi, beforeEach } from "vitest";

// =============================================================================
// Mocks
// =============================================================================
const { mockSql, mockGetUser, mockRevalidatePath } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockGetUser: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock("@/db/neon", () => ({
  sql: mockSql,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

import {
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getTransaction,
} from "@/actions/transactions";

// =============================================================================
// Tests
// =============================================================================
describe("Transaction Server Actions", () => {
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
  });

  // ---------------------------------------------------------------------------
  // addTransaction
  // ---------------------------------------------------------------------------
  describe("addTransaction", () => {
    it("should return error if not authenticated", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const formData = new FormData();
      formData.set("amount", "100");
      formData.set("type", "expense");
      formData.set("category", "Food");
      formData.set("transaction_date", "2026-04-10");

      const result = await addTransaction(formData);
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should add transaction successfully", async () => {
      mockSql.mockResolvedValueOnce([]);

      const formData = new FormData();
      formData.set("amount", "250.50");
      formData.set("type", "expense");
      formData.set("description", "Lunch");
      formData.set("category", "Food");
      formData.set("transaction_date", "2026-04-10");

      const result = await addTransaction(formData);
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/transactions");
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Insert failed"));

      const formData = new FormData();
      formData.set("amount", "100");
      formData.set("type", "income");
      formData.set("category", "Salary");
      formData.set("transaction_date", "2026-04-10");

      const result = await addTransaction(formData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Insert failed");
    });
  });

  // ---------------------------------------------------------------------------
  // getTransactions
  // ---------------------------------------------------------------------------
  describe("getTransactions", () => {
    it("should return error if not authenticated", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const result = await getTransactions();
      expect(result).toEqual({ success: false, error: "You must be logged in", data: [] });
    });

    it("should return transactions without filters", async () => {
      const transactions = [
        { id: 1, amount: "100", type: "expense", category: "Food" },
      ];
      mockSql.mockResolvedValueOnce(transactions);
      const result = await getTransactions();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(transactions);
    });

    it("should apply type filter", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await getTransactions({ type: "income" });
      expect(result.success).toBe(true);
    });

    it("should apply date range filter", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await getTransactions({
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-12-31"),
      });
      expect(result.success).toBe(true);
    });

    it("should apply all filters together", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await getTransactions({
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-12-31"),
        type: "expense",
        category: "Food",
      });
      expect(result.success).toBe(true);
    });

    it("should treat type='all' as no type filter", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await getTransactions({ type: "all" });
      expect(result.success).toBe(true);
    });

    it("should treat category='all' as no category filter", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await getTransactions({ category: "all" });
      expect(result.success).toBe(true);
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Query failed"));
      const result = await getTransactions();
      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // deleteTransaction
  // ---------------------------------------------------------------------------
  describe("deleteTransaction", () => {
    it("should return error if not authenticated", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const result = await deleteTransaction(1);
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should delete transaction successfully", async () => {
      mockSql.mockResolvedValueOnce([{ id: 1 }]);
      const result = await deleteTransaction(1);
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/transactions");
    });

    it("should return error if transaction not found", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await deleteTransaction(999);
      expect(result).toEqual({ success: false, error: "Transaction not found" });
    });
  });

  // ---------------------------------------------------------------------------
  // updateTransaction
  // ---------------------------------------------------------------------------
  describe("updateTransaction", () => {
    it("should return error if not authenticated", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const formData = new FormData();
      formData.set("amount", "100");
      formData.set("type", "expense");
      formData.set("category", "Food");
      formData.set("transaction_date", "2026-04-10");

      const result = await updateTransaction(1, formData);
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should update transaction successfully", async () => {
      mockSql.mockResolvedValueOnce([{ id: 1 }]);

      const formData = new FormData();
      formData.set("amount", "300");
      formData.set("type", "expense");
      formData.set("description", "Updated");
      formData.set("category", "Food");
      formData.set("transaction_date", "2026-04-10");

      const result = await updateTransaction(1, formData);
      expect(result).toEqual({ success: true });
    });

    it("should return error if transaction not found", async () => {
      mockSql.mockResolvedValueOnce([]);

      const formData = new FormData();
      formData.set("amount", "100");
      formData.set("type", "expense");
      formData.set("category", "Food");
      formData.set("transaction_date", "2026-04-10");

      const result = await updateTransaction(999, formData);
      expect(result).toEqual({ success: false, error: "Transaction not found" });
    });
  });

  // ---------------------------------------------------------------------------
  // getTransaction
  // ---------------------------------------------------------------------------
  describe("getTransaction", () => {
    it("should return error if not authenticated", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const result = await getTransaction(1);
      expect(result).toEqual({ success: false, error: "You must be logged in", data: null });
    });

    it("should return a single transaction", async () => {
      const tx = { id: 1, amount: "500", type: "income", category: "Salary" };
      mockSql.mockResolvedValueOnce([tx]);
      const result = await getTransaction(1);
      expect(result).toEqual({ success: true, data: tx });
    });

    it("should return error if not found", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await getTransaction(999);
      expect(result).toEqual({ success: false, error: "Transaction not found", data: null });
    });
  });
});
