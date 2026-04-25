"use server";

// =============================================================================
// Settings Server Actions
// =============================================================================
// Server-side actions for reading and updating user settings.
// All actions require authentication via Supabase.
// =============================================================================

import { sql } from "@/db/neon";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/actions/auth";
import { UserSettings } from "@/types/settings";
import { extractErrorMessage } from "@/lib/utils";

// Default settings for new users
const DEFAULT_SETTINGS = {
  first_name: null,
  last_name: null,
  date_of_birth: null,
  default_currency: "INR",
  date_format: "dd/MM/yyyy",
};

// =============================================================================
// Get User Settings
// =============================================================================
export async function getUserSettings(): Promise<{ success: boolean; data?: UserSettings; error?: string }> {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const result = await sql`
      SELECT * FROM user_settings WHERE user_id = ${user.id} LIMIT 1
    `;

    if (result.length === 0) {
      // Return defaults if no settings row exists yet
      return {
        success: true,
        data: {
          id: 0,
          user_id: user.id,
          ...DEFAULT_SETTINGS,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserSettings,
      };
    }

    return { success: true, data: result[0] as UserSettings };
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to get settings");
    console.error("Get settings error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Update User Settings
// =============================================================================
export async function updateUserSettings(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const defaultCurrency = formData.get("default_currency") as string;
    const dateFormat = formData.get("date_format") as string;
    const firstName = (formData.get("first_name") as string) || null;
    const lastName = (formData.get("last_name") as string) || null;
    const dateOfBirth = formData.get("date_of_birth") as string;
    const dob = dateOfBirth ? new Date(dateOfBirth) : null;

    // Upsert: insert if not exists, update if exists
    await sql`
      INSERT INTO user_settings (user_id, first_name, last_name, date_of_birth, default_currency, date_format, updated_at)
      VALUES (${user.id}, ${firstName}, ${lastName}, ${dob}, ${defaultCurrency}, ${dateFormat}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        first_name = ${firstName},
        last_name = ${lastName},
        date_of_birth = ${dob},
        default_currency = ${defaultCurrency},
        date_format = ${dateFormat},
        updated_at = NOW()
    `;

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to update settings");
    console.error("Update settings error:", error);
    return { success: false, error: message };
  }
}

// =============================================================================
// Create User Profile (called during registration)
// =============================================================================
export async function createUserProfile(data: {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const dob = new Date(data.dateOfBirth);

    await sql`
      INSERT INTO user_settings (user_id, first_name, last_name, date_of_birth, updated_at)
      VALUES (${data.userId}, ${data.firstName}, ${data.lastName}, ${dob}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        first_name = ${data.firstName},
        last_name = ${data.lastName},
        date_of_birth = ${dob},
        updated_at = NOW()
    `;

    return { success: true };
  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to create profile");
    console.error("Create profile error:", error);
    return { success: false, error: message };
  }
}
