# Investment Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full investment tracking page to MonTra with CRUD operations, live price fetch via Yahoo Finance, stats cards, and dashboard integration.

**Architecture:** Flat `investments` table with manual entry + optional live price fetch for stocks/crypto/mutual funds. Page follows existing patterns: stats cards → action bar → holdings table. Server actions use raw SQL via `@neondatabase/serverless` with Supabase auth. All forms use react-hook-form + Zod validation + Sheet components.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Tremor, Neon PostgreSQL, Drizzle ORM, yahoo-finance2, Vitest, React Testing Library

---

## File Structure

**New files:**
| File | Responsibility |
|---|---|
| `src/types/investment.ts` | TypeScript interfaces for Investment, InvestmentWithGains, InvestmentStats, InvestmentType |
| `src/lib/validations/investment.ts` | Zod schema for add/edit form |
| `src/actions/investments.ts` | Server actions: CRUD + stats + bulk price update |
| `src/app/api/investments/prices/route.ts` | Next.js API route for Yahoo Finance live price fetch |
| `src/app/dashboard/investments/page.tsx` | Main investments page |
| `src/components/features/investments/InvestmentStatsCards.tsx` | Four stats cards component |
| `src/components/features/investments/AddInvestmentSheet.tsx` | Add investment form sheet |
| `src/components/features/investments/EditInvestmentSheet.tsx` | Edit investment form sheet |
| `src/components/features/investments/index.ts` | Barrel export |
| `src/actions/investments.test.ts` | Server action unit tests |
| `src/lib/validations/investment.test.ts` | Validation schema tests |
| `src/components/features/investments/InvestmentStatsCards.test.tsx` | Stats cards component tests |
| `src/app/api/investments/prices/route.test.ts` | API route tests |

**Modified files:**
| File | Change |
|---|---|
| `src/db/schema.ts` | Add `investments` table definition |
| `src/types/index.ts` | Re-export investment types |
| `src/lib/validations/index.ts` | Re-export investment validation |
| `src/lib/constants.ts` | Add INVESTMENT_TYPES and LIVE_FETCH_TYPES constants |
| `src/app/dashboard/layout.tsx` | Set investments sidebar path to `/dashboard/investments` |
| `src/app/dashboard/page.tsx` | Add investment summary card below budget progress |
| `package.json` | Add `yahoo-finance2` dependency |

---

### Task 1: Types, Constants, and Validation

**Files:**
- Create: `src/types/investment.ts`
- Create: `src/lib/validations/investment.ts`
- Create: `src/lib/validations/investment.test.ts`
- Modify: `src/types/index.ts`
- Modify: `src/lib/validations/index.ts`
- Modify: `src/lib/constants.ts`

- [ ] **Step 1: Write validation tests**

Create `src/lib/validations/investment.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { investmentSchema } from "@/lib/validations/investment";

describe("investmentSchema", () => {
  const validData = {
    name: "Apple Inc.",
    type: "stock" as const,
    symbol: "AAPL",
    quantity: "10",
    purchase_price: "150.50",
    current_price: "185.00",
    currency: "USD",
    purchase_date: new Date("2024-01-15"),
    notes: "Long term hold",
  };

  it("should pass with valid complete data", () => {
    const result = investmentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should pass without optional fields (symbol, notes)", () => {
    const { symbol, notes, ...required } = validData;
    const result = investmentSchema.safeParse(required);
    expect(result.success).toBe(true);
  });

  it("should fail when name is empty", () => {
    const result = investmentSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
  });

  it("should fail when name exceeds 100 characters", () => {
    const result = investmentSchema.safeParse({ ...validData, name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("should fail with invalid type value", () => {
    const result = investmentSchema.safeParse({ ...validData, type: "nft" });
    expect(result.success).toBe(false);
  });

  it("should pass with all valid type values", () => {
    const types = ["stock", "mutual_fund", "fixed_deposit", "gold", "crypto", "bond", "real_estate"];
    for (const type of types) {
      const result = investmentSchema.safeParse({ ...validData, type });
      expect(result.success).toBe(true);
    }
  });

  it("should fail when quantity is empty", () => {
    const result = investmentSchema.safeParse({ ...validData, quantity: "" });
    expect(result.success).toBe(false);
  });

  it("should fail when quantity is zero", () => {
    const result = investmentSchema.safeParse({ ...validData, quantity: "0" });
    expect(result.success).toBe(false);
  });

  it("should fail when quantity is negative", () => {
    const result = investmentSchema.safeParse({ ...validData, quantity: "-5" });
    expect(result.success).toBe(false);
  });

  it("should fail when quantity is non-numeric", () => {
    const result = investmentSchema.safeParse({ ...validData, quantity: "abc" });
    expect(result.success).toBe(false);
  });

  it("should fail when purchase_price is zero", () => {
    const result = investmentSchema.safeParse({ ...validData, purchase_price: "0" });
    expect(result.success).toBe(false);
  });

  it("should fail when purchase_price is negative", () => {
    const result = investmentSchema.safeParse({ ...validData, purchase_price: "-10" });
    expect(result.success).toBe(false);
  });

  it("should fail when current_price is zero", () => {
    const result = investmentSchema.safeParse({ ...validData, current_price: "0" });
    expect(result.success).toBe(false);
  });

  it("should fail when current_price is non-numeric", () => {
    const result = investmentSchema.safeParse({ ...validData, current_price: "xyz" });
    expect(result.success).toBe(false);
  });

  it("should fail when currency is empty", () => {
    const result = investmentSchema.safeParse({ ...validData, currency: "" });
    expect(result.success).toBe(false);
  });

  it("should fail when purchase_date is not a Date", () => {
    const result = investmentSchema.safeParse({ ...validData, purchase_date: "not-a-date" });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/I524306/Personal/exp/MonTra && npx vitest run src/lib/validations/investment.test.ts`
Expected: FAIL — module `@/lib/validations/investment` not found

- [ ] **Step 3: Create investment types**

Create `src/types/investment.ts`:

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

- [ ] **Step 4: Re-export from types barrel**

Add to the end of `src/types/index.ts`:

```typescript
export type {
  Investment,
  InvestmentWithGains,
  InvestmentStats,
  InvestmentType,
} from "./investment";
```

- [ ] **Step 5: Create investment validation schema**

