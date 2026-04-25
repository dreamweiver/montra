// =============================================================================
// Database Schema (Drizzle ORM)
// =============================================================================
// Defines the database schema using Drizzle ORM.
// Each table is defined using pgTable() and exported for use.
// =============================================================================

import { pgTable, serial, text, numeric, timestamp, uuid, integer, boolean, unique } from "drizzle-orm/pg-core";

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

// =============================================================================
// User Settings Table
// =============================================================================
// Stores per-user preferences (one row per user).
// - default_currency: Preferred currency for new transactions
// - date_format: Preferred date display format
// =============================================================================
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull().unique(),                       // Supabase Auth user ID (one per user)
  first_name: text("first_name"),                                     // User's first name
  last_name: text("last_name"),                                       // User's last name
  date_of_birth: timestamp("date_of_birth"),                          // User's date of birth
  default_currency: text("default_currency").default("INR").notNull(), // Preferred currency code
  date_format: text("date_format").default("dd/MM/yyyy").notNull(),  // Preferred date format
  created_at: timestamp("created_at").defaultNow().notNull(),        // Record creation time
  updated_at: timestamp("updated_at").defaultNow().notNull(),        // Last update time
});

// =============================================================================
// Budgets Table
// =============================================================================
// Stores per-user monthly spending budget (one row per user).
// - monthly_limit: Maximum spending amount for the month
// - currency: Currency for the budget amount
// =============================================================================
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull().unique(),                         // Supabase Auth user ID (one per user)
  monthly_limit: numeric("monthly_limit", { precision: 12, scale: 2 }).notNull(), // Budget cap
  currency: text("currency").default("INR").notNull(),                 // Currency code
  created_at: timestamp("created_at").defaultNow().notNull(),          // Record creation time
  updated_at: timestamp("updated_at").defaultNow().notNull(),          // Last update time
});

// =============================================================================
// Investments Table
// =============================================================================
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull(),
  name: text("name").notNull(),
  symbol: text("symbol"),
  type: text("type").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
  purchase_price: numeric("purchase_price", { precision: 12, scale: 2 }).notNull(),
  current_price: numeric("current_price", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("INR").notNull(),
  purchase_date: timestamp("purchase_date").notNull(),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});