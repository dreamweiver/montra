# Investment Page — Design Spec

## Overview

Add an investment tracking page to MonTra that lets users log and monitor their portfolio holdings. The page completes the "Grow wealth" promise in the app's tagline. Users manually enter holdings; the app fetches live prices for supported asset types (stocks, crypto, mutual funds) via Yahoo Finance. A summary card on the main dashboard ties investments into the overall financial picture.

## Asset Types

Seven investment types, stored as a `type` enum:

| Type | Key | Has Symbol/Live Fetch | Icon |
|---|---|---|---|
| Stock | `stock` | Yes | `TrendingUp` |
| Mutual Fund | `mutual_fund` | Yes | `Building2` |
| Fixed Deposit | `fixed_deposit` | No | `Landmark` |
| Gold | `gold` | No | `CircleDollarSign` |
| Crypto | `crypto` | Yes | `Bitcoin` |
| Bond | `bond` | No | `FileText` |
| Real Estate | `real_estate` | No | `Home` |

Types without live fetch require the user to manually update `current_price`.

## Data Model

Single `investments` table in PostgreSQL (Neon), defined via Drizzle ORM in `src/db/schema.ts`:

```
investments
  id              serial PK
  user_id         uuid NOT NULL          -- FK to Supabase Auth
  name            text NOT NULL          -- e.g., "Apple Inc.", "Bitcoin"
  symbol          text                   -- e.g., "AAPL", "BTC-USD", "SBIN.NS"
  type            text NOT NULL          -- stock | mutual_fund | fixed_deposit | gold | crypto | bond | real_estate
  quantity        numeric(12,4) NOT NULL -- units/shares held
  purchase_price  numeric(12,2) NOT NULL -- price per unit at purchase
  current_price   numeric(12,2) NOT NULL -- latest price per unit
  currency        text NOT NULL DEFAULT 'INR'
  purchase_date   timestamp NOT NULL
  notes           text
  created_at      timestamp DEFAULT now()
  updated_at      timestamp DEFAULT now()
```

Computed values (not stored):
- `invested_amount` = quantity * purchase_price
- `current_value` = quantity * current_price
- `gain_loss` = current_value - invested_amount
- `gain_percentage` = (gain_loss / invested_amount) * 100

## Page Layout

Route: `/dashboard/investments`

### Stats Cards (top)

