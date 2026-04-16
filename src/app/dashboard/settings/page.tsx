"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getUserSettings, updateUserSettings } from "@/actions/settings";
import { SUPPORTED_CURRENCIES, DATE_FORMAT_OPTIONS } from "@/lib/constants";
import { UserSettings } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/shared";
import { Loader2, Mail, Save, KeyRound } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [defaultCurrency, setDefaultCurrency] = useState("INR");
  const [dateFormat, setDateFormat] = useState("dd/MM/yyyy");
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    async function load() {
      // Get user email from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }

      // Get saved settings
      const result = await getUserSettings();
      if (result.success && result.data) {
        setSettings(result.data);
        setDefaultCurrency(result.data.default_currency);
        setDateFormat(result.data.date_format);
      }

      setLoading(false);
    }

    load();
  }, []);

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("default_currency", defaultCurrency);
      formData.append("date_format", dateFormat);

      const result = await updateUserSettings(formData);

      if (!result.success) {
        toast.error("Failed to save", { description: result.error });
        return;
      }

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

  const hasChanges =
    settings &&
    (defaultCurrency !== settings.default_currency || dateFormat !== settings.date_format);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Account / Profile */}
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
              <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
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
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleSavePreferences}
              disabled={saving || !hasChanges}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Preferences
            </Button>
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
