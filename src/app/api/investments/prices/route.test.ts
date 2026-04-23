import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockQuote } = vi.hoisted(() => ({
  mockQuote: vi.fn(),
}));

vi.mock("yahoo-finance2", () => ({
  default: class {
    quote = mockQuote;
  },
}));

import { GET } from "@/app/api/investments/prices/route";

describe("GET /api/investments/prices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty prices when no symbols provided", async () => {
    const request = new Request("http://localhost:3000/api/investments/prices");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ prices: {} });
  });

  it("should return empty prices when symbols param is empty", async () => {
    const request = new Request("http://localhost:3000/api/investments/prices?symbols=");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ prices: {} });
  });

  it("should return prices for valid symbols", async () => {
    mockQuote.mockResolvedValueOnce({ regularMarketPrice: 185.50 });
    mockQuote.mockResolvedValueOnce({ regularMarketPrice: 64320.00 });

    const request = new Request("http://localhost:3000/api/investments/prices?symbols=AAPL,BTC-USD");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.prices["AAPL"]).toBe(185.50);
    expect(body.prices["BTC-USD"]).toBe(64320.00);
  });

  it("should skip symbols that fail and return the rest", async () => {
    mockQuote.mockResolvedValueOnce({ regularMarketPrice: 185.50 });
    mockQuote.mockRejectedValueOnce(new Error("Symbol not found"));

    const request = new Request("http://localhost:3000/api/investments/prices?symbols=AAPL,INVALID");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.prices["AAPL"]).toBe(185.50);
    expect(body.prices["INVALID"]).toBeUndefined();
  });

  it("should skip symbols with null price", async () => {
    mockQuote.mockResolvedValueOnce({ regularMarketPrice: null });

    const request = new Request("http://localhost:3000/api/investments/prices?symbols=BADTICKER");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.prices["BADTICKER"]).toBeUndefined();
  });
});
