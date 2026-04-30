import { describe, it, expect } from "vitest";
import { getMonthRange, toDateString } from "@/lib/date";

describe("getMonthRange", () => {
  it("should return start and end of a given month", () => {
    const { start, end } = getMonthRange(new Date(2024, 5, 15));
    expect(start).toEqual(new Date(2024, 5, 1));
    expect(end).toEqual(new Date(2024, 5, 30, 23, 59, 59));
  });

  it("should handle January correctly", () => {
    const { start, end } = getMonthRange(new Date(2024, 0, 10));
    expect(start).toEqual(new Date(2024, 0, 1));
    expect(end).toEqual(new Date(2024, 0, 31, 23, 59, 59));
  });

  it("should handle February in a leap year", () => {
    const { start, end } = getMonthRange(new Date(2024, 1, 15));
    expect(start).toEqual(new Date(2024, 1, 1));
    expect(end).toEqual(new Date(2024, 1, 29, 23, 59, 59));
  });

  it("should handle December correctly", () => {
    const { start, end } = getMonthRange(new Date(2024, 11, 25));
    expect(start).toEqual(new Date(2024, 11, 1));
    expect(end).toEqual(new Date(2024, 11, 31, 23, 59, 59));
  });

  it("should default to current month when no date is provided", () => {
    const now = new Date();
    const { start } = getMonthRange();
    expect(start.getFullYear()).toBe(now.getFullYear());
    expect(start.getMonth()).toBe(now.getMonth());
    expect(start.getDate()).toBe(1);
  });
});

describe("toDateString", () => {
  it("should format a Date object as YYYY-MM-DDT00:00:00.000Z", () => {
    expect(toDateString(new Date(2026, 3, 15))).toBe("2026-04-15T00:00:00.000Z");
  });

  it("should handle single-digit month and day with zero padding", () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe("2026-01-05T00:00:00.000Z");
  });

  it("should accept a string input", () => {
    expect(toDateString("2026-07-20T14:30:00.000Z")).toBe("2026-07-20T00:00:00.000Z");
  });

  it("should handle end of year", () => {
    expect(toDateString(new Date(2026, 11, 31))).toBe("2026-12-31T00:00:00.000Z");
  });
});
