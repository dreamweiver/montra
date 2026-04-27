import { describe, it, expect } from "vitest";
import { getBudgetProgressColor, getBudgetTextColor, computeBudgetPercentage } from "@/lib/budget";

describe("getBudgetProgressColor", () => {
  it("should return green for percentage below 60", () => {
    expect(getBudgetProgressColor(0)).toBe("bg-green-500");
    expect(getBudgetProgressColor(59)).toBe("bg-green-500");
  });

  it("should return yellow for percentage 60-79", () => {
    expect(getBudgetProgressColor(60)).toBe("bg-yellow-500");
    expect(getBudgetProgressColor(79)).toBe("bg-yellow-500");
  });

  it("should return orange for percentage 80-99", () => {
    expect(getBudgetProgressColor(80)).toBe("bg-orange-500");
    expect(getBudgetProgressColor(99)).toBe("bg-orange-500");
  });

  it("should return red for percentage 100 or above", () => {
    expect(getBudgetProgressColor(100)).toBe("bg-red-500");
    expect(getBudgetProgressColor(150)).toBe("bg-red-500");
  });
});

describe("getBudgetTextColor", () => {
  it("should return green for percentage below 60", () => {
    expect(getBudgetTextColor(0)).toBe("text-green-600");
    expect(getBudgetTextColor(59)).toBe("text-green-600");
  });

  it("should return yellow for percentage 60-79", () => {
    expect(getBudgetTextColor(60)).toBe("text-yellow-600");
    expect(getBudgetTextColor(79)).toBe("text-yellow-600");
  });

  it("should return orange for percentage 80-99", () => {
    expect(getBudgetTextColor(80)).toBe("text-orange-600");
    expect(getBudgetTextColor(99)).toBe("text-orange-600");
  });

  it("should return red for percentage 100 or above", () => {
    expect(getBudgetTextColor(100)).toBe("text-red-600");
    expect(getBudgetTextColor(150)).toBe("text-red-600");
  });
});

describe("computeBudgetPercentage", () => {
  it("should return 0 when limit is 0", () => {
    expect(computeBudgetPercentage(500, 0)).toBe(0);
  });

  it("should return 0 when spent is 0", () => {
    expect(computeBudgetPercentage(0, 1000)).toBe(0);
  });

  it("should return exact percentage for round numbers", () => {
    expect(computeBudgetPercentage(500, 1000)).toBe(50);
    expect(computeBudgetPercentage(1000, 1000)).toBe(100);
  });

  it("should round to nearest integer", () => {
    expect(computeBudgetPercentage(333, 1000)).toBe(33);
    expect(computeBudgetPercentage(667, 1000)).toBe(67);
  });

  it("should return over 100 when overspent", () => {
    expect(computeBudgetPercentage(1500, 1000)).toBe(150);
  });
});
