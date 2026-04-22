"use client";

// =============================================================================
// EditTransactionSheet Component
// =============================================================================
// A slide-out sheet component for editing existing transactions.
// Uses react-hook-form for form state management and zod for validation.
// Pre-populates form with existing transaction data.
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
import { updateTransaction } from "@/actions/transactions";
import { getCategories } from "@/actions/categories";
import { transactionSchema, type TransactionFormData } from "@/lib/validations";
import { TRANSACTION_CATEGORIES, SUPPORTED_CURRENCIES } from "@/lib/constants";
import { LoadingOverlay, CurrencySelector } from "@/components/shared";
import type { Transaction, Category } from "@/types";
import { extractErrorMessage } from "@/lib/utils";

// =============================================================================
// Component Props
// =============================================================================
interface EditTransactionSheetProps {
  /** Transaction to edit (null if not editing) */
  transaction: Transaction | null;
  /** Controlled open state */
  open: boolean;
  /** Controlled open state change handler */
  onOpenChange: (open: boolean) => void;
  /** Callback triggered after successful update */
  onSuccess?: () => void;
}

// =============================================================================
// Main Component
// =============================================================================
export default function EditTransactionSheet({
  transaction,
  open,
  onOpenChange,
  onSuccess,
}: EditTransactionSheetProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // ---------------------------------------------
  // React Hook Form Setup
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
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      type: "expense",
      description: "",
      category: "",
      currency: "INR",
      transaction_date: undefined as unknown as Date,
    },
  });

  // Watch field values for reactive UI updates
  const type = watch("type");
  const currency = watch("currency");
  const transactionDate = watch("transaction_date");

  // Fetch categories when type changes
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories(type);
      setCategories(data);
    };
    fetchCategories();
  }, [type]);

  // ---------------------------------------------
  // Populate Form When Transaction Changes
  // ---------------------------------------------
  useEffect(() => {
    if (transaction) {
      reset({
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description || "",
        category: transaction.category || "",
        currency: transaction.currency || "INR",
        transaction_date: new Date(transaction.transaction_date),
      });
    }
  }, [transaction, reset]);

  // ---------------------------------------------
  // Form Submit Handler
  // ---------------------------------------------
  const onSubmit = async (data: TransactionFormData) => {
    if (!transaction) return;
    
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("amount", data.amount);
      formData.append("type", data.type);
      formData.append("description", data.description || "");
      formData.append("category", data.category);
      formData.append("currency", data.currency);
      formData.append("transaction_date", data.transaction_date.toISOString());

      const result = await updateTransaction(transaction.id, formData);

      if (!result.success) {
        toast.error(result.error || "Failed to update transaction");
        return;
      }

      toast.success("Transaction updated successfully!");
      onSuccess?.();

    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      console.error(error);
      toast.error("Failed to update transaction", {
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
    <Sheet open={open} onOpenChange={(isOpen) => !loading && onOpenChange(isOpen)}>
      <SheetContent className="w-full sm:max-w-lg p-4 md:p-6 overflow-y-auto">
        {/* Loading Overlay */}
        {loading && <LoadingOverlay message="Updating transaction" />}

        {/* Sheet Header */}
        <SheetHeader className="mb-4">
          <SheetTitle className="text-2xl">Edit Transaction</SheetTitle>
          <SheetDescription>Update the details of your transaction</SheetDescription>
        </SheetHeader>

        {/* Transaction Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <fieldset disabled={loading} className="space-y-4">

          {/* Type Selection */}
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

          {/* Currency Selector */}
          <CurrencySelector control={control} name="currency" error={errors.currency?.message} />

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount" className="text-base font-medium">
              Amount ({SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹"}) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
              className={`text-lg h-12 ${errors.amount ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-base font-medium">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="What was this transaction for? (optional)"
              {...register("description")}
              className="min-h-[60px] text-base"
            />
          </div>

          {/* Category Select */}
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

          {/* Date Picker */}
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
            Update Transaction
          </Button>
          </fieldset>
        </form>
      </SheetContent>
    </Sheet>
  );
}