Four cards in a responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`), matching the existing `StatsCards` component pattern using Tremor `Card`:

1. **Total Invested** — sum of (quantity * purchase_price) across all holdings. Blue color, `Wallet` icon.
2. **Current Value** — sum of (quantity * current_price). Purple color, `TrendingUp` icon.
3. **Total Gain/Loss** — current_value - invested. Green if positive, red if negative. `ArrowUpDown` icon.
4. **Holdings** — count of investments. Indigo color, `PieChart` icon.

### Action Bar

Below stats, a row with:
- **Add Investment** button (opens Sheet) — left-aligned
- **Refresh Prices** button (fetches live prices for symbol-based holdings) — right-aligned
- **Filter by Type** dropdown — right-aligned, next to refresh

### Holdings Table

A responsive table showing all holdings. On mobile, degrades to a card list.

Desktop columns:
| Name | Type | Qty | Buy Price | Current Price | Invested | Current Value | Gain/Loss | Gain % | Actions |

- `Gain/Loss` and `Gain %` cells use green text for positive, red for negative
- `Type` shown as a badge with the icon and label
- `Actions` column: Edit (pencil icon) and Delete (trash icon) buttons
- Table is sortable by Name, Type, Invested, Current Value, Gain/Loss, Gain %
- Empty state uses the shared `EmptyState` component

Mobile card layout:
- Name and type badge on top
- Key metrics (invested, current value, gain) below
- Edit/Delete as icon buttons

## Add Investment Sheet

Opens from the right (same as `AddTransactionSheet`). Form fields:

1. **Investment Name** — text input, required, max 100 chars
2. **Type** — select dropdown with 7 options
3. **Symbol** — text input, optional, conditionally shown when type is `stock`, `mutual_fund`, or `crypto`
4. **Quantity** — number input, required, > 0
5. **Purchase Price** — number input, required, > 0, per unit
6. **Current Price** — number input, required, > 0, per unit. If symbol is provided and type supports live fetch, this is pre-filled after a lookup
7. **Currency** — `CurrencySelector` component (reuse existing)
8. **Purchase Date** — date picker (reuse existing Calendar/Popover pattern)
9. **Notes** — textarea, optional

Validation via Zod schema. Form state via React Hook Form with `zodResolver`.

## Edit Investment Sheet

Same layout as Add, pre-populated with existing values. Uses the same Zod schema.

## Live Price Fetch

### API Route

`src/app/api/investments/prices/route.ts` — a GET endpoint that:
1. Accepts `?symbols=AAPL,BTC-USD,SBIN.NS` query parameter
2. Uses `yahoo-finance2` npm package to fetch current prices
3. Returns `{ prices: { "AAPL": 185.50, "BTC-USD": 64320.00 } }`
4. Handles errors gracefully — if a symbol fails, it's omitted from the response

### Client-Side Flow

1. On page load, after fetching investments, collect all symbols from holdings that have one
2. Call `/api/investments/prices?symbols=...` with those symbols
3. Update the UI with fresh prices
4. Call `updateInvestmentPrices()` server action to persist the new current_price values to the DB
5. "Refresh Prices" button triggers this same flow manually

### Symbol Conventions

- US stocks: ticker directly, e.g., `AAPL`, `GOOGL`
- Indian stocks: BSE/NSE suffix, e.g., `SBIN.NS`, `RELIANCE.NS`
- Crypto: pair format, e.g., `BTC-USD`, `ETH-USD`
- Mutual funds: fund code or ISIN if supported

## Dashboard Integration

Add an investment summary section to `src/app/dashboard/page.tsx`, below the budget progress bar and above the charts row. Only rendered if the user has at least one investment.

Structure: a single `rounded-lg border bg-card p-4` container (same style as the budget progress section) showing:
- Left: `TrendingUp` icon + "Investments" label
- Center: total current value formatted with currency
- Right: gain percentage badge (green/red)
- Clicking the card navigates to `/dashboard/investments`

Data comes from a new `getInvestmentStats()` server action.

## Server Actions

File: `src/actions/investments.ts`

All follow the existing pattern: `"use server"`, `getAuthUser()` check, raw SQL via `@neondatabase/serverless`, `revalidatePath()`, try/catch with `extractErrorMessage()`.

### `getInvestments()`
Returns all investments for the user, ordered by created_at DESC. Each row includes computed `invested_amount`, `current_value`, `gain_loss`, `gain_percentage`.

### `addInvestment(formData: FormData)`
Inserts a new investment. Extracts fields from FormData. Revalidates `/dashboard/investments`.

### `updateInvestment(id: number, formData: FormData)`
Updates an existing investment. Security: filters by `user_id`. Revalidates `/dashboard/investments`.

### `deleteInvestment(id: number)`
Deletes an investment. Security: filters by `user_id`. Uses `RETURNING id` to verify deletion. Revalidates `/dashboard/investments`.

### `getInvestmentStats()`
Returns aggregated stats for the stats cards and dashboard integration:
```typescript
{
  totalInvested: number;
  currentValue: number;
  totalGainLoss: number;
  gainPercentage: number;
  holdingCount: number;
}
```

### `updateInvestmentPrices(updates: { id: number; currentPrice: number }[])`
Bulk updates `current_price` and `updated_at` for multiple investments. Called after live price fetch. Security: filters by `user_id` on each update.

## Types

File: `src/types/investment.ts`

```typescript
export type InvestmentType =
  | "stock"
  | "mutual_fund"
  | "fixed_deposit"
  | "gold"
  | "crypto"
  | "bond"
  | "real_estate";

