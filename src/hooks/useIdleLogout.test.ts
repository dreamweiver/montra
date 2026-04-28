import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIdleLogout } from "@/hooks/useIdleLogout";

describe("useIdleLogout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should call onLogout after timeout", () => {
    const onLogout = vi.fn();
    renderHook(() => useIdleLogout(5000, onLogout));

    expect(onLogout).not.toHaveBeenCalled();
    vi.advanceTimersByTime(5000);
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("should not call onLogout before timeout", () => {
    const onLogout = vi.fn();
    renderHook(() => useIdleLogout(5000, onLogout));

    vi.advanceTimersByTime(4999);
    expect(onLogout).not.toHaveBeenCalled();
  });

  it("should reset timer on mousedown", () => {
    const onLogout = vi.fn();
    renderHook(() => useIdleLogout(5000, onLogout));

    vi.advanceTimersByTime(3000);
    act(() => {
      window.dispatchEvent(new Event("mousedown"));
    });

    vi.advanceTimersByTime(3000);
    expect(onLogout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2000);
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("should reset timer on keydown", () => {
    const onLogout = vi.fn();
    renderHook(() => useIdleLogout(5000, onLogout));

    vi.advanceTimersByTime(4000);
    act(() => {
      window.dispatchEvent(new Event("keydown"));
    });

    vi.advanceTimersByTime(4000);
    expect(onLogout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("should reset timer on touchstart", () => {
    const onLogout = vi.fn();
    renderHook(() => useIdleLogout(5000, onLogout));

    vi.advanceTimersByTime(4000);
    act(() => {
      window.dispatchEvent(new Event("touchstart"));
    });

    vi.advanceTimersByTime(4999);
    expect(onLogout).not.toHaveBeenCalled();
  });

  it("should reset timer on scroll", () => {
    const onLogout = vi.fn();
    renderHook(() => useIdleLogout(5000, onLogout));

    vi.advanceTimersByTime(4000);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    vi.advanceTimersByTime(4999);
    expect(onLogout).not.toHaveBeenCalled();
  });

  it("should clean up event listeners on unmount", () => {
    const onLogout = vi.fn();
    const { unmount } = renderHook(() => useIdleLogout(5000, onLogout));

    unmount();
    vi.advanceTimersByTime(10000);
    expect(onLogout).not.toHaveBeenCalled();
  });
});