Create `src/lib/validations/investment.ts`:

```typescript
import { z } from "zod";

export const investmentSchema = z.object({
  name: z
    .string()
    .min(1, "Investment name is required")
    .max(100, "Name must be 100 characters or less"),
  type: z.enum(["stock", "mutual_fund", "fixed_deposit", "gold", "crypto", "bond", "real_estate"]),
  symbol: z.string().optional(),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Quantity must be greater than 0",
    }),
  purchase_price: z
    .string()
    .min(1, "Purchase price is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Purchase price must be greater than 0",
    }),
  current_price: z
    .string()
    .min(1, "Current price is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Current price must be greater than 0",
    }),
  currency: z.string().min(1, "Please select a currency"),
  purchase_date: z.date(),
  notes: z.string().optional(),
});

export type InvestmentFormData = z.infer<typeof investmentSchema>;
```

- [ ] **Step 6: Re-export from validations barrel**

Add to the end of `src/lib/validations/index.ts`:

```typescript
export {
  investmentSchema,
  type InvestmentFormData,
} from "./investment";
```

- [ ] **Step 7: Add investment constants**

Add to the end of `src/lib/constants.ts` (before the file ends):

```typescript
// ---------------------------------------------
// Investment Types
// ---------------------------------------------
export const INVESTMENT_TYPES = [
  { value: "stock", label: "Stock" },
  { value: "mutual_fund", label: "Mutual Fund" },
  { value: "fixed_deposit", label: "Fixed Deposit" },
  { value: "gold", label: "Gold" },
  { value: "crypto", label: "Crypto" },
  { value: "bond", label: "Bond" },
  { value: "real_estate", label: "Real Estate" },
] as const;

export const LIVE_FETCH_TYPES: readonly string[] = ["stock", "mutual_fund", "crypto"];
```

- [ ] **Step 8: Run validation tests to verify they pass**

Run: `cd /Users/I524306/Personal/exp/MonTra && npx vitest run src/lib/validations/investment.test.ts`
Expected: All 17 tests PASS

- [ ] **Step 9: Commit**

```bash
git add src/types/investment.ts src/types/index.ts src/lib/validations/investment.ts src/lib/validations/index.ts src/lib/validations/investment.test.ts src/lib/constants.ts
git commit -m "feat: add investment types, validation schema, and constants"
```

---

### Task 2: Database Schema

**Files:**
- Modify: `src/db/schema.ts`

- [ ] **Step 1: Add investments table to schema**

Add to the end of `src/db/schema.ts`:

```typescript
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
```

- [ ] **Step 2: Generate and run migration**

Run: `cd /Users/I524306/Personal/exp/MonTra && npx drizzle-kit generate`
Then: `npx drizzle-kit push` (to apply to Neon)

Note: If drizzle-kit push isn't configured, create the table manually via the Neon SQL console:

```sql
CREATE TABLE IF NOT EXISTS investments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT,
  type TEXT NOT NULL,
  quantity NUMERIC(12, 4) NOT NULL,
  purchase_price NUMERIC(12, 2) NOT NULL,
  current_price NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  purchase_date TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

- [ ] **Step 3: Commit**

```bash
git add src/db/schema.ts
git commit -m "feat: add investments table to database schema"
```

---

### Task 3: Server Actions + Tests

**Files:**
- Create: `src/actions/investments.ts`
- Create: `src/actions/investments.test.ts`

- [ ] **Step 1: Write server action tests**

Create `src/actions/investments.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSql, mockGetAuthUser, mockRevalidatePath } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockGetAuthUser: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock("@/db/neon", () => ({ sql: mockSql }));
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidatePath }));
vi.mock("@/actions/auth", () => ({ getAuthUser: mockGetAuthUser }));

import {
  getInvestments,
  addInvestment,
  updateInvestment,
  deleteInvestment,
  getInvestmentStats,
  updateInvestmentPrices,
} from "@/actions/investments";

