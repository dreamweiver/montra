"use client";

// =============================================================================
// EditInvestmentSheet Component
// =============================================================================
// A slide-out sheet component for editing existing investments.
// Uses react-hook-form for form state management and zod for validation.
// Pre-populates form with existing investment data.
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
import { updateInvestment } from "@/actions/investments";
import { investmentSchema, type InvestmentFormData } from "@/lib/validations";
import { INVESTMENT_TYPES, LIVE_FETCH_TYPES, SUPPORTED_CURRENCIES } from "@/lib/constants";
import { LoadingOverlay, CurrencySelector, SymbolSearch } from "@/components/shared";
import { extractErrorMessage } from "@/lib/utils";
import type { Investment } from "@/types";

// =============================================================================
// Component Props
// =============================================================================
interface EditInvestmentSheetProps {
  /** Investment to edit (null if not editing) */
  investment: Investment | null;
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
export default function EditInvestmentSheet({
  investment,
  open,
  onOpenChange,
  onSuccess,
}: EditInvestmentSheetProps) {
  // Loading state for API call
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------
  // React Hook Form Setup
  // ---------------------------------------------
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: "",
      type: "stock",
      symbol: "",
      quantity: "",
      purchase_price: "",
      current_price: "",
      currency: "INR",
      purchase_date: undefined as unknown as Date,
      notes: "",
    },
  });

  // Watch field values for reactive UI updates
  const type = watch("type");
  const currency = watch("currency");
  const purchaseDate = watch("purchase_date");

  // ---------------------------------------------
  // Populate Form When Investment Changes
  // ---------------------------------------------
  useEffect(() => {
    if (investment) {
      reset({
        name: investment.name,
        type: investment.type,
        symbol: investment.symbol || "",
        quantity: investment.quantity,
        purchase_price: investment.purchase_price,
        current_price: investment.current_price,
        currency: investment.currency || "INR",
        purchase_date: new Date(investment.purchase_date),
        notes: investment.notes || "",
      });
    }
  }, [investment, reset]);

  // ---------------------------------------------
  // Form Submit Handler
  // ---------------------------------------------
  const onSubmit = async (data: InvestmentFormData) => {
    if (!investment) return;

    setLoading(true);

    try {
      // Convert form data to FormData for server action
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("type", data.type);
      formData.append("symbol", data.symbol || "");
      formData.append("quantity", data.quantity);
      formData.append("purchase_price", data.purchase_price);
      formData.append("current_price", data.current_price);
      formData.append("currency", data.currency);
      formData.append("purchase_date", data.purchase_date.toISOString());
      formData.append("notes", data.notes || "");

      const result = await updateInvestment(investment.id, formData);

      if (!result.success) {
        toast.error(result.error || "Failed to update investment");
        return;
      }

      toast.success("Investment updated successfully!");
      onSuccess?.();

    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      console.error(error);
      toast.error("Failed to update investment", {
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
        {loading && <LoadingOverlay message="Updating investment" />}

        {/* Sheet Header */}
        <SheetHeader className="mb-4">
          <SheetTitle className="text-2xl">Edit Investment</SheetTitle>
          <SheetDescription>Update the details of your investment holding</SheetDescription>
        </SheetHeader>

        {/* Investment Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <fieldset disabled={loading} className="space-y-4">

          {/* ----- Investment Name ----- */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-base font-medium">
              Investment Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-name"
              type="text"
              placeholder="e.g. Apple Inc., SBI Bluechip Fund"
              {...register("name")}
              className={`h-12 text-base ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* ----- Type Select ----- */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Type <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={`h-12 text-base ${errors.type ? "border-red-500 focus:ring-red-500" : ""}`}>
                    <SelectValue placeholder="Select investment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_TYPES.map((investmentType) => (
                      <SelectItem key={investmentType.value} value={investmentType.value}>
                        {investmentType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          {/* ----- Symbol (conditional: only for stock, mutual_fund, crypto) ----- */}
          {LIVE_FETCH_TYPES.includes(type) && (
            <SymbolSearch
              control={control}
              name="symbol"
              error={errors.symbol?.message}
              disabled={loading}
            />
          )}

          {/* ----- Currency Selector ----- */}
          <CurrencySelector control={control} name="currency" error={errors.currency?.message} />

          {/* ----- Quantity Input ----- */}
          <div className="space-y-2">
            <Label htmlFor="edit-quantity" className="text-base font-medium">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-quantity"
              type="number"
              step="0.0001"
              placeholder="0.0000"
              {...register("quantity")}
              className={`h-12 text-base ${errors.quantity ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          {/* ----- Purchase Price Input ----- */}
          <div className="space-y-2">
            <Label htmlFor="edit-purchase_price" className="text-base font-medium">
              Purchase Price ({SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹"}) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-purchase_price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("purchase_price")}
              className={`text-lg h-12 ${errors.purchase_price ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.purchase_price && (
              <p className="text-sm text-red-500">{errors.purchase_price.message}</p>
            )}
          </div>

          {/* ----- Current Price Input ----- */}
          <div className="space-y-2">
            <Label htmlFor="edit-current_price" className="text-base font-medium">
              Current Price ({SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹"}) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-current_price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("current_price")}
              className={`text-lg h-12 ${errors.current_price ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.current_price && (
              <p className="text-sm text-red-500">{errors.current_price.message}</p>
            )}
          </div>

          {/* ----- Date Picker ----- */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Purchase Date</Label>
            <Controller
              name="purchase_date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-12 justify-start text-left text-base">
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      {purchaseDate ? format(purchaseDate, "PPP") : "Pick a date"}
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

          {/* ----- Notes (Optional) ----- */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="text-base font-medium">Notes</Label>
            <Textarea
              id="edit-notes"
              placeholder="Any additional notes about this investment (optional)"
              {...register("notes")}
              className="min-h-[60px] text-base"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base mt-2" disabled={loading}>
            Update Investment
          </Button>
          </fieldset>
        </form>
      </SheetContent>
    </Sheet>
  );
}
