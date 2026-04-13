// =============================================================================
// Neon Database Client
// =============================================================================
// Serverless PostgreSQL client using @neondatabase/serverless.
// Used for raw SQL queries in server actions.
// =============================================================================

import { neon } from "@neondatabase/serverless";

// Get database connection string from environment
const connectionString = process.env.DATABASE_URL;

// Validate connection string exists
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env.local");
}

// Export the neon SQL client for use in server actions
export const sql = neon(connectionString);