describe("Investment Server Actions", () => {
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthUser.mockResolvedValue(mockUser);
  });

  // -------------------------------------------------------------------------
  // getInvestments
  // -------------------------------------------------------------------------
  describe("getInvestments", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await getInvestments();
      expect(result).toEqual({ success: false, error: "You must be logged in", data: [] });
    });

    it("should return investments for authenticated user", async () => {
      const investments = [
        { id: 1, name: "Apple", quantity: "10", purchase_price: "150", current_price: "185" },
      ];
      mockSql.mockResolvedValueOnce(investments);
      const result = await getInvestments();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(investments);
    });

    it("should return empty array when no investments", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await getInvestments();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Connection failed"));
      const result = await getInvestments();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Connection failed");
      expect(result.data).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // addInvestment
  // -------------------------------------------------------------------------
  describe("addInvestment", () => {
    const createFormData = () => {
      const formData = new FormData();
      formData.set("name", "Apple Inc.");
      formData.set("type", "stock");
      formData.set("symbol", "AAPL");
      formData.set("quantity", "10");
      formData.set("purchase_price", "150.50");
      formData.set("current_price", "185.00");
      formData.set("currency", "USD");
      formData.set("purchase_date", "2024-01-15T00:00:00.000Z");
      formData.set("notes", "Long term hold");
      return formData;
    };

    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await addInvestment(createFormData());
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should add investment successfully", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await addInvestment(createFormData());
      expect(result).toEqual({ success: true });
      expect(mockSql).toHaveBeenCalled();
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/investments");
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Insert failed"));
      const result = await addInvestment(createFormData());
      expect(result.success).toBe(false);
      expect(result.error).toBe("Insert failed");
    });
  });

  // -------------------------------------------------------------------------
  // updateInvestment
  // -------------------------------------------------------------------------
  describe("updateInvestment", () => {
    const createFormData = () => {
      const formData = new FormData();
      formData.set("name", "Apple Inc.");
      formData.set("type", "stock");
      formData.set("symbol", "AAPL");
      formData.set("quantity", "15");
      formData.set("purchase_price", "150.50");
      formData.set("current_price", "190.00");
      formData.set("currency", "USD");
      formData.set("purchase_date", "2024-01-15T00:00:00.000Z");
      formData.set("notes", "Increased position");
      return formData;
    };

    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await updateInvestment(1, createFormData());
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should update investment successfully", async () => {
      mockSql.mockResolvedValueOnce([{ id: 1 }]);
      const result = await updateInvestment(1, createFormData());
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/investments");
    });

    it("should return error when investment not found (non-owner)", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await updateInvestment(999, createFormData());
      expect(result.success).toBe(false);
      expect(result.error).toBe("Investment not found");
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Update failed"));
      const result = await updateInvestment(1, createFormData());
      expect(result.success).toBe(false);
      expect(result.error).toBe("Update failed");
    });
  });

  // -------------------------------------------------------------------------
  // deleteInvestment
  // -------------------------------------------------------------------------
  describe("deleteInvestment", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await deleteInvestment(1);
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should delete investment successfully", async () => {
      mockSql.mockResolvedValueOnce([{ id: 1 }]);
      const result = await deleteInvestment(1);
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/investments");
    });

    it("should return error when investment not found", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await deleteInvestment(999);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Investment not found");
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Delete failed"));
      const result = await deleteInvestment(1);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Delete failed");
    });
  });

  // -------------------------------------------------------------------------
  // getInvestmentStats
  // -------------------------------------------------------------------------
  describe("getInvestmentStats", () => {
    it("should return zeros if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await getInvestmentStats();
      expect(result).toEqual({
        totalInvested: 0,
        currentValue: 0,
        totalGainLoss: 0,
        gainPercentage: 0,
        holdingCount: 0,
      });
    });

    it("should return correct aggregates", async () => {
      mockSql.mockResolvedValueOnce([
        { count: "3", total_invested: "5000", total_current: "6500" },
      ]);
      const result = await getInvestmentStats();
      expect(result).toEqual({
        totalInvested: 5000,
        currentValue: 6500,
        totalGainLoss: 1500,
        gainPercentage: 30,
        holdingCount: 3,
      });
    });

    it("should return zeros when no investments", async () => {
      mockSql.mockResolvedValueOnce([
        { count: "0", total_invested: "0", total_current: "0" },
      ]);
      const result = await getInvestmentStats();
      expect(result).toEqual({
        totalInvested: 0,
        currentValue: 0,
        totalGainLoss: 0,
        gainPercentage: 0,
        holdingCount: 0,
      });
    });

    it("should handle negative gains", async () => {
      mockSql.mockResolvedValueOnce([
        { count: "2", total_invested: "10000", total_current: "8000" },
      ]);
      const result = await getInvestmentStats();
      expect(result.totalGainLoss).toBe(-2000);
      expect(result.gainPercentage).toBe(-20);
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Query failed"));
      const result = await getInvestmentStats();
      expect(result).toEqual({
        totalInvested: 0,
        currentValue: 0,
        totalGainLoss: 0,
        gainPercentage: 0,
        holdingCount: 0,
      });
    });
  });

  // -------------------------------------------------------------------------
  // updateInvestmentPrices
  // -------------------------------------------------------------------------
  describe("updateInvestmentPrices", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await updateInvestmentPrices([{ id: 1, currentPrice: 185 }]);
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should update prices successfully", async () => {
      mockSql.mockResolvedValue([]);
      const updates = [
        { id: 1, currentPrice: 185.50 },
        { id: 2, currentPrice: 64320.00 },
      ];
      const result = await updateInvestmentPrices(updates);
      expect(result).toEqual({ success: true });
      expect(mockSql).toHaveBeenCalledTimes(2);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/investments");
    });

    it("should handle empty updates array", async () => {
      const result = await updateInvestmentPrices([]);
      expect(result).toEqual({ success: true });
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Update failed"));
      const result = await updateInvestmentPrices([{ id: 1, currentPrice: 100 }]);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Update failed");
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/I524306/Personal/exp/MonTra && npx vitest run src/actions/investments.test.ts`
Expected: FAIL — module `@/actions/investments` not found

- [ ] **Step 3: Create server actions**

Create `src/actions/investments.ts`:

```typescript
"use server";

import { sql } from "@/db/neon";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/actions/auth";
import { extractErrorMessage } from "@/lib/utils";
import type { InvestmentStats } from "@/types";

export async function getInvestments() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in", data: [] };
    }

    const investments = await sql`
      SELECT id, user_id, name, symbol, type, quantity, purchase_price, current_price,
             currency, purchase_date, notes, created_at, updated_at
      FROM investments
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return { success: true, data: investments };

  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to fetch investments");
    console.error("Get investments error:", error);
    return { success: false, error: message, data: [] };
  }
}

export async function addInvestment(formData: FormData) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const symbol = (formData.get("symbol") as string) || null;
    const quantity = formData.get("quantity") as string;
    const purchase_price = formData.get("purchase_price") as string;
    const current_price = formData.get("current_price") as string;
    const currency = (formData.get("currency") as string) || "INR";
    const purchase_date = formData.get("purchase_date") as string;
    const notes = (formData.get("notes") as string) || null;

    await sql`
      INSERT INTO investments
        (user_id, name, symbol, type, quantity, purchase_price, current_price, currency, purchase_date, notes)
      VALUES
        (${user.id}, ${name}, ${symbol}, ${type}, ${parseFloat(quantity)}, ${parseFloat(purchase_price)}, ${parseFloat(current_price)}, ${currency}, ${new Date(purchase_date)}, ${notes})
    `;

    revalidatePath("/dashboard/investments");

    return { success: true };

  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to add investment");
    console.error("Add investment error:", error);
    return { success: false, error: message };
  }
}

export async function updateInvestment(id: number, formData: FormData) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const symbol = (formData.get("symbol") as string) || null;
    const quantity = formData.get("quantity") as string;
    const purchase_price = formData.get("purchase_price") as string;
    const current_price = formData.get("current_price") as string;
    const currency = (formData.get("currency") as string) || "INR";
    const purchase_date = formData.get("purchase_date") as string;
    const notes = (formData.get("notes") as string) || null;

    const result = await sql`
      UPDATE investments
      SET name = ${name}, symbol = ${symbol}, type = ${type},
          quantity = ${parseFloat(quantity)}, purchase_price = ${parseFloat(purchase_price)},
          current_price = ${parseFloat(current_price)}, currency = ${currency},
          purchase_date = ${new Date(purchase_date)}, notes = ${notes},
          updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return { success: false, error: "Investment not found" };
    }

    revalidatePath("/dashboard/investments");

    return { success: true };

  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to update investment");
    console.error("Update investment error:", error);
    return { success: false, error: message };
  }
}

