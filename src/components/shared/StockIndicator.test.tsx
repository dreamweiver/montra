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
      { id: 1, name: "Apple", symbol: "AAPL", gain_percentage: 5.2, is_positive: true, currency: "USD", current_price: 180, market_price: null, market_currency: null },
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
      { id: 2, name: "Tesla", symbol: "TSLA", gain_percentage: -3.1, is_positive: false, currency: "USD", current_price: 200, market_price: null, market_currency: null },
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
      { id: 3, name: "SomeStock", symbol: null, gain_percentage: 1.0, is_positive: true, currency: "INR", current_price: 100, market_price: null, market_currency: null },
    ]);

    render(<StockIndicator />);
    await vi.waitFor(() => {
      expect(screen.getByText("SomeStock")).toBeInTheDocument();
    });
  });

  it("navigates to investments on click", async () => {
    mockGetFavouriteStocksStatus.mockResolvedValueOnce([
      { id: 1, name: "Apple", symbol: "AAPL", gain_percentage: 2.0, is_positive: true, currency: "USD", current_price: 180, market_price: null, market_currency: null },
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
      { id: 1, name: "Apple", symbol: "AAPL", gain_percentage: 2.0, is_positive: true, currency: "USD", current_price: 180, market_price: null, market_currency: null },
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
      { id: 1, name: "Apple", symbol: "AAPL", gain_percentage: 2.0, is_positive: true, currency: "USD", current_price: 180, market_price: null, market_currency: null },
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

  it("renders native price when market_price and market_currency are present", async () => {
    mockGetFavouriteStocksStatus.mockResolvedValueOnce([
      {
        id: 1,
        name: "SAP",
        symbol: "SAP.DE",
        gain_percentage: 4.0,
        is_positive: true,
        currency: "INR",
        current_price: 27500,
        market_price: 312.45,
        market_currency: "EUR",
      },
    ]);

    render(<StockIndicator />);
    await vi.waitFor(() => {
      expect(screen.getByText("SAP.DE")).toBeInTheDocument();
    });
    // Intl.NumberFormat output for EUR varies by locale (en: "€312.45", de: "312,45 €").
    // Assert both the amount and the symbol appear in the same span.
    const native = screen.getByText((_, el) => {
      if (el?.tagName !== "SPAN") return false;
      const text = el?.textContent || "";
      return /312[.,]45/.test(text) && text.includes("€");
    });
    expect(native).toBeInTheDocument();
  });

  it("renders native price even when market currency matches display currency", async () => {
    mockGetFavouriteStocksStatus.mockResolvedValueOnce([
      {
        id: 1,
        name: "Reliance",
        symbol: "RELIANCE.NS",
        gain_percentage: 1.5,
        is_positive: true,
        currency: "INR",
        current_price: 2500,
        market_price: 2500,
        market_currency: "INR",
      },
    ]);

    render(<StockIndicator />);
    await vi.waitFor(() => {
      expect(screen.getByText("RELIANCE.NS")).toBeInTheDocument();
    });
    const native = screen.getByText((_, el) => {
      if (el?.tagName !== "SPAN") return false;
      const text = el?.textContent || "";
      return /2,?500/.test(text) && text.includes("₹");
    });
    expect(native).toBeInTheDocument();
  });

  it("falls back to current_price + currency when market_price is null", async () => {
    mockGetFavouriteStocksStatus.mockResolvedValueOnce([
      {
        id: 1,
        name: "SAP",
        symbol: "SAP.DE",
        gain_percentage: -28.6,
        is_positive: false,
        currency: "EUR",
        current_price: 143,
        market_price: null,
        market_currency: null,
      },
    ]);

    render(<StockIndicator />);
    await vi.waitFor(() => {
      expect(screen.getByText("SAP.DE")).toBeInTheDocument();
    });
    const fallback = screen.getByText((_, el) => {
      if (el?.tagName !== "SPAN") return false;
      const text = el?.textContent || "";
      return /143/.test(text) && text.includes("€");
    });
    expect(fallback).toBeInTheDocument();
  });

  it("renders price when currency code is unknown to Intl (graceful fallback)", async () => {
    // Yahoo can occasionally return non-standard or unsupported currency codes.
    // The component should fall back to a "<amount> <code>" rendering rather than crashing.
    mockGetFavouriteStocksStatus.mockResolvedValueOnce([
      {
        id: 1,
        name: "Mystery Co",
        symbol: "MYST",
        gain_percentage: 1.0,
        is_positive: true,
        currency: "ZZZ",
        current_price: 99.99,
        market_price: 99.99,
        market_currency: "ZZZ",
      },
    ]);

    render(<StockIndicator />);
    await vi.waitFor(() => {
      expect(screen.getByText("MYST")).toBeInTheDocument();
    });
    // Either Intl successfully rendered "ZZZ 99.99" / "ZZZ99.99" or our fallback
    // produced "99.99 ZZZ" — both contain the amount and the code.
    const priceSpan = screen.getByText((_, el) => {
      if (el?.tagName !== "SPAN") return false;
      const text = el?.textContent || "";
      return /99[.,]99/.test(text) && text.includes("ZZZ");
    });
    expect(priceSpan).toBeInTheDocument();
  });
});
