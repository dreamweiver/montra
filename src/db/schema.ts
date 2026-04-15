// =============================================================================
// Database Schema (Drizzle ORM)
// =============================================================================
// Defines the database schema using Drizzle ORM.
// Each table is defined using pgTable() and exported for use.
// =============================================================================

import { pgTable, serial, text, numeric, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";

// =============================================================================
// Categories Table
// =============================================================================
// Stores user-defined transaction categories.
// - user_id: Links to Supabase Auth user
// - type: Either "income" or "expense"
// - name: Category name (unique per user+type)
// - icon: Optional emoji or icon identifier
// =============================================================================
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull(),                              // Supabase Auth user ID
  name: text("name").notNull(),                                     // Category name
  type: text("type").notNull(),                                     // "income" | "expense"
  icon: text("icon"),                                               // Optional emoji/icon
  color: text("color"),                                             // Optional hex color
  created_at: timestamp("created_at").defaultNow().notNull(),       // Record creation time
});

// =============================================================================
// Transactions Table
// =============================================================================
// Stores all income and expense transactions for users.
// - user_id: Links to Supabase Auth user
// - type: Either "income" or "expense"
// - amount: Supports up to 12 digits with 2 decimal places
// - category_id: Links to categories table
// =============================================================================
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull(),                              // Supabase Auth user ID
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // Up to 9,99,99,99,999.99
  type: text("type").notNull(),                                     // "income" | "expense"
  description: text("description"),                                 // Optional description
  category: text("category"),                                       // Legacy: e.g., "Food", "Salary"
  category_id: integer("category_id"),                              // Links to categories table
  currency: text("currency").default("INR").notNull(),              // Currency code
  transaction_date: timestamp("transaction_date").notNull(),        // When transaction occurred
  created_at: timestamp("created_at").defaultNow().notNull(),       // Record creation time
});

// =============================================================================
// Recurring Transactions Table
// =============================================================================
// Stores recurring transaction templates that auto-generate transactions.
// - frequency: How often the transaction recurs (daily/weekly/monthly/yearly)
// - next_date: When the next transaction should be generated
// - is_active: Whether auto-generation is enabled
// =============================================================================
export const recurringTransactions = pgTable("recurring_transactions", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull(),                              // Supabase Auth user ID
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // Transaction amount
  type: text("type").notNull(),                                     // "income" | "expense"
  description: text("description"),                                 // Optional description
  category: text("category"),                                       // Category name
  category_id: integer("category_id"),                              // Links to categories table
  currency: text("currency").default("INR").notNull(),              // Currency code
  frequency: text("frequency").notNull(),                           // "daily" | "weekly" | "monthly" | "yearly"
  start_date: timestamp("start_date").notNull(),                    // When recurrence starts
  end_date: timestamp("end_date"),                                  // Optional end date
  next_date: timestamp("next_date").notNull(),                      // Next generation date
  is_active: boolean("is_active").default(true).notNull(),          // Active flag
  created_at: timestamp("created_at").defaultNow().notNull(),       // Record creation time
});