export async function deleteInvestment(id: number) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const result = await sql`
      DELETE FROM investments
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return { success: false, error: "Investment not found" };
    }

    revalidatePath("/dashboard/investments");

    return { success: true };

  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to delete investment");
    console.error("Delete investment error:", error);
    return { success: false, error: message };
  }
}

export async function getInvestmentStats(): Promise<InvestmentStats> {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { totalInvested: 0, currentValue: 0, totalGainLoss: 0, gainPercentage: 0, holdingCount: 0 };
    }

    const result = await sql`
      SELECT
        COUNT(*) as count,
        COALESCE(SUM(quantity * purchase_price), 0) as total_invested,
        COALESCE(SUM(quantity * current_price), 0) as total_current
      FROM investments
      WHERE user_id = ${user.id}
    `;

    const row = result[0];
    const totalInvested = parseFloat(row.total_invested) || 0;
    const currentValue = parseFloat(row.total_current) || 0;
    const totalGainLoss = currentValue - totalInvested;
    const gainPercentage = totalInvested > 0 ? Math.round((totalGainLoss / totalInvested) * 100) : 0;

    return {
      totalInvested,
      currentValue,
      totalGainLoss,
      gainPercentage,
      holdingCount: parseInt(row.count) || 0,
    };

  } catch (error) {
    console.error("Get investment stats error:", error);
    return { totalInvested: 0, currentValue: 0, totalGainLoss: 0, gainPercentage: 0, holdingCount: 0 };
  }
}

export async function updateInvestmentPrices(updates: { id: number; currentPrice: number }[]) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    if (updates.length === 0) {
      return { success: true };
    }

    for (const update of updates) {
      await sql`
        UPDATE investments
        SET current_price = ${update.currentPrice}, updated_at = NOW()
        WHERE id = ${update.id} AND user_id = ${user.id}
      `;
    }

    revalidatePath("/dashboard/investments");

    return { success: true };

  } catch (error: unknown) {
    const message = extractErrorMessage(error, "Failed to update prices");
    console.error("Update investment prices error:", error);
    return { success: false, error: message };
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/I524306/Personal/exp/MonTra && npx vitest run src/actions/investments.test.ts`
Expected: All 21 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/actions/investments.ts src/actions/investments.test.ts
git commit -m "feat: add investment server actions with full test coverage"
```

---

### Task 4: Live Price Fetch API Route + Tests

**Files:**
- Create: `src/app/api/investments/prices/route.ts`
- Create: `src/app/api/investments/prices/route.test.ts`
- Modify: `package.json` (add yahoo-finance2)

- [ ] **Step 1: Install yahoo-finance2**

Run: `cd /Users/I524306/Personal/exp/MonTra && npm install yahoo-finance2`

- [ ] **Step 2: Write API route tests**

Create `src/app/api/investments/prices/route.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockQuote } = vi.hoisted(() => ({
  mockQuote: vi.fn(),
}));

vi.mock("yahoo-finance2", () => ({
  default: { quote: mockQuote },
}));

import { GET } from "@/app/api/investments/prices/route";

describe("GET /api/investments/prices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty prices when no symbols provided", async () => {
    const request = new Request("http://localhost:3000/api/investments/prices");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ prices: {} });
  });

  it("should return empty prices when symbols param is empty", async () => {
    const request = new Request("http://localhost:3000/api/investments/prices?symbols=");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ prices: {} });
  });

  it("should return prices for valid symbols", async () => {
    mockQuote.mockResolvedValueOnce({ regularMarketPrice: 185.50 });
    mockQuote.mockResolvedValueOnce({ regularMarketPrice: 64320.00 });

    const request = new Request("http://localhost:3000/api/investments/prices?symbols=AAPL,BTC-USD");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.prices["AAPL"]).toBe(185.50);
    expect(body.prices["BTC-USD"]).toBe(64320.00);
  });

  it("should skip symbols that fail and return the rest", async () => {
    mockQuote.mockResolvedValueOnce({ regularMarketPrice: 185.50 });
    mockQuote.mockRejectedValueOnce(new Error("Symbol not found"));

    const request = new Request("http://localhost:3000/api/investments/prices?symbols=AAPL,INVALID");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.prices["AAPL"]).toBe(185.50);
    expect(body.prices["INVALID"]).toBeUndefined();
  });

  it("should skip symbols with null price", async () => {
    mockQuote.mockResolvedValueOnce({ regularMarketPrice: null });

    const request = new Request("http://localhost:3000/api/investments/prices?symbols=BADTICKER");
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.prices["BADTICKER"]).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd /Users/I524306/Personal/exp/MonTra && npx vitest run src/app/api/investments/prices/route.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Create API route**

Create `src/app/api/investments/prices/route.ts`:

```typescript
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols");

  if (!symbolsParam || symbolsParam.trim() === "") {
    return NextResponse.json({ prices: {} });
  }

  const symbols = symbolsParam.split(",").map((s) => s.trim()).filter(Boolean);
  const prices: Record<string, number> = {};

  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const quote = await yahooFinance.quote(symbol);
        if (quote.regularMarketPrice != null) {
          prices[symbol] = quote.regularMarketPrice;
        }
      } catch {
        // Skip symbols that fail — they'll be omitted from the response
      }
    })
  );

  return NextResponse.json({ prices });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /Users/I524306/Personal/exp/MonTra && npx vitest run src/app/api/investments/prices/route.test.ts`
Expected: All 5 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/api/investments/prices/route.ts src/app/api/investments/prices/route.test.ts package.json package-lock.json
git commit -m "feat: add live price fetch API route with yahoo-finance2"
```

---

### Task 5: InvestmentStatsCards Component + Tests

**Files:**
- Create: `src/components/features/investments/InvestmentStatsCards.tsx`
- Create: `src/components/features/investments/InvestmentStatsCards.test.tsx`
- Create: `src/components/features/investments/index.ts`

- [ ] **Step 1: Write component tests**

Create `src/components/features/investments/InvestmentStatsCards.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/utils", () => ({
  formatCurrency: (amount: number, currency: string) => `${currency} ${amount}`,
  cn: (...args: string[]) => args.join(" "),
}));

