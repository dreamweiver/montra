import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

describe("useMediaQuery", () => {
  let listeners: Map<string, Set<() => void>>;

  beforeEach(() => {
    listeners = new Map();

    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === "(min-width: 768px)",
      addEventListener: (_event: string, callback: () => void) => {
        if (!listeners.has(query)) listeners.set(query, new Set());
        listeners.get(query)!.add(callback);
      },
      removeEventListener: (_event: string, callback: () => void) => {
        listeners.get(query)?.delete(callback);
      },
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return true for matching query", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("should return false for non-matching query", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    expect(result.current).toBe(false);
  });

  it("should update when media query changes", () => {
    let currentMatch = false;
    vi.stubGlobal("matchMedia", (query: string) => ({
      get matches() { return currentMatch; },
      addEventListener: (_event: string, callback: () => void) => {
        if (!listeners.has(query)) listeners.set(query, new Set());
        listeners.get(query)!.add(callback);
      },
      removeEventListener: (_event: string, callback: () => void) => {
        listeners.get(query)?.delete(callback);
      },
    }));

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);

    currentMatch = true;
    act(() => {
      listeners.get("(min-width: 768px)")?.forEach((cb) => cb());
    });
    expect(result.current).toBe(true);
  });

  it("should clean up listener on unmount", () => {
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(listeners.get("(min-width: 768px)")?.size).toBe(1);

    unmount();
    expect(listeners.get("(min-width: 768px)")?.size).toBe(0);
  });
});
