import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSql, mockGetAuthUser, mockYahooQuote } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockGetAuthUser: vi.fn(),
  mockYahooQuote: vi.fn(),
}));

vi.mock("@/db/neon", () => ({ sql: mockSql }));
vi.mock("@/actions/auth", () => ({ getAuthUser: mockGetAuthUser }));
vi.mock("yahoo-finance2", () => ({
  default: class {
    quote = mockYahooQuote;
  },
}));

import { refreshInvestmentPrices } from "@/actions/refreshPrices";

describe("refreshInvestmentPrices", () => {
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthUser.mockResolvedValue(mockUser);
  });

  it("should return 0 when user is not authenticated", async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const result = await refreshInvestmentPrices();
    expect(result).toEqual({ updated: 0 });
  });

  it("should return 0 when no eligible investments exist", async () => {
    mockSql.mockResolvedValue([]);
    const result = await refreshInvestmentPrices();
    expect(result).toEqual({ updated: 0 });
  });

  it("should skip refresh within cooldown period", async () => {
    mockSql.mockResolvedValue([
      { id: 1, symbol: "AAPL", type: "stock", currency: "USD", updated_at: new Date().toISOString() },
    ]);

    const result = await refreshInvestmentPrices();
    expect(result).toEqual({ updated: 0 });
    expect(mockYahooQuote).not.toHaveBeenCalled();
  });

  it("should fetch and update prices after cooldown", async () => {
    const oldDate = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    mockSql
      .mockResolvedValueOnce([
        { id: 1, symbol: "AAPL", type: "stock", currency: "USD", updated_at: oldDate },
      ])
      .mockResolvedValue([]);

    mockYahooQuote.mockResolvedValue({ regularMarketPrice: 180, currency: "USD" });

    const result = await refreshInvestmentPrices();
    expect(result).toEqual({ updated: 1 });
  });

  it("should convert currency when quote currency differs from investment currency", async () => {
    const oldDate = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    mockSql
      .mockResolvedValueOnce([
        { id: 1, symbol: "AAPL", type: "stock", currency: "INR", updated_at: oldDate },
      ])
      .mockResolvedValue([]);

    mockYahooQuote
      .mockResolvedValueOnce({ regularMarketPrice: 180, currency: "USD" })
      .mockResolvedValueOnce({ regularMarketPrice: 83.5 });

    const result = await refreshInvestmentPrices();
    expect(result).toEqual({ updated: 1 });
    expect(mockYahooQuote).toHaveBeenCalledWith("USDINR=X");
  });

  it("should skip investment when forex lookup fails", async () => {
    const oldDate = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    mockSql
      .mockResolvedValueOnce([
        { id: 1, symbol: "AAPL", type: "stock", currency: "INR", updated_at: oldDate },
      ])
      .mockResolvedValue([]);

    mockYahooQuote
      .mockResolvedValueOnce({ regularMarketPrice: 180, currency: "USD" })
      .mockRejectedValueOnce(new Error("Forex not found"));

    const result = await refreshInvestmentPrices();
    expect(result).toEqual({ updated: 0 });
  });

  it("should handle quote fetch failure gracefully", async () => {
    const oldDate = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    mockSql
      .mockResolvedValueOnce([
        { id: 1, symbol: "INVALID", type: "stock", currency: "USD", updated_at: oldDate },
      ])
      .mockResolvedValue([]);

    mockYahooQuote.mockRejectedValue(new Error("Symbol not found"));

    const result = await refreshInvestmentPrices();
    expect(result).toEqual({ updated: 0 });
  });

  it("should return 0 on unexpected error", async () => {
    mockSql.mockRejectedValue(new Error("DB connection failed"));
    const result = await refreshInvestmentPrices();
    expect(result).toEqual({ updated: 0 });
  });
});
