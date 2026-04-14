import { describe, it, expect } from "vitest";
import { cn, formatCurrency, extractErrorMessage } from "@/lib/utils";

describe("cn (className utility)", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("should merge tailwind classes correctly", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("should handle undefined and null inputs", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("should return empty string for no inputs", () => {
    expect(cn()).toBe("");
  });

  it("should handle array inputs", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });
});

describe("formatCurrency", () => {
  it("should format a number amount", () => {
    const result = formatCurrency(1000);
    expect(result).toContain("1,000");
  });

  it("should format a string amount", () => {
    const result = formatCurrency("2500");
    expect(result).toContain("2,500");
  });

  it("should format zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("should handle large numbers", () => {
    const result = formatCurrency(1000000);
    expect(result).toContain("10,00,000");
  });
});

describe("extractErrorMessage", () => {
  it("should extract message from Error instance", () => {
    expect(extractErrorMessage(new Error("test error"))).toBe("test error");
  });

  it("should return default fallback for non-Error", () => {
    expect(extractErrorMessage("some string")).toBe("An error occurred");
  });

  it("should return custom fallback for non-Error", () => {
    expect(extractErrorMessage(42, "Custom fallback")).toBe("Custom fallback");
  });

  it("should return fallback for null", () => {
    expect(extractErrorMessage(null)).toBe("An error occurred");
  });

  it("should return fallback for undefined", () => {
    expect(extractErrorMessage(undefined)).toBe("An error occurred");
  });
});
