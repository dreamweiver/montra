import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

// =============================================================================
// Drizzle Configuration
// =============================================================================
// Configuration for Drizzle ORM migrations and schema management.
// Loads DATABASE_URL from .env.local file.
// =============================================================================

// Force load .env.local
dotenv.config({ path: ".env.local" });

// Validate DATABASE_URL exists
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in .env.local");
}

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;