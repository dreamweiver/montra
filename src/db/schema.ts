// =============================================================================
// Database Schema (Drizzle ORM)
// =============================================================================
// Defines the database schema using Drizzle ORM.
// Each table is defined using pgTable() and exported for use.
// =============================================================================

import { pgTable, serial, text, numeric, timestamp, uuid } from "drizzle-orm/pg-core";

// =============================================================================
// Transactions Table
// =============================================================================
// Stores all income and expense transactions for users.
// - user_id: Links to Supabase Auth user
// - type: Either "income" or "expense"
// - amount: Supports up to 12 digits with 2 decimal places
// =============================================================================
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull(),                              // Supabase Auth user ID
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // Up to ₹9,99,99,99,999.99
  type: text("type").notNull(),                                     // "income" | "expense"
  description: text("description"),                                 // Optional description
  category: text("category"),                                       // e.g., "Food", "Salary"
  transaction_date: timestamp("transaction_date").notNull(),        // When transaction occurred
  created_at: timestamp("created_at").defaultNow().notNull(),       // Record creation time
});