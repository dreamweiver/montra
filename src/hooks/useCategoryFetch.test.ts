import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const mockGetCategories = vi.fn();
vi.mock("@/actions/categories", () => ({
  getCategories: (...args: unknown[]) => mockGetCategories(...args),
}));

import { useCategoryFetch } from "@/hooks/useCategoryFetch";

describe("useCategoryFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch categories for given type", async () => {
    const mockCategories = [
      { id: 1, name: "Food", type: "expense" },
      { id: 2, name: "Transport", type: "expense" },
    ];
    mockGetCategories.mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCategoryFetch("expense"));

    await waitFor(() => {
      expect(result.current).toEqual(mockCategories);
    });
    expect(mockGetCategories).toHaveBeenCalledWith("expense");
  });

  it("should call onTypeChange callback after fetching", async () => {
    mockGetCategories.mockResolvedValue([]);
    const onTypeChange = vi.fn();

    renderHook(() => useCategoryFetch("income", onTypeChange));

    await waitFor(() => {
      expect(onTypeChange).toHaveBeenCalledOnce();
    });
  });

  it("should refetch when type changes", async () => {
    const expenseCategories = [{ id: 1, name: "Food", type: "expense" }];
    const incomeCategories = [{ id: 2, name: "Salary", type: "income" }];

    mockGetCategories
      .mockResolvedValueOnce(expenseCategories)
      .mockResolvedValueOnce(incomeCategories);

    const { result, rerender } = renderHook(
      ({ type }) => useCategoryFetch(type),
      { initialProps: { type: "expense" } }
    );

    await waitFor(() => {
      expect(result.current).toEqual(expenseCategories);
    });

    rerender({ type: "income" });

    await waitFor(() => {
      expect(result.current).toEqual(incomeCategories);
    });
    expect(mockGetCategories).toHaveBeenCalledTimes(2);
  });

  it("should return empty array initially", () => {
    mockGetCategories.mockResolvedValue([]);
    const { result } = renderHook(() => useCategoryFetch("expense"));
    expect(result.current).toEqual([]);
  });
});
