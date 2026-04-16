"use client";

// =============================================================================
// AddTransactionSheet Component
// =============================================================================
// A slide-out sheet component for adding new income/expense transactions.
// Uses react-hook-form for form state management and zod for validation.
// Includes an animated loading overlay while the transaction is being saved.
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
import { addTransaction } from "@/actions/transactions";
import { getCategories } from "@/actions/categories";
import { getUserSettings } from "@/actions/settings";
import { transactionSchema, type TransactionFormData } from "@/lib/validations";
import { TRANSACTION_CATEGORIES, SUPPORTED_CURRENCIES } from "@/lib/constants";
import { LoadingOverlay, CurrencySelector } from "@/components/shared";
import type { Category } from "@/types";
import { extractErrorMessage } from "@/lib/utils";

// =============================================================================
// Component Props
// =============================================================================
interface AddTransactionSheetProps {
  // Callback triggered after successful transaction creation (e.g., to refresh list)
  onSuccess?: () => void;
}

// =============================================================================
// Main Component
// =============================================================================
export default function AddTransactionSheet({ onSuccess }: AddTransactionSheetProps) {
  // Sheet open/close state
  const [open, setOpen] = useState(false);
  // Loading state for API call
  const [loading, setLoading] = useState(false);
  // Dynamic categories from database
  const [categories, setCategories] = useState<Category[]>([]);

  // ---------------------------------------------
  // React Hook Form Setup
  // ---------------------------------------------
  // - register: Connects native inputs (Input, Textarea) to form state
  // - control: Required for Controller wrapper (custom components like Select)
  // - handleSubmit: Wraps onSubmit with validation
  // - reset: Clears form to default values
  // - setValue: Programmatically update field values
  // - watch: Subscribe to field value changes for reactive UI
  // - errors: Contains validation error messages per field
  // ---------------------------------------------
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema), // Connect zod schema for validation
    defaultValues: {
      amount: "",
      type: "expense",
      description: "",
      category: "",
      currency: "INR",
      transaction_date: undefined as unknown as Date,
    },
  });

  // Watch field values for reactive UI updates (e.g., button highlighting)
  const type = watch("type");
  const currency = watch("currency");
  const transactionDate = watch("transaction_date");

  // Load user's default currency preference and set today's date on mount
  useEffect(() => {
    setValue("transaction_date", new Date());
    getUserSettings().then((result) => {
      if (result.success && result.data) {
        setValue("currency", result.data.default_currency);
      }
    });
  }, [setValue]);

  // Fetch categories when type changes
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories(type);
      setCategories(data);
      // Reset category selection when type changes
      setValue("category", "");
    };
    fetchCategories();
  }, [type, setValue]);

  // ---------------------------------------------
  // Form Submit Handler
  // ---------------------------------------------
  // Called after zod validation passes. Sends data to server action.
  // ---------------------------------------------
  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true);

    try {
      // Convert form data to FormData for server action
      const formData = new FormData();
      formData.append("amount", data.amount);
      formData.append("type", data.type);
      formData.append("description", data.description || "");
      formData.append("category", data.category);
      formData.append("currency", data.currency);
      formData.append("transaction_date", data.transaction_date.toISOString());

      // Call server action to insert into database
      const result = await addTransaction(formData);

      if (!result.success) {
        toast.error(result.error || "Failed to add transaction");
        return;
      }

      // Success: show toast, reset form, close sheet, trigger refresh
      toast.success("Transaction added successfully!");
      reset();
      setOpen(false);
      onSuccess?.();

    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      console.error(error);
      toast.error("Failed to add transaction", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // Render
  // =============================================================================
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !loading && setOpen(isOpen)}>
      {/* Trigger Button */}
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </SheetTrigger>

      <SheetContent className="sm:max-w-lg p-6 overflow-y-auto">
        {/* Loading Overlay */}
        {loading && <LoadingOverlay message="Adding transaction" />}

        {/* Sheet Header */}
        <SheetHeader className="mb-4">
          <SheetTitle className="text-2xl">Add New Transaction</SheetTitle>
          <SheetDescription>Enter the details of your income or expense</SheetDescription>
        </SheetHeader>

        {/* ----------------------------------------------------------------- */}
        {/* Transaction Form                                                  */}
        {/* handleSubmit wraps onSubmit with zod validation                  */}
        {/* ----------------------------------------------------------------- */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Fieldset disables all inputs while loading */}
          <fieldset disabled={loading} className="space-y-4">
          
          {/* ----- Type Selection (Income/Expense) ----- */}
          {/* Uses setValue to update form state on button click */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Type</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={type === "expense" ? "default" : "outline"}
                className="flex-1 py-4 text-base"
                onClick={() => setValue("type", "expense")}
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={type === "income" ? "default" : "outline"}
                className="flex-1 py-4 text-base"
                onClick={() => setValue("type", "income")}
              >
                Income
              </Button>
            </div>
          </div>

          {/* ----- Currency Selector ----- */}
          <CurrencySelector control={control} name="currency" error={errors.currency?.message} />

          {/* ----- Amount Input ----- */}
          {/* Uses register() for native input binding */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base font-medium">
              Amount ({SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹"}) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
              className={`text-lg h-12 ${errors.amount ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {/* Field-level error message */}
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* ----- Description (Optional) ----- */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="What was this transaction for? (optional)"
              {...register("description")}
              className="min-h-[60px] text-base"
            />
          </div>

          {/* ----- Category Select ----- */}
          {/* Uses Controller for custom Select component integration */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Category <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={`h-12 text-base ${errors.category ? "border-red-500 focus:ring-red-500" : ""}`}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Dynamic categories from database */}
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          <span className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </span>
                        </SelectItem>
                      ))
                    ) : (
                      /* Fallback to hardcoded categories if none in DB */
                      TRANSACTION_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* ----- Date Picker ----- */}
          {/* Uses Controller for Calendar component integration */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Date</Label>
            <Controller
              name="transaction_date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-12 justify-start text-left text-base">
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      {transactionDate ? format(transactionDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base mt-2" disabled={loading}>
            Add Transaction
          </Button>
          </fieldset>
        </form>
      </SheetContent>
    </Sheet>
  );
}