export interface Investment {
  id: number;
  user_id: string;
  name: string;
  symbol: string | null;
  type: InvestmentType;
  quantity: string;
  purchase_price: string;
  current_price: string;
  currency: string;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvestmentWithGains extends Investment {
  invested_amount: number;
  current_value: number;
  gain_loss: number;
  gain_percentage: number;
}

export interface InvestmentStats {
  totalInvested: number;
  currentValue: number;
  totalGainLoss: number;
  gainPercentage: number;
  holdingCount: number;
}
```

Re-exported from `src/types/index.ts`.

## Validation

File: `src/lib/validations/investment.ts`

Zod schema for the add/edit form:

```typescript
z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["stock", "mutual_fund", "fixed_deposit", "gold", "crypto", "bond", "real_estate"]),
  symbol: z.string().optional(),
  quantity: z.string().min(1).refine(val => parseFloat(val) > 0),
  purchase_price: z.string().min(1).refine(val => parseFloat(val) > 0),
  current_price: z.string().min(1).refine(val => parseFloat(val) > 0),
  currency: z.string().min(1),
  purchase_date: z.date(),
  notes: z.string().optional(),
})
```

## Constants

Added to `src/lib/constants.ts`:

```typescript
export const INVESTMENT_TYPES = [
  { value: "stock", label: "Stock", icon: "TrendingUp" },
  { value: "mutual_fund", label: "Mutual Fund", icon: "Building2" },
  { value: "fixed_deposit", label: "Fixed Deposit", icon: "Landmark" },
  { value: "gold", label: "Gold", icon: "CircleDollarSign" },
  { value: "crypto", label: "Crypto", icon: "Bitcoin" },
  { value: "bond", label: "Bond", icon: "FileText" },
  { value: "real_estate", label: "Real Estate", icon: "Home" },
] as const;

export const LIVE_FETCH_TYPES = ["stock", "mutual_fund", "crypto"] as const;
```

## Files to Create

| File | Purpose |
|---|---|
| `src/types/investment.ts` | TypeScript interfaces |
| `src/lib/validations/investment.ts` | Zod schema |
| `src/lib/constants.ts` | Add investment type constants (modify existing) |
| `src/db/schema.ts` | Add investments table (modify existing) |
| `src/actions/investments.ts` | Server actions (CRUD + stats + price update) |
| `src/app/api/investments/prices/route.ts` | Live price fetch API route |
| `src/app/dashboard/investments/page.tsx` | Investments page |
| `src/components/features/investments/InvestmentStatsCards.tsx` | Stats cards component |
| `src/components/features/investments/AddInvestmentSheet.tsx` | Add form sheet |
| `src/components/features/investments/EditInvestmentSheet.tsx` | Edit form sheet |
| `src/components/features/investments/index.ts` | Barrel export |

## Files to Modify

| File | Change |
|---|---|
| `src/types/index.ts` | Re-export investment types |
| `src/app/dashboard/layout.tsx` | Set investments sidebar path to `/dashboard/investments` |
| `src/app/dashboard/page.tsx` | Add investment summary card |
| `src/actions/investments.ts` | Contains `getInvestmentStats()` — no changes to `stats.ts` |
| `package.json` | Add `yahoo-finance2` dependency |

## Testing

Unit tests required for all new code, following existing Vitest + React Testing Library patterns in the project.

### Server Action Tests (`src/actions/investments.test.ts`)
- `getInvestments()` — returns investments for authenticated user, returns empty for unauthenticated
- `addInvestment()` — creates investment, validates required fields, rejects unauthenticated
- `updateInvestment()` — updates existing, rejects non-owner, rejects unauthenticated
- `deleteInvestment()` — deletes existing, rejects non-owner, returns error for non-existent
- `getInvestmentStats()` — returns correct aggregates, returns zeros when no investments
- `updateInvestmentPrices()` — bulk updates prices, rejects unauthenticated

### Validation Tests (`src/lib/validations/investment.test.ts`)
- Valid investment data passes
- Missing required fields fail (name, type, quantity, purchase_price, current_price, currency, purchase_date)
- Invalid amounts fail (0, negative, non-numeric)
- Invalid type value fails
- Optional fields (symbol, notes) can be omitted

### Component Tests
- `InvestmentStatsCards.test.tsx` — renders all 4 stat cards with correct values, green/red coloring for gains/losses
- `AddInvestmentSheet.test.tsx` — renders form fields, shows/hides symbol field based on type, validates on submit
- `EditInvestmentSheet.test.tsx` — pre-populates form with existing data, submits updates

### API Route Tests (`src/app/api/investments/prices/route.test.ts`)
- Returns prices for valid symbols
- Handles invalid/missing symbols gracefully
- Returns empty object when no symbols provided

## Out of Scope (V2)

- Buy/sell transaction history per holding
- Portfolio allocation pie chart
- PPF, NPS, and other government schemes
- Automatic dividend tracking
- Goal-based investment tracking
- Currency conversion between different holding currencies
- Import from broker statements
