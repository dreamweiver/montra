"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getUserSettings, updateUserSettings } from "@/actions/settings";
import { SUPPORTED_CURRENCIES, DATE_FORMAT_OPTIONS } from "@/lib/constants";
import { UserSettings } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle, PageLoader } from "@/components/shared";
import { Loader2, Mail, Save, KeyRound } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Preference fields
  const [defaultCurrency, setDefaultCurrency] = useState("INR");
  const [dateFormat, setDateFormat] = useState("dd/MM/yyyy");

  const { resolvedTheme } = useTheme();

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }

      const result = await getUserSettings();
      if (result.success && result.data) {
        setSettings(result.data);
        setFirstName(result.data.first_name || "");
        setLastName(result.data.last_name || "");
        setDateOfBirth(
          result.data.date_of_birth
            ? new Date(result.data.date_of_birth).toISOString().split("T")[0]
            : ""
        );
        setDefaultCurrency(result.data.default_currency);
        setDateFormat(result.data.date_format);
      }

      setLoading(false);
    }

    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("date_of_birth", dateOfBirth);
      formData.append("default_currency", defaultCurrency);
      formData.append("date_format", dateFormat);

      const result = await updateUserSettings(formData);

      if (!result.success) {
        toast.error("Failed to save", { description: result.error });
        return;
      }

      // Update local settings reference for change detection
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              first_name: firstName || null,
              last_name: lastName || null,
              date_of_birth: dateOfBirth || null,
              default_currency: defaultCurrency,
              date_format: dateFormat,
            }
          : prev
      );

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
    (firstName !== (settings.first_name || "") ||
      lastName !== (settings.last_name || "") ||
      dateOfBirth !==
        (settings.date_of_birth
          ? new Date(settings.date_of_birth).toISOString().split("T")[0]
          : "") ||
      defaultCurrency !== settings.default_currency ||
      dateFormat !== settings.date_format);

  if (loading) {
    return <PageLoader className="h-full" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

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
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

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
        </CardContent>
      </Card>

      {/* Save Button */}
      <div>
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

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
