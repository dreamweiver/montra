"use client";

// =============================================================================
// AddInvestmentSheet Component
// =============================================================================
// A slide-out sheet component for adding new investments.
// Uses react-hook-form for form state management and zod for validation.
// Includes an animated loading overlay while the investment is being saved.
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
import { addInvestment } from "@/actions/investments";
import { getUserSettings } from "@/actions/settings";
import { investmentSchema, type InvestmentFormData } from "@/lib/validations";
import { INVESTMENT_TYPES, LIVE_FETCH_TYPES, SUPPORTED_CURRENCIES } from "@/lib/constants";
import { LoadingOverlay, CurrencySelector } from "@/components/shared";
import { extractErrorMessage } from "@/lib/utils";

// =============================================================================
// Component Props
// =============================================================================
interface AddInvestmentSheetProps {
  // Callback triggered after successful investment creation (e.g., to refresh list)
  onSuccess?: () => void;
}

// =============================================================================
// Main Component
// =============================================================================
export default function AddInvestmentSheet({ onSuccess }: AddInvestmentSheetProps) {
  // Sheet open/close state
  const [open, setOpen] = useState(false);
  // Loading state for API call
  const [loading, setLoading] = useState(false);

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
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema), // Connect zod schema for validation
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

  // Watch field values for reactive UI updates (e.g., showing/hiding symbol field)
  const type = watch("type");
  const currency = watch("currency");
  const purchaseDate = watch("purchase_date");

  // Load user's default currency preference and set today's date on mount
  useEffect(() => {
    setValue("purchase_date", new Date());
    getUserSettings().then((result) => {
      if (result.success && result.data) {
        setValue("currency", result.data.default_currency);
      }
    });
  }, [setValue]);

  // ---------------------------------------------
  // Form Submit Handler
  // ---------------------------------------------
  // Called after zod validation passes. Sends data to server action.
  // ---------------------------------------------
  const onSubmit = async (data: InvestmentFormData) => {
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

      // Call server action to insert into database
      const result = await addInvestment(formData);

      if (!result.success) {
        toast.error(result.error || "Failed to add investment");
        return;
      }

      // Success: show toast, reset form, close sheet, trigger refresh
      toast.success("Investment added successfully!");
      reset();
      setOpen(false);
      onSuccess?.();

    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      console.error(error);
      toast.error("Failed to add investment", {
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
          Add Investment
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg p-4 md:p-6 overflow-y-auto">
        {/* Loading Overlay */}
        {loading && <LoadingOverlay message="Adding investment" />}

        {/* Sheet Header */}
        <SheetHeader className="mb-4">
          <SheetTitle className="text-2xl">Add New Investment</SheetTitle>
          <SheetDescription>Enter the details of your investment</SheetDescription>
        </SheetHeader>

        {/* ----------------------------------------------------------------- */}
        {/* Investment Form                                                    */}
        {/* handleSubmit wraps onSubmit with zod validation                   */}
        {/* ----------------------------------------------------------------- */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Fieldset disables all inputs while loading */}
          <fieldset disabled={loading} className="space-y-4">

          {/* ----- Investment Name ----- */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">
              Investment Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
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
          {/* Uses Controller for custom Select component integration */}
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
            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-base font-medium">
                Ticker Symbol <span className="text-red-500">*</span>
              </Label>
              <Input
                id="symbol"
                type="text"
                placeholder="e.g. GOOGL, AAPL, BTC-USD"
                {...register("symbol")}
                className={`h-12 text-base ${errors.symbol ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              <p className="text-xs text-muted-foreground">
                Required for live price refresh. Use Yahoo Finance ticker format.
              </p>
              {errors.symbol && (
                <p className="text-sm text-red-500">{errors.symbol.message}</p>
              )}
            </div>
          )}

          {/* ----- Currency Selector ----- */}
          <CurrencySelector control={control} name="currency" error={errors.currency?.message} />

          {/* ----- Quantity Input ----- */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-base font-medium">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
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
            <Label htmlFor="purchase_price" className="text-base font-medium">
              Purchase Price ({SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹"}) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="purchase_price"
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
            <Label htmlFor="current_price" className="text-base font-medium">
              Current Price ({SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹"}) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="current_price"
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
          {/* Uses Controller for Calendar component integration */}
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
            <Label htmlFor="notes" className="text-base font-medium">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this investment (optional)"
              {...register("notes")}
              className="min-h-[60px] text-base"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base mt-2" disabled={loading}>
            Add Investment
          </Button>
          </fieldset>
        </form>
      </SheetContent>
    </Sheet>
  );
}
