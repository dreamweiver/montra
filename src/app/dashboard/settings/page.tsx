"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { getUserSettings, updateUserSettings } from "@/actions/settings";
import { SUPPORTED_CURRENCIES, DATE_FORMAT_OPTIONS } from "@/lib/constants";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle, PageLoader } from "@/components/shared";
import { Loader2, Mail, Save, KeyRound } from "lucide-react";
import { useTheme } from "next-themes";
import { settingsSchema, type SettingsFormData } from "@/lib/validations";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const { resolvedTheme } = useTheme();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      defaultCurrency: "INR",
      dateFormat: "dd/MM/yyyy",
    },
  });

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }

      const result = await getUserSettings();
      if (result.success && result.data) {
        reset({
          firstName: result.data.first_name || "",
          lastName: result.data.last_name || "",
          dateOfBirth: result.data.date_of_birth
            ? new Date(result.data.date_of_birth).toISOString().split("T")[0]
            : "",
          defaultCurrency: result.data.default_currency,
          dateFormat: result.data.date_format,
        });
      }

      setLoading(false);
    }

    load();
  }, [reset]);

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("first_name", data.firstName || "");
      formData.append("last_name", data.lastName || "");
      formData.append("date_of_birth", data.dateOfBirth || "");
      formData.append("default_currency", data.defaultCurrency);
      formData.append("date_format", data.dateFormat);

      const result = await updateUserSettings(formData);

      if (!result.success) {
        toast.error("Failed to save", { description: result.error });
        return;
      }

      reset(data);

      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!userEmail) return;

    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      toast.error("Failed to send reset email", { description: error.message });
    } else {
      toast.success("Password reset email sent", { description: "Check your inbox for a reset link." });
    }
  };

  if (loading) {
    return <PageLoader className="h-full" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register("firstName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register("lastName")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                {...register("dateOfBirth")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your default settings for transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Controller
                  name="defaultCurrency"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="currency">
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
                {errors.defaultCurrency && (
                  <p className="text-sm text-red-500">{errors.defaultCurrency.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Controller
                  name="dateFormat"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="date-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DATE_FORMAT_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label} ({f.example})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.dateFormat && (
                  <p className="text-sm text-red-500">{errors.dateFormat.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div>
          <Button
            type="submit"
            disabled={saving || !isDirty}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </form>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="text-sm font-medium">{userEmail}</p>
            </div>
          </div>

          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={handleResetPassword}>
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              A password reset link will be sent to your email
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Display / Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Currently using {resolvedTheme === "dark" ? "dark" : "light"} mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
