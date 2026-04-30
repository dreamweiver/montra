import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { mockGetFavouriteStocksStatus, mockRefreshInvestmentPrices, mockRouterPush } = vi.hoisted(() => ({
  mockGetFavouriteStocksStatus: vi.fn(),
  mockRefreshInvestmentPrices: vi.fn(),
  mockRouterPush: vi.fn(),
}));

vi.mock("@/actions/favourites", () => ({
  getFavouriteStocksStatus: mockGetFavouriteStocksStatus,
}));

vi.mock("@/actions/refreshPrices", () => ({
  refreshInvestmentPrices: mockRefreshInvestmentPrices,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
  usePathname: () => "/dashboard",
}));

import StockIndicator from "@/components/shared/StockIndicator";

describe("StockIndicator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when no favourites", async () => {
    mockGetFavouriteStocksStatus.mockResolvedValueOnce([]);

    const { container } = render(<StockIndicator />);
    await vi.waitFor(() => {
      expect(mockGetFavouriteStocksStatus).toHaveBeenCalled();
    });
    expect(container.innerHTML).toBe("");
  });

  it("renders stocks with positive gain", async () => {
    mockGetFavouriteStocksStatus.mockResolvedValueOnce([
      { id: 1, name: "Apple", symbol: "AAPL", gain_percentage: 5.2, is_positive: true },
    ]);

    render(<StockIndicator />);
    await vi.waitFor(() => {
      expect(screen.getByText("AAPL")).toBeInTheDocument();
    });
    const gainSpan = screen.getByText((_, el) =>
      el?.tagName === "SPAN" && el?.textContent === "+5.2%"
    );
    expect(gainSpan).toBeInTheDocument();
  });

  it("renders stocks with negative gain", async () => {
    mockGetFavouriteStocksStatus.mockResolvedValueOnce([
      { id: 2, name: "Tesla", symbol: "TSLA", gain_percentage: -3.1, is_positive: false },
    ]);

    render(<StockIndicator />);
    await vi.waitFor(() => {
      expect(screen.getByText("TSLA")).toBeInTheDocument();
    });
    const gainSpan = screen.getByText((_, el) =>
      el?.tagName === "SPAN" && el?.textContent === "-3.1%"
    );
    expect(gainSpan).toBeInTheDocument();
  });

  it("uses name when symbol is missing", async () => {
    mockGetFavouriteStocksStatus.mockResolvedValueOnce([
      { id: 3, name: "SomeStock", symbol: null, gain_percentage: 1.0, is_positive: true },
    ]);

    render(<StockIndicator />);
    await vi.waitFor(() => {
      expect(screen.getByText("SomeStock")).toBeInTheDocument();
    });
  });

  it("navigates to investments on click", async () => {
    mockGetFavouriteStocksStatus.mockResolvedValueOnce([
      { id: 1, name: "Apple", symbol: "AAPL", gain_percentage: 2.0, is_positive: true },
    ]);

    render(<StockIndicator />);
    await vi.waitFor(() => {
      expect(screen.getByText("AAPL")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("AAPL"));
    expect(mockRouterPush).toHaveBeenCalledWith("/dashboard/investments");
  });

  it("refreshes on stock-refresh event", async () => {
    mockGetFavouriteStocksStatus.mockResolvedValue([
      { id: 1, name: "Apple", symbol: "AAPL", gain_percentage: 2.0, is_positive: true },
    ]);

    render(<StockIndicator />);
    await vi.waitFor(() => {
      expect(mockGetFavouriteStocksStatus).toHaveBeenCalledTimes(1);
    });

    window.dispatchEvent(new Event("stock-refresh"));
    await vi.waitFor(() => {
      expect(mockGetFavouriteStocksStatus).toHaveBeenCalledTimes(2);
    });
  });

  it("refresh button calls refreshInvestmentPrices", async () => {
    mockGetFavouriteStocksStatus.mockResolvedValue([
      { id: 1, name: "Apple", symbol: "AAPL", gain_percentage: 2.0, is_positive: true },
    ]);
    mockRefreshInvestmentPrices.mockResolvedValue(undefined);

    render(<StockIndicator />);
    await vi.waitFor(() => {
      expect(screen.getByLabelText("Refresh stock prices")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Refresh stock prices"));
    await vi.waitFor(() => {
      expect(mockRefreshInvestmentPrices).toHaveBeenCalled();
    });
  });
});
