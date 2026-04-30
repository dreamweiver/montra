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
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  default_currency: string;
  date_format: string;
  favourite_stock_ids: string | null;
  created_at: string;
  updated_at: string;
}
