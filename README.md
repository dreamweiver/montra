<div align="center">

# 💰 MonTra

### Money + Tracker = MonTra

**Take Control of Your Money**

A modern, sleek personal finance app built with Next.js 16, designed to help you track income, expenses, and visualize your financial journey.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## ✨ Features

- 🔐 **Secure Authentication** — Powered by Supabase Auth
- 💸 **Track Transactions** — Log income and expenses with categories
- 📊 **Dashboard Analytics** — Real-time financial overview *(coming soon)*
- 📱 **Responsive Design** — Works beautifully on all devices
- ⚡ **Blazing Fast** — Built on Next.js App Router with React Server Components
- 🎨 **Modern UI** — Clean interface with shadcn/ui components

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui + Radix UI |
| **Database** | Neon PostgreSQL (Serverless) |
| **ORM** | Drizzle ORM |
| **Authentication** | Supabase Auth |
| **Forms** | React Hook Form + Zod |
| **State** | Zustand |
| **Charts** | Recharts |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   └── dashboard/         # Protected dashboard routes
├── actions/               # Server Actions
├── components/
│   ├── features/          # Feature-specific components
│   ├── shared/            # Reusable components
│   └── ui/                # shadcn/ui components
├── db/                    # Database schema & client
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities & constants
└── types/                 # TypeScript definitions
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- [Neon Database](https://neon.tech) account (free tier available)
- [Supabase](https://supabase.com) account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/montra.git
   cd montra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

---

## 🔐 Environment Variables Setup

This app requires three environment variables. Here's how to get each one:

### 1. DATABASE_URL (Neon PostgreSQL)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. In your project dashboard, click **"Connection Details"**
4. Copy the connection string (starts with `postgresql://...`)

```env
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### 2. NEXT_PUBLIC_SUPABASE_URL

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings → API**
4. Copy the **Project URL**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
```

### 3. NEXT_PUBLIC_SUPABASE_ANON_KEY

1. In the same Supabase **Settings → API** page
2. Copy the **anon public** key (under "Project API keys")

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Your final `.env.local` should look like:

```env
# Database (Neon)
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

---

### Continue Setup

4. **Run database migrations**
   ```bash
   npx drizzle-kit push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📸 Screenshots

<div align="center">

| Dashboard | Transactions |
|-----------|--------------|
| *Coming soon* | *Coming soon* |

</div>

---

## 🗺️ Roadmap

### ✅ Completed
- [x] User authentication (Supabase)
- [x] Add transactions with categories
- [x] View transactions list
- [x] Delete transactions
- [x] Edit transactions

### 🚧 In Progress
- [ ] Dashboard with real stats & summary cards
- [ ] Charts & analytics (Recharts)

### 📋 Planned
- [ ] Filter & search transactions
- [ ] Investments tracking page
- [ ] Settings page (profile, preferences)
- [ ] Export transactions to CSV
- [ ] Dark/Light theme toggle
- [ ] Budget goals & alerts
- [ ] Recurring transactions
- [ ] Multi-currency support

---

## � Testing

Tests are written with [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) and co-located next to source files.

```bash
# Run tests in watch mode
npm test

# Single test run
npm run test:run

# Run with coverage report
npm run test:coverage
```

Coverage reports are generated in both **terminal** and **HTML** format (at `coverage/index.html`).

---

## �🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Made with ❤️ and ☕**

*Track smart. Spend wise. Grow wealth.*

</div>
