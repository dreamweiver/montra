"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";

interface CurrencySelectorProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  error?: string;
}

export default function CurrencySelector<T extends FieldValues>({
  control,
  name,
  error,
}: CurrencySelectorProps<T>) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">Currency</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className={`h-12 text-base ${error ? "border-red-500 focus:ring-red-500" : ""}`}>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
