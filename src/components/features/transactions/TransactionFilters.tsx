"use client";

// =============================================================================
// TransactionFilters Component
// =============================================================================
// Filter controls for transactions: date range, type, category.
// =============================================================================

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, X } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { getCategories } from "@/actions/categories";
import type { Category, TransactionType } from "@/types";

// =============================================================================
// Types
// =============================================================================
export interface TransactionFilters {
  startDate: Date | undefined;
  endDate: Date | undefined;
  type: TransactionType | "all";
  category: string | "all";
}

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

// =============================================================================
// Preset Date Ranges
// =============================================================================
const DATE_PRESETS = [
  { label: "This Month", getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  { label: "Last Month", getValue: () => ({ start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: "Last 3 Months", getValue: () => ({ start: startOfMonth(subMonths(new Date(), 2)), end: new Date() }) },
  { label: "Last 6 Months", getValue: () => ({ start: startOfMonth(subMonths(new Date(), 5)), end: new Date() }) },
];

// =============================================================================
// Main Component
// =============================================================================
export default function TransactionFiltersComponent({
  filters,
  onFiltersChange,
}: TransactionFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // Update a single filter
  const updateFilter = <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Apply date preset
  const applyPreset = (preset: typeof DATE_PRESETS[0]) => {
    const { start, end } = preset.getValue();
    onFiltersChange({ ...filters, startDate: start, endDate: end });
  };

  // Clear all filters
  const clearFilters = () => {
    onFiltersChange({
      startDate: undefined,
      endDate: undefined,
      type: "all",
      category: "all",
    });
  };

  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.type !== "all" ||
    filters.category !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg">
      {/* Date Range Presets */}
      <div className="flex flex-wrap gap-2">
        {DATE_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => applyPreset(preset)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      {/* Start Date */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="min-w-[130px]">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.startDate ? format(filters.startDate, "dd MMM yy") : "From"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.startDate}
            onSelect={(date) => updateFilter("startDate", date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* End Date */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="min-w-[130px]">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.endDate ? format(filters.endDate, "dd MMM yy") : "To"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.endDate}
            onSelect={(date) => updateFilter("endDate", date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className="w-px h-6 bg-border mx-2" />

      {/* Type Filter */}
      <Select
        value={filters.type}
        onValueChange={(value) => updateFilter("type", value as TransactionType | "all")}
      >
        <SelectTrigger className="w-[120px] h-9">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Select
        value={filters.category}
        onValueChange={(value) => updateFilter("category", value)}
      >
        <SelectTrigger className="w-[150px] h-9">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.name}>
              {cat.icon} {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
