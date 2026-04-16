// =============================================================================
// Settings Types
// =============================================================================
// Type definitions for user settings data structures.
// =============================================================================

/**
 * User settings record from database
 */
export interface UserSettings {
  id: number;
  user_id: string;
  default_currency: string;
  date_format: string;
  created_at: string;
  updated_at: string;
}
