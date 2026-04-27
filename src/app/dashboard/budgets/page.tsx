"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getBudgetPageData, upsertBudget, checkBudgetStatus } from "@/actions/budgets";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { getBudgetProgressColor, getBudgetTextColor } from "@/lib/budget";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Target } from "lucide-react";
import type { BudgetStatus } from "@/types";
import { PageLoader } from "@/components/shared";
import { budgetSchema, type BudgetFormData } from "@/lib/validations";

export default function BudgetsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<BudgetStatus | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      monthlyLimit: "",
      currency: "INR",
    },
  });

  useEffect(() => {
    async function load() {
      const { budget, status: budgetStatus, defaultCurrency } = await getBudgetPageData();

      if (budget) {
        reset({ monthlyLimit: budget.monthly_limit, currency: budget.currency });
      } else {
        reset({ monthlyLimit: "", currency: defaultCurrency });
      }

      if (budgetStatus.hasBudget) {
        setStatus(budgetStatus);
      }

      setLoading(false);
    }

    load();
  }, [reset]);

  const onSubmit = async (data: BudgetFormData) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("monthly_limit", data.monthlyLimit);
      formData.append("currency", data.currency);

      const result = await upsertBudget(formData);

      if (!result.success) {
        toast.error("Failed to save", { description: result.error });
        return;
      }

      reset(data);
      toast.success("Budget saved");

      const statusResult = await checkBudgetStatus();
      if (statusResult.success && statusResult.data) {
        setStatus(statusResult.data);
      }
    } catch {
      toast.error("Failed to save budget");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader className="h-full" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Budget</h2>
        <p className="text-muted-foreground">Set a monthly spending limit and track your progress</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Budget</CardTitle>
          <CardDescription>Set your overall monthly spending limit</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget-amount">Amount</Label>
                <Input
                  id="budget-amount"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 50000"
                  {...register("monthlyLimit")}
                  className={errors.monthlyLimit ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.monthlyLimit && (
                  <p className="text-sm text-red-500">{errors.monthlyLimit.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget-currency">Currency</Label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="budget-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.symbol} {c.name} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.currency && (
                  <p className="text-sm text-red-500">{errors.currency.message}</p>
                )}
              </div>
            </div>
            <Button
              type="submit"
              disabled={saving || !isDirty}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Budget
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Budget Progress */}
      {status?.hasBudget && (
        <Card>
          <CardHeader>
            <CardTitle>This Month&apos;s Progress</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={`font-medium ${getBudgetTextColor(status.percentage)}`}>
                  {status.percentage}% used
                </span>
                <span className="text-muted-foreground">
                  {formatCurrency(status.spent, status.currency)} / {formatCurrency(status.limit, status.currency)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getBudgetProgressColor(status.percentage)}`}
                  style={{ width: `${Math.min(status.percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="text-xl font-bold">{formatCurrency(status.spent, status.currency)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-xl font-bold">{formatCurrency(status.limit, status.currency)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  {status.spent <= status.limit ? "Remaining" : "Over budget"}
                </p>
                <p className={`text-xl font-bold ${status.spent > status.limit ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(Math.abs(status.limit - status.spent), status.currency)}
                </p>
              </div>
            </div>

            {/* Warning message */}
            {status.percentage >= 100 && (
              <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                <Target className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-600">
                  You&apos;ve exceeded your monthly budget by {formatCurrency(status.spent - status.limit, status.currency)}
                </p>
              </div>
            )}
            {status.percentage >= 80 && status.percentage < 100 && (
              <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950">
                <Target className="h-5 w-5 text-orange-600" />
                <p className="text-sm text-orange-600">
                  You&apos;ve used {status.percentage}% of your budget. Only {formatCurrency(status.limit - status.spent, status.currency)} remaining.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No budget set */}
      {!status?.hasBudget && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No budget set</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Set a monthly budget above to start tracking your spending progress
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
