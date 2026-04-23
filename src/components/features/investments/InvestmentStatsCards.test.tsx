import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/utils", () => ({
  formatCurrency: (amount: number, currency: string) => `${currency} ${amount}`,
  cn: (...args: string[]) => args.join(" "),
}));

import InvestmentStatsCards from "./InvestmentStatsCards";

describe("InvestmentStatsCards", () => {
  it("should render all four stat cards", () => {
    render(
      <InvestmentStatsCards
        totalInvested={50000}
        currentValue={65000}
        totalGainLoss={15000}
        gainPercentage={30}
        holdingCount={5}
        currency="INR"
      />
    );

    expect(screen.getByText("Total Invested")).toBeInTheDocument();
    expect(screen.getByText("Current Value")).toBeInTheDocument();
    expect(screen.getByText("Gain / Loss")).toBeInTheDocument();
    expect(screen.getByText("Holdings")).toBeInTheDocument();
  });

  it("should display formatted amounts", () => {
    render(
      <InvestmentStatsCards
        totalInvested={50000}
        currentValue={65000}
        totalGainLoss={15000}
        gainPercentage={30}
        holdingCount={5}
        currency="INR"
      />
    );

    expect(screen.getByText("INR 50000")).toBeInTheDocument();
    expect(screen.getByText("INR 65000")).toBeInTheDocument();
  });

  it("should display gain with percentage", () => {
    render(
      <InvestmentStatsCards
        totalInvested={50000}
        currentValue={65000}
        totalGainLoss={15000}
        gainPercentage={30}
        holdingCount={5}
        currency="INR"
      />
    );

    expect(screen.getByText(/INR 15000/)).toBeInTheDocument();
    expect(screen.getByText(/30%/)).toBeInTheDocument();
  });

  it("should display holding count", () => {
    render(
      <InvestmentStatsCards
        totalInvested={0}
        currentValue={0}
        totalGainLoss={0}
        gainPercentage={0}
        holdingCount={3}
        currency="INR"
      />
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should use green color for positive gains", () => {
    render(
      <InvestmentStatsCards
        totalInvested={50000}
        currentValue={65000}
        totalGainLoss={15000}
        gainPercentage={30}
        holdingCount={5}
        currency="INR"
      />
    );

    const gainText = screen.getByText(/INR 15000/);
    expect(gainText.className).toContain("text-green");
  });

  it("should use red color for negative gains", () => {
    render(
      <InvestmentStatsCards
        totalInvested={50000}
        currentValue={40000}
        totalGainLoss={-10000}
        gainPercentage={-20}
        holdingCount={5}
        currency="INR"
      />
    );

    const gainText = screen.getByText(/INR -10000/);
    expect(gainText.className).toContain("text-red");
  });
});
