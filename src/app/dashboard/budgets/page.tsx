"use client";

import { useEffect, useState } from "react";
import { getBudget, upsertBudget, checkBudgetStatus } from "@/actions/budgets";
import { getUserSettings } from "@/actions/settings";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Target } from "lucide-react";
import type { BudgetStatus } from "@/types";

export default function BudgetsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [savedLimit, setSavedLimit] = useState("");
  const [savedCurrency, setSavedCurrency] = useState("INR");
  const [status, setStatus] = useState<BudgetStatus | null>(null);

  useEffect(() => {
    async function load() {
      const [budgetResult, statusResult, settingsResult] = await Promise.all([
        getBudget(),
        checkBudgetStatus(),
        getUserSettings(),
      ]);

      if (budgetResult.success && budgetResult.data) {
        setMonthlyLimit(budgetResult.data.monthly_limit);
        setCurrency(budgetResult.data.currency);
        setSavedLimit(budgetResult.data.monthly_limit);
        setSavedCurrency(budgetResult.data.currency);
      } else if (settingsResult.success && settingsResult.data) {
        setCurrency(settingsResult.data.default_currency);
        setSavedCurrency(settingsResult.data.default_currency);
      }

      if (statusResult.success && statusResult.data) {
        setStatus(statusResult.data);
      }

      setLoading(false);
    }

    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("monthly_limit", monthlyLimit);
      formData.append("currency", currency);

      const result = await upsertBudget(formData);

      if (!result.success) {
        toast.error("Failed to save", { description: result.error });
        return;
      }

      setSavedLimit(monthlyLimit);
      setSavedCurrency(currency);
      toast.success("Budget saved");

      // Refresh status
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

  const hasChanges = monthlyLimit !== savedLimit || currency !== savedCurrency;

  const getProgressColor = (pct: number) => {
    if (pct >= 100) return "bg-red-500";
    if (pct >= 80) return "bg-orange-500";
    if (pct >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getProgressTextColor = (pct: number) => {
    if (pct >= 100) return "text-red-600";
    if (pct >= 80) return "text-orange-600";
    if (pct >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Budget</h2>
        <p className="text-muted-foreground">Set a monthly spending limit and track your progress</p>
      </div>

      {/* Set Budget */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Budget</CardTitle>
          <CardDescription>Set your overall monthly spending limit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget-amount">Amount</Label>
              <Input
                id="budget-amount"
                type="number"
                step="0.01"
                placeholder="e.g., 50000"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
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
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !monthlyLimit || parseFloat(monthlyLimit) <= 0 || !hasChanges}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Budget
          </Button>
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
                <span className={`font-medium ${getProgressTextColor(status.percentage)}`}>
                  {status.percentage}% used
                </span>
                <span className="text-muted-foreground">
                  {formatCurrency(status.spent, status.currency)} / {formatCurrency(status.limit, status.currency)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(status.percentage)}`}
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
