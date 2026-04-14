"use client";

// =============================================================================
// EditRecurringSheet Component
// =============================================================================
// Sheet for editing an existing recurring transaction.
// =============================================================================

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { updateRecurringTransaction } from "@/actions/recurring";
import { getCategories } from "@/actions/categories";
import { recurringTransactionSchema, type RecurringTransactionFormData } from "@/lib/validations";
import { LoadingOverlay } from "@/components/shared";
import { FREQUENCY_OPTIONS } from "@/lib/constants";
import type { Category, RecurringTransaction } from "@/types";

// =============================================================================
// Props
// =============================================================================
interface EditRecurringSheetProps {
  recurring: RecurringTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// =============================================================================
// Main Component
// =============================================================================
export default function EditRecurringSheet({
  recurring,
  open,
  onOpenChange,
  onSuccess,
}: EditRecurringSheetProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    control,
    handleSubmit,
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

  // Populate form when recurring data changes
  useEffect(() => {
    if (recurring) {
      setValue("amount", recurring.amount);
      setValue("type", recurring.type);
      setValue("description", recurring.description || "");
      setValue("category", recurring.category || "");
      setValue("frequency", recurring.frequency);
      setValue("start_date", new Date(recurring.start_date));
      setValue("end_date", recurring.end_date ? new Date(recurring.end_date) : null);
    }
  }, [recurring, setValue]);

  // Fetch categories when type changes
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories(type);
      setCategories(data);
    };
    fetchCategories();
  }, [type]);

  const onSubmit = async (data: RecurringTransactionFormData) => {
    if (!recurring) return;

    setLoading(true);
    try {
      const result = await updateRecurringTransaction(recurring.id, {
        amount: data.amount,
        type: data.type,
        description: data.description,
        category: data.category,
        frequency: data.frequency,
        start_date: data.start_date,
        end_date: data.end_date,
      });

      if (result.success) {
        toast.success("Recurring transaction updated");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto p-6">
        {loading && <LoadingOverlay />}

        <SheetHeader>
          <SheetTitle>Edit Recurring Transaction</SheetTitle>
          <SheetDescription>
            Update the details of this recurring transaction.
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
            <Label htmlFor="edit-amount">Amount</Label>
            <Input
              id="edit-amount"
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
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Textarea
              id="edit-description"
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
            {loading ? "Updating..." : "Update Recurring Transaction"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