import InvestmentStatsCards from "./InvestmentStatsCards";

describe("InvestmentStatsCards", () => {
  it("should render all four stat cards", () => {
    render(
      <InvestmentStatsCards
        totalInvested={50000}
        currentValue={65000}
        totalGainLoss={15000}
        gainPercentage={30}
        holdingCount={5}
        currency="INR"
      />
    );

    expect(screen.getByText("Total Invested")).toBeInTheDocument();
    expect(screen.getByText("Current Value")).toBeInTheDocument();
    expect(screen.getByText("Gain / Loss")).toBeInTheDocument();
    expect(screen.getByText("Holdings")).toBeInTheDocument();
  });

  it("should display formatted amounts", () => {
    render(
      <InvestmentStatsCards
        totalInvested={50000}
        currentValue={65000}
        totalGainLoss={15000}
        gainPercentage={30}
        holdingCount={5}
        currency="INR"
      />
    );

    expect(screen.getByText("INR 50000")).toBeInTheDocument();
    expect(screen.getByText("INR 65000")).toBeInTheDocument();
  });

  it("should display gain with percentage", () => {
    render(
      <InvestmentStatsCards
        totalInvested={50000}
        currentValue={65000}
        totalGainLoss={15000}
        gainPercentage={30}
        holdingCount={5}
        currency="INR"
      />
    );

    expect(screen.getByText(/INR 15000/)).toBeInTheDocument();
    expect(screen.getByText(/30%/)).toBeInTheDocument();
  });

  it("should display holding count", () => {
    render(
      <InvestmentStatsCards
        totalInvested={0}
        currentValue={0}
        totalGainLoss={0}
        gainPercentage={0}
        holdingCount={3}
        currency="INR"
      />
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should use green color for positive gains", () => {
    const { container } = render(
      <InvestmentStatsCards
        totalInvested={50000}
        currentValue={65000}
        totalGainLoss={15000}
        gainPercentage={30}
        holdingCount={5}
        currency="INR"
      />
    );

    const gainText = screen.getByText(/INR 15000/);
    expect(gainText.className).toContain("text-green");
  });

  it("should use red color for negative gains", () => {
    const { container } = render(
      <InvestmentStatsCards
        totalInvested={50000}
        currentValue={40000}
        totalGainLoss={-10000}
        gainPercentage={-20}
        holdingCount={5}
        currency="INR"
      />
    );

    const gainText = screen.getByText(/INR -10000/);
    expect(gainText.className).toContain("text-red");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/I524306/Personal/exp/MonTra && npx vitest run src/components/features/investments/InvestmentStatsCards.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Create InvestmentStatsCards component**

Create `src/components/features/investments/InvestmentStatsCards.tsx`:

```typescript
"use client";

import { Card } from "@tremor/react";
import { Wallet, TrendingUp, ArrowUpDown, PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface InvestmentStatsCardsProps {
  totalInvested: number;
  currentValue: number;
  totalGainLoss: number;
  gainPercentage: number;
  holdingCount: number;
  currency?: string;
}

export default function InvestmentStatsCards({
  totalInvested,
  currentValue,
  totalGainLoss,
  gainPercentage,
  holdingCount,
  currency = "INR",
}: InvestmentStatsCardsProps) {
  const gainColor = totalGainLoss >= 0 ? "text-green-600" : "text-red-600";
  const gainBg = totalGainLoss >= 0 ? "bg-green-50" : "bg-red-50";

  const stats = [
    {
      title: "Total Invested",
      value: formatCurrency(totalInvested, currency),
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Current Value",
      value: formatCurrency(currentValue, currency),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Gain / Loss",
      value: `${formatCurrency(totalGainLoss, currency)} (${gainPercentage}%)`,
      icon: ArrowUpDown,
      color: gainColor,
      bgColor: gainBg,
    },
    {
      title: "Holdings",
      value: holdingCount.toString(),
      icon: PieChart,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <p className={`mt-2 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            <div className={`rounded-full p-3 ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create barrel export**

Create `src/components/features/investments/index.ts`:

```typescript
export { default as InvestmentStatsCards } from "./InvestmentStatsCards";
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /Users/I524306/Personal/exp/MonTra && npx vitest run src/components/features/investments/InvestmentStatsCards.test.tsx`
Expected: All 7 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/features/investments/InvestmentStatsCards.tsx src/components/features/investments/InvestmentStatsCards.test.tsx src/components/features/investments/index.ts
git commit -m "feat: add InvestmentStatsCards component with tests"
```

---

### Task 6: AddInvestmentSheet Component

**Files:**
- Create: `src/components/features/investments/AddInvestmentSheet.tsx`
- Modify: `src/components/features/investments/index.ts`

- [ ] **Step 1: Create AddInvestmentSheet component**

Create `src/components/features/investments/AddInvestmentSheet.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { addInvestment } from "@/actions/investments";
import { getUserSettings } from "@/actions/settings";
import { investmentSchema, type InvestmentFormData } from "@/lib/validations";
import { INVESTMENT_TYPES, LIVE_FETCH_TYPES, SUPPORTED_CURRENCIES } from "@/lib/constants";
import { LoadingOverlay, CurrencySelector } from "@/components/shared";
import { extractErrorMessage } from "@/lib/utils";

interface AddInvestmentSheetProps {
  onSuccess?: () => void;
}

export default function AddInvestmentSheet({ onSuccess }: AddInvestmentSheetProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: "",
      type: "stock",
      symbol: "",
      quantity: "",
      purchase_price: "",
      current_price: "",
      currency: "INR",
      purchase_date: undefined as unknown as Date,
      notes: "",
    },
  });

  const investmentType = watch("type");
  const currency = watch("currency");
  const purchaseDate = watch("purchase_date");
  const showSymbol = LIVE_FETCH_TYPES.includes(investmentType);

  useEffect(() => {
    setValue("purchase_date", new Date());
    getUserSettings().then((result) => {
      if (result.success && result.data) {
        setValue("currency", result.data.default_currency);
      }
    });
  }, [setValue]);

  const onSubmit = async (data: InvestmentFormData) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("type", data.type);
      formData.append("symbol", data.symbol || "");
      formData.append("quantity", data.quantity);
      formData.append("purchase_price", data.purchase_price);
      formData.append("current_price", data.current_price);
      formData.append("currency", data.currency);
      formData.append("purchase_date", data.purchase_date.toISOString());
      formData.append("notes", data.notes || "");

      const result = await addInvestment(formData);

      if (!result.success) {
        toast.error(result.error || "Failed to add investment");
        return;
      }

      toast.success("Investment added successfully!");
      reset();
      setOpen(false);
      onSuccess?.();

    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      console.error(error);
      toast.error("Failed to add investment", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !loading && setOpen(isOpen)}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Investment
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg p-4 md:p-6 overflow-y-auto">
        {loading && <LoadingOverlay message="Adding investment" />}

        <SheetHeader className="mb-4">
          <SheetTitle className="text-2xl">Add New Investment</SheetTitle>
          <SheetDescription>Enter the details of your investment holding</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <fieldset disabled={loading} className="space-y-4">

          {/* Investment Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">
              Investment Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Apple Inc., Bitcoin, SBI Gold Fund"
              {...register("name")}
              className={`h-12 text-base ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          {/* Investment Type */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Type <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select investment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>

          {/* Symbol (conditional) */}
          {showSymbol && (
            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-base font-medium">Symbol</Label>
              <Input
                id="symbol"
                placeholder="e.g., AAPL, BTC-USD, SBIN.NS"
                {...register("symbol")}
                className="h-12 text-base"
              />
              <p className="text-xs text-muted-foreground">Used for live price fetching</p>
            </div>
          )}

          {/* Currency */}
          <CurrencySelector control={control} name="currency" error={errors.currency?.message} />

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-base font-medium">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.0001"
              placeholder="0"
              {...register("quantity")}
              className={`h-12 text-base ${errors.quantity ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
          </div>

          {/* Purchase Price */}
          <div className="space-y-2">
            <Label htmlFor="purchase_price" className="text-base font-medium">
              Purchase Price ({SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹"} / unit) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="purchase_price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("purchase_price")}
              className={`h-12 text-base ${errors.purchase_price ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.purchase_price && <p className="text-sm text-red-500">{errors.purchase_price.message}</p>}
          </div>

          {/* Current Price */}
          <div className="space-y-2">
            <Label htmlFor="current_price" className="text-base font-medium">
              Current Price ({SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹"} / unit) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="current_price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("current_price")}
              className={`h-12 text-base ${errors.current_price ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.current_price && <p className="text-sm text-red-500">{errors.current_price.message}</p>}
          </div>

          {/* Purchase Date */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Purchase Date</Label>
            <Controller
              name="purchase_date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-12 justify-start text-left text-base">
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      {purchaseDate ? format(purchaseDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-medium">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes (optional)"
              {...register("notes")}
              className="min-h-[60px] text-base"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base mt-2" disabled={loading}>
            Add Investment
          </Button>
          </fieldset>
        </form>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Update barrel export**

Replace `src/components/features/investments/index.ts` with:

```typescript
export { default as InvestmentStatsCards } from "./InvestmentStatsCards";
export { default as AddInvestmentSheet } from "./AddInvestmentSheet";
```

- [ ] **Step 3: Commit**

```bash
git add src/components/features/investments/AddInvestmentSheet.tsx src/components/features/investments/index.ts
git commit -m "feat: add AddInvestmentSheet component"
```

---

### Task 7: EditInvestmentSheet Component

**Files:**
- Create: `src/components/features/investments/EditInvestmentSheet.tsx`
- Modify: `src/components/features/investments/index.ts`

- [ ] **Step 1: Create EditInvestmentSheet component**

Create `src/components/features/investments/EditInvestmentSheet.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { updateInvestment } from "@/actions/investments";
import { investmentSchema, type InvestmentFormData } from "@/lib/validations";
import { INVESTMENT_TYPES, LIVE_FETCH_TYPES, SUPPORTED_CURRENCIES } from "@/lib/constants";
import { LoadingOverlay, CurrencySelector } from "@/components/shared";
import type { Investment } from "@/types";
import { extractErrorMessage } from "@/lib/utils";

interface EditInvestmentSheetProps {
  investment: Investment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditInvestmentSheet({
  investment,
  open,
  onOpenChange,
  onSuccess,
}: EditInvestmentSheetProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: "",
      type: "stock",
      symbol: "",
      quantity: "",
      purchase_price: "",
      current_price: "",
      currency: "INR",
      purchase_date: undefined as unknown as Date,
      notes: "",
    },
  });

  const investmentType = watch("type");
  const currency = watch("currency");
  const purchaseDate = watch("purchase_date");
  const showSymbol = LIVE_FETCH_TYPES.includes(investmentType);

  useEffect(() => {
    if (investment) {
      reset({
        name: investment.name,
        type: investment.type,
        symbol: investment.symbol || "",
        quantity: investment.quantity,
        purchase_price: investment.purchase_price,
        current_price: investment.current_price,
        currency: investment.currency || "INR",
        purchase_date: new Date(investment.purchase_date),
        notes: investment.notes || "",
      });
    }
  }, [investment, reset]);

  const onSubmit = async (data: InvestmentFormData) => {
    if (!investment) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("type", data.type);
      formData.append("symbol", data.symbol || "");
      formData.append("quantity", data.quantity);
      formData.append("purchase_price", data.purchase_price);
      formData.append("current_price", data.current_price);
      formData.append("currency", data.currency);
      formData.append("purchase_date", data.purchase_date.toISOString());
      formData.append("notes", data.notes || "");

      const result = await updateInvestment(investment.id, formData);

      if (!result.success) {
        toast.error(result.error || "Failed to update investment");
        return;
      }

      toast.success("Investment updated successfully!");
      onSuccess?.();

    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      console.error(error);
      toast.error("Failed to update investment", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !loading && onOpenChange(isOpen)}>
      <SheetContent className="w-full sm:max-w-lg p-4 md:p-6 overflow-y-auto">
        {loading && <LoadingOverlay message="Updating investment" />}

        <SheetHeader className="mb-4">
          <SheetTitle className="text-2xl">Edit Investment</SheetTitle>
          <SheetDescription>Update the details of your investment holding</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <fieldset disabled={loading} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-base font-medium">
              Investment Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="e.g., Apple Inc., Bitcoin, SBI Gold Fund"
              {...register("name")}
              className={`h-12 text-base ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium">
              Type <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select investment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>

          {showSymbol && (
            <div className="space-y-2">
              <Label htmlFor="edit-symbol" className="text-base font-medium">Symbol</Label>
              <Input
                id="edit-symbol"
                placeholder="e.g., AAPL, BTC-USD, SBIN.NS"
                {...register("symbol")}
                className="h-12 text-base"
              />
              <p className="text-xs text-muted-foreground">Used for live price fetching</p>
            </div>
          )}

          <CurrencySelector control={control} name="currency" error={errors.currency?.message} />

          <div className="space-y-2">
            <Label htmlFor="edit-quantity" className="text-base font-medium">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-quantity"
              type="number"
              step="0.0001"
              placeholder="0"
              {...register("quantity")}
              className={`h-12 text-base ${errors.quantity ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-purchase_price" className="text-base font-medium">
              Purchase Price ({SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹"} / unit) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-purchase_price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("purchase_price")}
              className={`h-12 text-base ${errors.purchase_price ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.purchase_price && <p className="text-sm text-red-500">{errors.purchase_price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-current_price" className="text-base font-medium">
              Current Price ({SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹"} / unit) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-current_price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("current_price")}
              className={`h-12 text-base ${errors.current_price ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {errors.current_price && <p className="text-sm text-red-500">{errors.current_price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium">Purchase Date</Label>
            <Controller
              name="purchase_date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-12 justify-start text-left text-base">
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      {purchaseDate ? format(purchaseDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="text-base font-medium">Notes</Label>
            <Textarea
              id="edit-notes"
              placeholder="Any additional notes (optional)"
              {...register("notes")}
              className="min-h-[60px] text-base"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base mt-2" disabled={loading}>
            Update Investment
          </Button>
          </fieldset>
        </form>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Update barrel export**

Replace `src/components/features/investments/index.ts` with:

```typescript
export { default as InvestmentStatsCards } from "./InvestmentStatsCards";
export { default as AddInvestmentSheet } from "./AddInvestmentSheet";
export { default as EditInvestmentSheet } from "./EditInvestmentSheet";
```

- [ ] **Step 3: Commit**

```bash
git add src/components/features/investments/EditInvestmentSheet.tsx src/components/features/investments/index.ts
git commit -m "feat: add EditInvestmentSheet component"
```

---

### Task 8: Investments Page

**Files:**
- Create: `src/app/dashboard/investments/page.tsx`
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Create investments page**

Create `src/app/dashboard/investments/page.tsx`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw, Pencil, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInvestments, deleteInvestment, getInvestmentStats, updateInvestmentPrices } from "@/actions/investments";
import { InvestmentStatsCards, AddInvestmentSheet, EditInvestmentSheet } from "@/components/features/investments";
import { ConfirmDialog, EmptyState } from "@/components/shared";
import { formatCurrency } from "@/lib/utils";
import { INVESTMENT_TYPES, LIVE_FETCH_TYPES } from "@/lib/constants";
import type { Investment, InvestmentStats, InvestmentWithGains } from "@/types";

export default function InvestmentsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const [investments, setInvestments] = useState<InvestmentWithGains[]>([]);
  const [stats, setStats] = useState<InvestmentStats>({
    totalInvested: 0, currentValue: 0, totalGainLoss: 0, gainPercentage: 0, holdingCount: 0,
  });
  const [filterType, setFilterType] = useState<string>("all");
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const computeGains = (inv: Investment): InvestmentWithGains => {
    const qty = parseFloat(inv.quantity) || 0;
    const buyPrice = parseFloat(inv.purchase_price) || 0;
    const curPrice = parseFloat(inv.current_price) || 0;
    const invested_amount = qty * buyPrice;
    const current_value = qty * curPrice;
    const gain_loss = current_value - invested_amount;
    const gain_percentage = invested_amount > 0 ? Math.round((gain_loss / invested_amount) * 100) : 0;
    return { ...inv, invested_amount, current_value, gain_loss, gain_percentage };
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invResult, statsResult] = await Promise.all([
        getInvestments(),
        getInvestmentStats(),
      ]);

      if (invResult.success) {
        setInvestments((invResult.data as Investment[]).map(computeGains));
      } else {
        toast.error(invResult.error);
      }
      setStats(statsResult);
    } catch (error) {
      console.error("Failed to fetch investments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefreshPrices = async () => {
    const symbolInvestments = investments.filter(
      (inv) => inv.symbol && LIVE_FETCH_TYPES.includes(inv.type)
    );

    if (symbolInvestments.length === 0) {
      toast.info("No investments with symbols to refresh");
      return;
    }

    setRefreshingPrices(true);
    try {
      const symbols = symbolInvestments.map((inv) => inv.symbol!).join(",");
      const response = await fetch(`/api/investments/prices?symbols=${symbols}`);
      const { prices } = await response.json();

      const updates: { id: number; currentPrice: number }[] = [];
      for (const inv of symbolInvestments) {
        const price = prices[inv.symbol!];
        if (price != null) {
          updates.push({ id: inv.id, currentPrice: price });
        }
      }

      if (updates.length > 0) {
        await updateInvestmentPrices(updates);
        await fetchData();
        toast.success(`Updated prices for ${updates.length} investment(s)`);
      } else {
        toast.info("No price updates available");
      }
    } catch (error) {
      console.error("Price refresh failed:", error);
      toast.error("Failed to refresh prices");
    } finally {
      setRefreshingPrices(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const result = await deleteInvestment(deleteId);
    if (result.success) {
      toast.success("Investment deleted");
      setDeleteId(null);
      fetchData();
    } else {
      toast.error(result.error || "Failed to delete");
    }
  };

  const handleEdit = (inv: Investment) => {
    setEditingInvestment(inv);
    setEditSheetOpen(true);
  };

  const filtered = filterType === "all"
    ? investments
    : investments.filter((inv) => inv.type === filterType);

  const getTypeLabel = (value: string) =>
    INVESTMENT_TYPES.find((t) => t.value === value)?.label ?? value;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Investments</h1>
        <p className="text-muted-foreground mt-1">Track and manage your investment portfolio</p>
      </div>

      {/* Stats Cards */}
      <InvestmentStatsCards
        totalInvested={stats.totalInvested}
        currentValue={stats.currentValue}
        totalGainLoss={stats.totalGainLoss}
        gainPercentage={stats.gainPercentage}
        holdingCount={stats.holdingCount}
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <AddInvestmentSheet onSuccess={fetchData} />
        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {INVESTMENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefreshPrices} disabled={refreshingPrices}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshingPrices ? "animate-spin" : ""}`} />
            Refresh Prices
          </Button>
        </div>
      </div>

      {/* Holdings Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No investments yet"
          description="Add your first investment to start tracking your portfolio"
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-right p-3 font-medium">Qty</th>
                  <th className="text-right p-3 font-medium">Buy Price</th>
                  <th className="text-right p-3 font-medium">Current Price</th>
                  <th className="text-right p-3 font-medium">Invested</th>
                  <th className="text-right p-3 font-medium">Current Value</th>
                  <th className="text-right p-3 font-medium">Gain/Loss</th>
                  <th className="text-right p-3 font-medium">Gain %</th>
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">
                      {inv.name}
                      {inv.symbol && <span className="text-xs text-muted-foreground ml-1">({inv.symbol})</span>}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                        {getTypeLabel(inv.type)}
                      </span>
                    </td>
                    <td className="p-3 text-right">{parseFloat(inv.quantity)}</td>
                    <td className="p-3 text-right">{formatCurrency(inv.purchase_price, inv.currency)}</td>
                    <td className="p-3 text-right">{formatCurrency(inv.current_price, inv.currency)}</td>
                    <td className="p-3 text-right">{formatCurrency(inv.invested_amount, inv.currency)}</td>
                    <td className="p-3 text-right">{formatCurrency(inv.current_value, inv.currency)}</td>
                    <td className={`p-3 text-right font-medium ${inv.gain_loss >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(inv.gain_loss, inv.currency)}
                    </td>
                    <td className={`p-3 text-right font-medium ${inv.gain_percentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {inv.gain_percentage}%
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(inv)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => setDeleteId(inv.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((inv) => (
              <div key={inv.id} className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{inv.name}</p>
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium mt-1">
                      {getTypeLabel(inv.type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(inv)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => setDeleteId(inv.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Invested</p>
                    <p className="font-medium">{formatCurrency(inv.invested_amount, inv.currency)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Value</p>
                    <p className="font-medium">{formatCurrency(inv.current_value, inv.currency)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gain/Loss</p>
                    <p className={`font-medium ${inv.gain_loss >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(inv.gain_loss, inv.currency)} ({inv.gain_percentage}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Qty</p>
                    <p className="font-medium">{parseFloat(inv.quantity)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Sheet */}
      <EditInvestmentSheet
        investment={editingInvestment}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        onSuccess={() => {
          setEditSheetOpen(false);
          fetchData();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Investment"
        description="Are you sure you want to delete this investment? This action cannot be undone."
        onConfirm={handleDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
```

- [ ] **Step 2: Update sidebar path**

In `src/app/dashboard/layout.tsx`, change line 400 from:

```typescript
    { icon: TrendingUp, label: "Investments", path: "" },
```

to:

```typescript
    { icon: TrendingUp, label: "Investments", path: "/dashboard/investments" },
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/investments/page.tsx src/app/dashboard/layout.tsx
git commit -m "feat: add investments page with holdings table, filters, and live price refresh"
```

---

### Task 9: Dashboard Integration

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Add investment stats import and state**

In `src/app/dashboard/page.tsx`, add import at top alongside existing imports:

```typescript
import { getInvestmentStats, type InvestmentStats } from "@/actions/investments";
import { TrendingUp as TrendingUpIcon } from "lucide-react";
import Link from "next/link";
```

Update the `DashboardData` interface to include:

```typescript
investmentStats: InvestmentStats | null;
```

- [ ] **Step 2: Fetch investment stats in Promise.all**

In the `fetchData` callback, add `getInvestmentStats()` to the `Promise.all` array and include the result:

```typescript
const [stats, spending, trend, recentTransactions, budgetResult, investmentStats] = await Promise.all([
  getDashboardStats(),
  getSpendingByCategory(),
  getMonthlyTrend(),
  getRecentTransactions(5),
  checkBudgetStatus(),
  getInvestmentStats(),
]);
```

Set it in state:

```typescript
investmentStats: investmentStats.holdingCount > 0 ? investmentStats : null,
```

- [ ] **Step 3: Add investment summary card to JSX**

Add below the budget progress section and above the charts row (`{/* Charts Row */}`):

```typescript
{/* Investment Summary */}
{data?.investmentStats && (
  <Link href="/dashboard/investments" className="block">
    <div className="rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Investments</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {formatCurrency(data.investmentStats.currentValue)}
          </span>
          <span className={`text-sm font-medium ${
            data.investmentStats.gainPercentage >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            {data.investmentStats.gainPercentage >= 0 ? "+" : ""}{data.investmentStats.gainPercentage}%
          </span>
        </div>
      </div>
    </div>
  </Link>
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add investment summary card to dashboard"
```

---

### Task 10: Run All Tests + Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run all tests**

Run: `cd /Users/I524306/Personal/exp/MonTra && npx vitest run`
Expected: All tests PASS (existing + new investment tests)

- [ ] **Step 2: Run TypeScript type check**

Run: `cd /Users/I524306/Personal/exp/MonTra && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Run linter**

Run: `cd /Users/I524306/Personal/exp/MonTra && npm run lint`
Expected: No lint errors

- [ ] **Step 4: Start dev server and test manually**

Run: `cd /Users/I524306/Personal/exp/MonTra && npm run dev`

Test checklist:
1. Navigate to `/dashboard/investments` via sidebar — page loads with empty state
2. Click "Add Investment" — sheet opens with all form fields
3. Select "Stock" type — symbol field appears
4. Select "Fixed Deposit" type — symbol field hides
5. Fill form and submit — investment appears in table
6. Edit an investment — pre-populated sheet opens, updates on save
7. Delete an investment — confirmation dialog, removes from table
8. "Refresh Prices" button — fetches live prices for symbol-based holdings
9. Filter by type dropdown — filters table correctly
10. Dashboard page shows investment summary card when investments exist
11. Mobile view — table degrades to card layout

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during manual testing"
```
