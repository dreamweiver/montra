<div align="center">

# Montra

### Money + Tracker = Montra

**Track smart. Spend wise. Grow wealth.**

A modern personal finance app built with Next.js 16 to help you track income, expenses, budgets, and investments.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Montra-22c55e?style=for-the-badge&logo=vercel)](https://montra-git-main-dreamweivermanoj-9161s-projects.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## Features

- **Authentication** — Supabase Auth with email/password, auto-logout after 15 min idle
- **User Profiles** — First name, last name, date of birth with 18+ age validation
- **Transactions** — Log income and expenses with categories, filter by date/type/category, export to CSV
- **Categories** — Custom income & expense categories with icons, colors, and default seed
- **Recurring Transactions** — Auto-generated daily, weekly, monthly, or yearly entries with pause/resume
- **Budgets** — Monthly spending limits with progress tracking and dashboard alerts
- **Investments** — Track stocks, mutual funds, crypto, gold, bonds, FDs, and real estate with live Yahoo Finance price refresh, currency conversion, and symbol search typeahead
- **Dashboard** — Financial overview with stats cards, monthly trend bar chart, spending donut chart, recent transactions, budget progress, and investment summary
- **Multi-Currency** — 11 currencies (INR, USD, EUR, GBP, JPY, and more) with automatic Yahoo Finance forex conversion
- **Dark/Light Theme** — System-aware toggle with persistent preference
- **Responsive** — Mobile-first layout with sidebar navigation and mobile drawer
- **266 tests** — Vitest + React Testing Library across 23 test files

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui + Radix UI |
| **Charts** | Tremor (Recharts) |
| **Database** | Neon PostgreSQL (Serverless) |
| **ORM/Migrations** | Drizzle ORM + drizzle-kit |
| **Authentication** | Supabase Auth |
| **Forms** | React Hook Form + Zod |
| **Market Data** | yahoo-finance2 |
| **Testing** | Vitest + React Testing Library |
| **Deployment** | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/                # Login, register pages
│   ├── api/investments/       # Yahoo Finance price + search API routes
│   ├── contact/               # Public contact page
│   └── dashboard/
│       ├── page.tsx           # Dashboard overview
│       ├── transactions/      # Transaction list + CRUD
│       ├── categories/        # Category management
│       ├── recurring/         # Recurring transactions
│       ├── budgets/           # Budget settings + progress
│       ├── investments/       # Investment portfolio
│       ├── settings/          # User preferences + profile
│       └── contact/           # Contact page (authenticated)
├── actions/                   # Server Actions (consolidated per-page data fetches)
├── components/
│   ├── features/              # Feature-specific components
│   ├── shared/                # Reusable (SymbolSearch, CurrencySelector, etc.)
│   └── ui/                    # shadcn/ui primitives
├── db/                        # Neon client + Drizzle schema
├── hooks/                     # Custom hooks (useSymbolSearch, useMediaQuery, etc.)
├── lib/                       # Utils, constants, validations
└── types/                     # TypeScript definitions
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Neon Database](https://neon.tech) account (free tier)
- [Supabase](https://supabase.com) account (free tier)

### Installation

```bash
git clone https://github.com/dreamweiver/montra.git
cd montra
npm install
```

### Environment Variables

Create `.env.local` with:

```env
# Neon PostgreSQL
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

| Variable | Where to find it |
|----------|-----------------|
| `DATABASE_URL` | Neon dashboard > Connection Details |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Settings > API > anon public key |

### Run

```bash
npx drizzle-kit push    # Apply database schema
npm run dev             # Start dev server at http://localhost:3000
```

---

## Testing

```bash
npm test                # Watch mode
npm run test:run        # Single run
npm run test:coverage   # With coverage report
```

23 test files, 266 tests covering server actions, API routes, hooks, validations, and components.

---

## Roadmap

### Done
- [x] Authentication (Supabase email/password) with idle session timeout
- [x] User profiles with name, DOB, and age validation
- [x] Transactions CRUD with filters, search, and CSV export
- [x] Custom category management with icons and colors
- [x] Recurring transactions (daily/weekly/monthly/yearly) with auto-processing
- [x] Monthly budget goals with progress bars and alerts
- [x] Investment tracking with 7 asset types
- [x] Live price refresh via Yahoo Finance API with currency conversion
- [x] Symbol search typeahead for stocks/crypto/mutual funds
- [x] Dashboard with consolidated single-call data fetch
- [x] Multi-currency support (11 currencies)
- [x] Dark/light theme with system detection
- [x] Responsive mobile layout with sidebar drawer
- [x] Consolidated server actions (single auth + parallel SQL per page)
- [x] Deployed to Vercel

### Next
- [ ] Portfolio allocation chart
- [ ] Buy/sell transaction history per holding
- [ ] Goal-based investment tracking
- [ ] Import from CSV/broker statements

---

## Contact & Feedback

Montra is created and maintained by **[Dreamweiver](https://github.com/dreamweiver)**.

- **Live App** — [montra-git-main-dreamweivermanoj-9161s-projects.vercel.app](https://montra-git-main-dreamweivermanoj-9161s-projects.vercel.app/)
- **Source Code** — [github.com/dreamweiver/montra](https://github.com/dreamweiver/montra)
- **Report a Bug** — [Open an issue](https://github.com/dreamweiver/montra/issues/new)
- **Feature Requests & Feedback** — [View all issues](https://github.com/dreamweiver/montra/issues)

Found a bug or have a suggestion? Please [open a GitHub issue](https://github.com/dreamweiver/montra/issues/new) — it helps us improve Montra for everyone.

---

## License

MIT

---

<div align="center">

*Track smart. Spend wise. Grow wealth.*

</div>
