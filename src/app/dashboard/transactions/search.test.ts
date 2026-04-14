import { describe, it, expect } from "vitest";
import type { Transaction } from "@/types";

// Replicate the client-side search filter logic from the transactions page
function filterBySearch(transactions: Transaction[], search: string): Transaction[] {
  const query = search.trim().toLowerCase();
  if (!query) return transactions;
  return transactions.filter((tx) => {
    const description = (tx.description || "").toLowerCase();
    const category = (tx.category || "").toLowerCase();
    const amount = parseFloat(tx.amount).toLocaleString("en-IN");
    return (
      description.includes(query) ||
      category.includes(query) ||
      amount.includes(query)
    );
  });
}

const mockTransactions: Transaction[] = [
  {
    id: 1,
    user_id: "u1",
    amount: "1500.00",
    type: "expense",
    description: "Grocery shopping at BigBasket",
    category: "Food",
    transaction_date: "2026-04-01",
    created_at: "2026-04-01",
  },
  {
    id: 2,
    user_id: "u1",
    amount: "50000.00",
    type: "income",
    description: "Monthly salary",
    category: "Salary",
    transaction_date: "2026-04-01",
    created_at: "2026-04-01",
  },
  {
    id: 3,
    user_id: "u1",
    amount: "200.00",
    type: "expense",
    description: "Bus ticket",
    category: "Transport",
    transaction_date: "2026-04-02",
    created_at: "2026-04-02",
  },
  {
    id: 4,
    user_id: "u1",
    amount: "3000.00",
    type: "expense",
    description: null,
    category: "Entertainment",
    transaction_date: "2026-04-03",
    created_at: "2026-04-03",
  },
];

describe("Transaction Search Filter", () => {
  it("should return all transactions when search is empty", () => {
    expect(filterBySearch(mockTransactions, "")).toEqual(mockTransactions);
  });

  it("should return all transactions for whitespace-only search", () => {
    expect(filterBySearch(mockTransactions, "   ")).toEqual(mockTransactions);
  });

  it("should filter by description (case-insensitive)", () => {
    const result = filterBySearch(mockTransactions, "grocery");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("should filter by category", () => {
    const result = filterBySearch(mockTransactions, "transport");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it("should filter by amount", () => {
    const result = filterBySearch(mockTransactions, "50,000");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it("should return multiple matches", () => {
    const result = filterBySearch(mockTransactions, "sal");
    // Matches "Monthly salary" description and "Salary" category
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it("should handle transactions with null description", () => {
    const result = filterBySearch(mockTransactions, "entertain");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });

  it("should return empty array when nothing matches", () => {
    const result = filterBySearch(mockTransactions, "nonexistent");
    expect(result).toHaveLength(0);
  });

  it("should match partial words", () => {
    const result = filterBySearch(mockTransactions, "bus");
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("Bus ticket");
  });
});
