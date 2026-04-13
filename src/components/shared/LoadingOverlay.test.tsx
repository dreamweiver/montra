import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingOverlay from "@/components/shared/LoadingOverlay";

describe("LoadingOverlay", () => {
  it("should render default message", () => {
    render(<LoadingOverlay />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render custom message", () => {
    render(<LoadingOverlay message="Saving transaction..." />);
    expect(screen.getByText("Saving transaction...")).toBeInTheDocument();
  });

  it("should render simple spinner variant", () => {
    const { container } = render(<LoadingOverlay simple />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should render animated variant by default", () => {
    const { container } = render(<LoadingOverlay />);
    const pulse = container.querySelector(".animate-pulse");
    expect(pulse).toBeInTheDocument();
  });

  it("should render bouncing dots in animated variant", () => {
    const { container } = render(<LoadingOverlay />);
    const dots = container.querySelectorAll(".animate-bounce");
    expect(dots).toHaveLength(3);
  });

  it("should not render bouncing dots in simple variant", () => {
    const { container } = render(<LoadingOverlay simple />);
    const dots = container.querySelectorAll(".animate-bounce");
    expect(dots).toHaveLength(0);
  });
});
