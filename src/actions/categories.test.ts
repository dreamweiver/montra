import { describe, it, expect, vi, beforeEach } from "vitest";

// =============================================================================
// Mocks — vi.hoisted ensures these exist before vi.mock hoisting
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

// Import after mocks
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
} from "@/actions/categories";

// =============================================================================
// Tests
// =============================================================================
describe("Category Server Actions", () => {
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthUser.mockResolvedValue(mockUser);
  });

  // ---------------------------------------------------------------------------
  // getCategories
  // ---------------------------------------------------------------------------
  describe("getCategories", () => {
    it("should return empty array if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await getCategories();
      expect(result).toEqual([]);
    });

    it("should return categories for authenticated user", async () => {
      const categories = [
        { id: 1, name: "Food", type: "expense" },
        { id: 2, name: "Salary", type: "income" },
      ];
      mockSql.mockResolvedValueOnce(categories);
      const result = await getCategories();
      expect(result).toEqual(categories);
    });

    it("should filter by type when provided", async () => {
      mockSql.mockResolvedValueOnce([{ id: 1, name: "Food", type: "expense" }]);
      const result = await getCategories("expense");
      expect(result).toHaveLength(1);
    });

    it("should return empty array on error", async () => {
      mockSql.mockRejectedValueOnce(new Error("DB error"));
      const result = await getCategories();
      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // addCategory
  // ---------------------------------------------------------------------------
  describe("addCategory", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const formData = new FormData();
      formData.set("name", "Food");
      formData.set("type", "expense");
      const result = await addCategory(formData);
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should add a category successfully", async () => {
      // No duplicate found
      mockSql.mockResolvedValueOnce([]);
      // Insert success
      mockSql.mockResolvedValueOnce([]);

      const formData = new FormData();
      formData.set("name", "Food");
      formData.set("type", "expense");
      formData.set("icon", "🍔");
      formData.set("color", "#ef4444");

      const result = await addCategory(formData);
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/categories");
    });

    it("should reject duplicate category", async () => {
      mockSql.mockResolvedValueOnce([{ id: 1 }]);

      const formData = new FormData();
      formData.set("name", "Food");
      formData.set("type", "expense");

      const result = await addCategory(formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain("already exists");
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Connection failed"));

      const formData = new FormData();
      formData.set("name", "Food");
      formData.set("type", "expense");

      const result = await addCategory(formData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Connection failed");
    });
  });

  // ---------------------------------------------------------------------------
  // updateCategory
  // ---------------------------------------------------------------------------
  describe("updateCategory", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const formData = new FormData();
      formData.set("name", "Food");
      formData.set("icon", "🍔");
      formData.set("color", "#ef4444");
      const result = await updateCategory(1, formData);
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should return error if category not found", async () => {
      mockSql.mockResolvedValueOnce([]);
      const formData = new FormData();
      formData.set("name", "Food");
      formData.set("icon", "🍔");
      formData.set("color", "#ef4444");
      const result = await updateCategory(999, formData);
      expect(result).toEqual({ success: false, error: "Category not found" });
    });

    it("should update category successfully", async () => {
      mockSql.mockResolvedValueOnce([{ id: 1 }]); // ownership check
      mockSql.mockResolvedValueOnce([]); // update

      const formData = new FormData();
      formData.set("name", "Groceries");
      formData.set("icon", "🛒");
      formData.set("color", "#22c55e");

      const result = await updateCategory(1, formData);
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/categories");
    });
  });

  // ---------------------------------------------------------------------------
  // deleteCategory
  // ---------------------------------------------------------------------------
  describe("deleteCategory", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await deleteCategory(1);
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should prevent deleting category in use", async () => {
      mockSql.mockResolvedValueOnce([{ count: 5 }]);
      const result = await deleteCategory(1);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Cannot delete");
    });

    it("should delete category successfully", async () => {
      mockSql.mockResolvedValueOnce([{ count: 0 }]); // not in use
      mockSql.mockResolvedValueOnce([]); // delete

      const result = await deleteCategory(1);
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/categories");
    });
  });

  // ---------------------------------------------------------------------------
  // seedDefaultCategories
  // ---------------------------------------------------------------------------
  describe("seedDefaultCategories", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await seedDefaultCategories();
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should skip seeding if categories already exist", async () => {
      mockSql.mockResolvedValueOnce([{ count: 5 }]);
      const result = await seedDefaultCategories();
      expect(result).toEqual({ success: true, message: "Categories already exist" });
    });

    it("should seed default categories for new user", async () => {
      mockSql.mockResolvedValueOnce([{ count: 0 }]); // no existing
      // 8 expense + 4 income = 12 inserts
      for (let i = 0; i < 12; i++) {
        mockSql.mockResolvedValueOnce([]);
      }

      const result = await seedDefaultCategories();
      expect(result).toEqual({ success: true });
      // 1 check + 12 inserts = 13 SQL calls
      expect(mockSql).toHaveBeenCalledTimes(13);
    });
  });
});
