import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSearch = vi.hoisted(() => vi.fn());

vi.mock("yahoo-finance2", () => ({
  default: class {
    search = mockSearch;
  },
}));

import { GET } from "./route";

describe("GET /api/investments/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty results when q param is missing", async () => {
    const request = new Request("http://localhost/api/investments/search");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ results: [] });
  });

  it("should return empty results when q is less than 2 chars", async () => {
    const request = new Request("http://localhost/api/investments/search?q=G");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ results: [] });
  });

  it("should return mapped results for valid query", async () => {
    mockSearch.mockResolvedValueOnce({
      quotes: [
        {
          symbol: "GOOG",
          shortname: "Alphabet Inc.",
          exchange: "NMS",
          exchDisp: "NASDAQ",
          quoteType: "EQUITY",
          isYahooFinance: true,
        },
        {
          symbol: "GOOGL",
          shortname: "Alphabet Inc. Class A",
          exchange: "NMS",
          exchDisp: "NASDAQ",
          quoteType: "EQUITY",
          isYahooFinance: true,
        },
      ],
    });

    const request = new Request("http://localhost/api/investments/search?q=GOOG");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.results).toHaveLength(2);
    expect(body.results[0]).toEqual({
      symbol: "GOOG",
      name: "Alphabet Inc.",
      exchange: "NASDAQ",
      quoteType: "EQUITY",
    });
    expect(body.results[1]).toEqual({
      symbol: "GOOGL",
      name: "Alphabet Inc. Class A",
      exchange: "NASDAQ",
      quoteType: "EQUITY",
    });
  });

  it("should filter out non-Yahoo Finance results", async () => {
    mockSearch.mockResolvedValueOnce({
      quotes: [
        {
          symbol: "GOOG",
          shortname: "Alphabet Inc.",
          exchange: "NMS",
          exchDisp: "NASDAQ",
          quoteType: "EQUITY",
          isYahooFinance: false,
        },
        {
          symbol: "GOOGL",
          shortname: "Alphabet Inc. Class A",
          exchange: "NMS",
          exchDisp: "NASDAQ",
          quoteType: "EQUITY",
          isYahooFinance: true,
        },
      ],
    });

    const request = new Request("http://localhost/api/investments/search?q=GOOG");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.results).toHaveLength(1);
    expect(body.results[0].symbol).toBe("GOOGL");
  });

  it("should return empty results when yahoo-finance2 throws an error", async () => {
    mockSearch.mockRejectedValueOnce(new Error("Network error"));

    const request = new Request("http://localhost/api/investments/search?q=GOOG");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ results: [] });
  });
});
