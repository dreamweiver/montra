import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// =============================================================================
// Mocks
// =============================================================================
const { mockCheckBudgetStatus, mockRouterPush } = vi.hoisted(() => ({
  mockCheckBudgetStatus: vi.fn(),
  mockRouterPush: vi.fn(),
}));

vi.mock("@/actions/budgets", () => ({
  checkBudgetStatus: mockCheckBudgetStatus,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock("@/lib/utils", () => ({
  formatCurrency: (amount: number, currency: string) => `${currency} ${amount}`,
  cn: (...args: string[]) => args.join(" "),
}));

import BudgetIndicator from "@/components/shared/BudgetIndicator";

// =============================================================================
// Tests
// =============================================================================
describe("BudgetIndicator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render nothing when no budget is set", async () => {
    mockCheckBudgetStatus.mockResolvedValueOnce({
      success: true,
      data: { hasBudget: false, spent: 0, limit: 0, percentage: 0, currency: "INR" },
    });

    const { container } = render(<BudgetIndicator />);
    // Wait for async effect
    await vi.waitFor(() => {
      expect(mockCheckBudgetStatus).toHaveBeenCalled();
    });
    expect(container.innerHTML).toBe("");
  });

  it("should render nothing when API fails", async () => {
    mockCheckBudgetStatus.mockResolvedValueOnce({
      success: false,
      error: "Not logged in",
    });

    const { container } = render(<BudgetIndicator />);
    await vi.waitFor(() => {
      expect(mockCheckBudgetStatus).toHaveBeenCalled();
    });
    expect(container.innerHTML).toBe("");
  });

  it("should render progress bar when budget is set", async () => {
    mockCheckBudgetStatus.mockResolvedValueOnce({
      success: true,
      data: { hasBudget: true, spent: 3000, limit: 10000, percentage: 30, currency: "INR" },
    });

    render(<BudgetIndicator />);
    await vi.waitFor(() => {
      expect(screen.getByText("30%")).toBeInTheDocument();
    });
  });

  it("should show percentage over 100% when budget exceeded", async () => {
    mockCheckBudgetStatus.mockResolvedValueOnce({
      success: true,
      data: { hasBudget: true, spent: 15000, limit: 10000, percentage: 150, currency: "INR" },
    });

    render(<BudgetIndicator />);
    await vi.waitFor(() => {
      expect(screen.getByText("150%")).toBeInTheDocument();
    });
  });
});
