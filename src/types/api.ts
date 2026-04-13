// =============================================================================
// API Response Types
// =============================================================================
// Standard response types for server actions and API calls.
// =============================================================================

/**
 * Standard API/Server Action response
 * @template T - Type of data returned on success
 */
export interface ApiResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}
