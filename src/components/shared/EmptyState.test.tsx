import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "@/components/shared/EmptyState";

describe("EmptyState", () => {
  it("should render title", () => {
    render(<EmptyState title="No transactions" />);
    expect(screen.getByText("No transactions")).toBeInTheDocument();
  });

  it("should render description when provided", () => {
    render(
      <EmptyState
        title="No data"
        description="Add your first transaction to get started"
      />,
    );
    expect(
      screen.getByText("Add your first transaction to get started"),
    ).toBeInTheDocument();
  });

  it("should not render description when not provided", () => {
    const { container } = render(<EmptyState title="No data" />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(0);
  });

  it("should render action when provided", () => {
    render(
      <EmptyState
        title="No data"
        action={<button>Add Transaction</button>}
      />,
    );
    expect(screen.getByText("Add Transaction")).toBeInTheDocument();
  });

  it("should render children content", () => {
    render(
      <EmptyState title="No data">
        <p>Extra info</p>
      </EmptyState>,
    );
    expect(screen.getByText("Extra info")).toBeInTheDocument();
  });

  it("should render the icon", () => {
    const { container } = render(<EmptyState title="No data" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
