import { describe, it, expect } from "vitest";
import { computeGains, getTypeLabel, parseInvestmentStats } from "@/lib/investment";
import type { Investment } from "@/types";

const baseInvestment: Investment = {
  id: 1,
  user_id: "user-123",
  name: "Test Stock",
  symbol: "TST",
  type: "stock",
  quantity: "10",
  purchase_price: "100",
  current_price: "150",
  currency: "INR",
  purchase_date: "2024-01-01",
  notes: null,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

describe("computeGains", () => {
  it("should calculate gains for a profitable investment", () => {
    const result = computeGains(baseInvestment);
    expect(result.invested_amount).toBe(1000);
    expect(result.current_value).toBe(1500);
    expect(result.gain_loss).toBe(500);
    expect(result.gain_percentage).toBe(50);
  });

  it("should calculate losses for a losing investment", () => {
    const result = computeGains({ ...baseInvestment, current_price: "80" });
    expect(result.invested_amount).toBe(1000);
    expect(result.current_value).toBe(800);
    expect(result.gain_loss).toBe(-200);
    expect(result.gain_percentage).toBe(-20);
  });

  it("should return zero gain for unchanged price", () => {
    const result = computeGains({ ...baseInvestment, current_price: "100" });
    expect(result.gain_loss).toBe(0);
    expect(result.gain_percentage).toBe(0);
  });

  it("should handle zero purchase price", () => {
    const result = computeGains({ ...baseInvestment, purchase_price: "0" });
    expect(result.invested_amount).toBe(0);
    expect(result.gain_percentage).toBe(0);
  });

  it("should handle decimal quantities", () => {
    const result = computeGains({ ...baseInvestment, quantity: "2.5", purchase_price: "100", current_price: "120" });
    expect(result.invested_amount).toBe(250);
    expect(result.current_value).toBe(300);
    expect(result.gain_loss).toBe(50);
  });

  it("should preserve original investment properties", () => {
    const result = computeGains(baseInvestment);
    expect(result.name).toBe("Test Stock");
    expect(result.symbol).toBe("TST");
    expect(result.type).toBe("stock");
  });
});

describe("getTypeLabel", () => {
  it("should return label for known type", () => {
    expect(getTypeLabel("stock")).toBe("Stock");
    expect(getTypeLabel("mutual_fund")).toBe("Mutual Fund");
    expect(getTypeLabel("fixed_deposit")).toBe("Fixed Deposit");
    expect(getTypeLabel("crypto")).toBe("Crypto");
  });

  it("should return the value itself for unknown type", () => {
    expect(getTypeLabel("unknown_type")).toBe("unknown_type");
  });
});

describe("parseInvestmentStats", () => {
  it("should parse valid stats row", () => {
    const row = { holding_count: "5", total_invested: "10000", total_current: "12000" };
    const result = parseInvestmentStats(row);
    expect(result.holdingCount).toBe(5);
    expect(result.totalInvested).toBe(10000);
    expect(result.currentValue).toBe(12000);
    expect(result.totalGainLoss).toBe(2000);
    expect(result.gainPercentage).toBe(20);
  });

  it("should return zero stats for undefined row", () => {
    const result = parseInvestmentStats(undefined);
    expect(result.holdingCount).toBe(0);
    expect(result.totalInvested).toBe(0);
    expect(result.totalGainLoss).toBe(0);
  });

  it("should return zero stats when holding count is zero", () => {
    const row = { holding_count: "0", total_invested: "0", total_current: "0" };
    const result = parseInvestmentStats(row);
    expect(result.holdingCount).toBe(0);
    expect(result.totalGainLoss).toBe(0);
  });

  it("should return zero stats when total_invested is null", () => {
    const row = { holding_count: "1", total_invested: null, total_current: "100" };
    const result = parseInvestmentStats(row);
    expect(result.holdingCount).toBe(0);
  });

  it("should handle negative gain (loss)", () => {
    const row = { holding_count: "3", total_invested: "5000", total_current: "4000" };
    const result = parseInvestmentStats(row);
    expect(result.totalGainLoss).toBe(-1000);
    expect(result.gainPercentage).toBe(-20);
  });
});
