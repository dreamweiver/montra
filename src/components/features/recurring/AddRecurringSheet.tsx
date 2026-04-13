"use client";

// =============================================================================
// AddRecurringSheet Component
// =============================================================================
// Sheet for creating a new recurring transaction.
// =============================================================================

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { addRecurringTransaction } from "@/actions/recurring";
import { getCategories } from "@/actions/categories";
import { recurringTransactionSchema, type RecurringTransactionFormData } from "@/lib/validations";
import { LoadingOverlay } from "@/components/shared";
import type { Category } from "@/types";

// =============================================================================
// Props
// =============================================================================
interface AddRecurringSheetProps {
  onSuccess?: () => void;
}

// =============================================================================
// Frequency Labels
// =============================================================================
const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

// =============================================================================
// Main Component
// =============================================================================
export default function AddRecurringSheet({ onSuccess }: AddRecurringSheetProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecurringTransactionFormData>({
    resolver: zodResolver(recurringTransactionSchema),
    defaultValues: {
      amount: "",
      type: "expense",
      description: "",
      category: "",
      frequency: "monthly",
      start_date: new Date(),
      end_date: null,
    },
  });

  const type = watch("type");
  const startDate = watch("start_date");
  const endDate = watch("end_date");

  // Fetch categories when type changes
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories(type);
      setCategories(data);
      setValue("category", "");
    };
    fetchCategories();
  }, [type, setValue]);

  const onSubmit = async (data: RecurringTransactionFormData) => {
    setLoading(true);
    try {
      const result = await addRecurringTransaction({
        amount: data.amount,
        type: data.type,
        description: data.description,
        category: data.category,
        frequency: data.frequency,
        start_date: data.start_date,
        end_date: data.end_date,
      });

      if (result.success) {
        toast.success("Recurring transaction created");
        reset();
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to create");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Recurring
        </Button>
      </SheetTrigger>

      <SheetContent className="overflow-y-auto p-6">
        {loading && <LoadingOverlay />}

        <SheetHeader>
          <SheetTitle>New Recurring Transaction</SheetTitle>
          <SheetDescription>
            Set up a transaction that repeats automatically.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
          {/* Type Toggle */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              {(["expense", "income"] as const).map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={type === t ? "default" : "outline"}
                  className={`flex-1 ${type === t
                    ? t === "expense"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                    : ""
                  }`}
                  onClick={() => setValue("type", t)}
                >
                  {t === "expense" ? "Expense" : "Income"}
                </Button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.frequency && (
              <p className="text-sm text-red-500">{errors.frequency.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Monthly rent payment"
              {...register("description")}
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => date && field.onChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          {/* End Date (Optional) */}
          <div className="space-y-2">
            <Label>End Date (Optional)</Label>
            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : "No end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ?? undefined}
                      onSelect={(date) => field.onChange(date || null)}
                      disabled={(date) => date < (startDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {endDate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setValue("end_date", null)}
              >
                Remove end date
              </Button>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Recurring Transaction"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
