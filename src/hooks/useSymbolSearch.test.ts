import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSymbolSearch } from "@/hooks/useSymbolSearch";

describe("useSymbolSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("returns empty results for short queries", () => {
    const { result } = renderHook(() => useSymbolSearch("A"));

    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("sets isLoading and fetches after debounce", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ results: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useSymbolSearch("GOOG"));

    // isLoading should be true immediately (timer pending, not yet fetched)
    expect(result.current.isLoading).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();

    // Advance timers to fire the debounce
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Flush pending promises
    await act(async () => {});

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/investments/search?q=GOOG",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("returns results after fetch completes", async () => {
    const mockResult = {
      symbol: "GOOGL",
      name: "Alphabet",
      exchange: "NASDAQ",
      quoteType: "EQUITY",
    };
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ results: [mockResult] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useSymbolSearch("GOOG"));

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Flush pending promises
    await act(async () => {});

    expect(result.current.results).toEqual([mockResult]);
    expect(result.current.isLoading).toBe(false);
  });

  it("aborts previous request on query change", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ results: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { rerender } = renderHook(
      ({ query }: { query: string }) => useSymbolSearch(query),
      { initialProps: { query: "AA" } }
    );

    // Rerender with new query before debounce fires — timer for "AA" gets cleared
    rerender({ query: "AAPL" });

    // Now fire the debounce for "AAPL"
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Flush pending promises
    await act(async () => {});

    // Only one fetch call should have been made (for "AAPL")
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/investments/search?q=AAPL",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });
});
