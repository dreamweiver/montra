import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, type Control } from "react-hook-form";
import SymbolSearch from "./SymbolSearch";

// Mock the useSymbolSearch hook
const mockUseSymbolSearch = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/useSymbolSearch", () => ({
  useSymbolSearch: mockUseSymbolSearch,
}));

// Test wrapper that provides react-hook-form context
function TestWrapper({
  defaultValue = "",
  error,
}: {
  defaultValue?: string;
  error?: string;
}) {
  const { control } = useForm({
    defaultValues: { symbol: defaultValue },
  });
  return (
    <SymbolSearch
      control={control as Control<{ symbol: string }>}
      name="symbol"
      error={error}
    />
  );
}

describe("SymbolSearch", () => {
  it("renders input with correct placeholder", () => {
    mockUseSymbolSearch.mockReturnValue({ results: [], isLoading: false });
    render(<TestWrapper />);
    expect(
      screen.getByPlaceholderText("Search by symbol or company name")
    ).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockUseSymbolSearch.mockReturnValue({ results: [], isLoading: true });
    render(<TestWrapper />);

    const input = screen.getByPlaceholderText(
      "Search by symbol or company name"
    );
    fireEvent.change(input, { target: { value: "GOO" } });

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("displays search results", () => {
    mockUseSymbolSearch.mockReturnValue({
      results: [
        {
          symbol: "GOOGL",
          name: "Alphabet Inc.",
          exchange: "NASDAQ",
          quoteType: "EQUITY",
        },
      ],
      isLoading: false,
    });
    render(<TestWrapper />);

    const input = screen.getByPlaceholderText(
      "Search by symbol or company name"
    );
    fireEvent.change(input, { target: { value: "GOO" } });

    expect(screen.getByText("GOOGL")).toBeInTheDocument();
    expect(screen.getByText("Alphabet Inc.")).toBeInTheDocument();
    expect(screen.getByText("NASDAQ")).toBeInTheDocument();
  });

  it("selecting a result updates input", () => {
    mockUseSymbolSearch.mockReturnValue({
      results: [
        {
          symbol: "GOOGL",
          name: "Alphabet Inc.",
          exchange: "NASDAQ",
          quoteType: "EQUITY",
        },
      ],
      isLoading: false,
    });
    render(<TestWrapper />);

    const input = screen.getByPlaceholderText(
      "Search by symbol or company name"
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "GOO" } });
    fireEvent.click(screen.getByText("GOOGL"));

    expect(input.value).toBe("GOOGL");
  });

  it("shows error message", () => {
    mockUseSymbolSearch.mockReturnValue({ results: [], isLoading: false });
    render(<TestWrapper error="Symbol is required" />);

    expect(screen.getByText("Symbol is required")).toBeInTheDocument();
  });
});
