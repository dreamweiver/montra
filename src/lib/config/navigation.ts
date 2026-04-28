import { Home, CreditCard, FolderOpen, CalendarClock, Target, TrendingUp, Settings, HelpCircle } from "lucide-react";

export const NAV_ITEMS = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: CreditCard, label: "Transactions", path: "/dashboard/transactions" },
  { icon: FolderOpen, label: "Categories", path: "/dashboard/categories" },
  { icon: CalendarClock, label: "Recurring", path: "/dashboard/recurring" },
  { icon: Target, label: "Budgets", path: "/dashboard/budgets" },
  { icon: TrendingUp, label: "Investments", path: "/dashboard/investments" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  { icon: HelpCircle, label: "Contact Us", path: "/dashboard/contact" },
];
