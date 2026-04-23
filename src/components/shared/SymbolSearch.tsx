"use client";

import { useState, useEffect } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { useSymbolSearch } from "@/hooks/useSymbolSearch";

interface SymbolSearchProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  error?: string;
  disabled?: boolean;
}

// Inner component so we can use hooks with field prop
function SymbolSearchInput({
  field,
  error,
  disabled,
}: {
  field: { value: string; onChange: (value: string) => void };
  error?: string;
  disabled?: boolean;
}) {
  const [inputValue, setInputValue] = useState(field.value || "");
  const [open, setOpen] = useState(false);
  const { results, isLoading } = useSymbolSearch(inputValue);

  // Sync field value -> input value (for edit mode pre-population)
  useEffect(() => {
    setInputValue(field.value || "");
  }, [field.value]);

  const showPopover = open && inputValue.length >= 2 && (results.length > 0 || isLoading);

  return (
    <Popover open={showPopover} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Input
          placeholder="Search by symbol or company name"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (inputValue.length >= 2) setOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              setOpen(false);
              if (inputValue.trim()) {
                field.onChange(inputValue.trim());
              }
            }, 200);
          }}
          disabled={disabled}
          className={`h-12 text-base ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          autoComplete="off"
        />
      </PopoverAnchor>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 max-h-[240px] overflow-y-auto"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : results.length === 0 ? (
          <div className="py-3 px-4 text-sm text-muted-foreground">No results found</div>
        ) : (
          <div className="py-1">
            {results.map((result) => (
              <button
                key={result.symbol}
                type="button"
                className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/50 cursor-pointer text-left"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  field.onChange(result.symbol);
                  setInputValue(result.symbol);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold shrink-0">{result.symbol}</span>
                  <span className="text-muted-foreground truncate">{result.name}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">{result.exchange}</span>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default function SymbolSearch<T extends FieldValues>({
  control,
  name,
  error,
  disabled,
}: SymbolSearchProps<T>) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">
        Ticker Symbol <span className="text-red-500">*</span>
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <SymbolSearchInput
            field={{ value: field.value || "", onChange: field.onChange }}
            error={error}
            disabled={disabled}
          />
        )}
      />
      <p className="text-xs text-muted-foreground">Search by symbol or company name</p>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
