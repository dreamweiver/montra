// =============================================================================
// Registration Validation Schema (Zod)
// =============================================================================
// Centralized validation schema for the user registration form.
// =============================================================================

import { z } from "zod";

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .transform((val) => val.trim()),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .transform((val) => val.trim()),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (val) => {
        const dob = new Date(val);
        return !isNaN(dob.getTime()) && calculateAge(dob) >= 18;
      },
      { message: "You must be at least 18 years old" }
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
