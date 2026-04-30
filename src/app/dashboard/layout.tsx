"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getUserSettings } from "@/actions/settings";
import { refreshInvestmentPrices } from "@/actions/refreshPrices";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { ThemeToggle, BudgetIndicator, StockIndicator } from "@/components/shared";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/lib/config/navigation";

// =============================================================================
// Constants
// =============================================================================
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

// =============================================================================
// Main Component
// =============================================================================
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const pendingPath = navigatingTo && navigatingTo !== pathname ? navigatingTo : null;

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
  }, [router]);

  // ---------------------------------------------------------------------------
  // Idle Auto-Logout
  // ---------------------------------------------------------------------------
  useIdleLogout(IDLE_TIMEOUT_MS, useCallback(() => {
    toast.info("Session expired due to inactivity");
    handleLogout();
  }, [handleLogout]));

  // ---------------------------------------------------------------------------
  // Load User Name
  // ---------------------------------------------------------------------------
  useEffect(() => {
    getUserSettings().then((result) => {
      if (result.success && result.data?.first_name) {
        setUserName(result.data.first_name);
      }
    });
    refreshInvestmentPrices().then(() => {
      window.dispatchEvent(new Event("stock-refresh"));
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Menu Toggle
  // ---------------------------------------------------------------------------
  const handleMenuToggle = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      setSidebarOpen((prev) => !prev);
    } else {
      setMobileMenuOpen(true);
    }
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className={`hidden md:block border-r bg-card transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex h-full flex-col">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold tracking-tight">
              {sidebarOpen ? "Montra" : "MT"}
            </h2>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path;
              const isPendingNav = pendingPath === item.path;
              return (
                <Link
                  key={item.label}
                  href={item.path}
                  onClick={(e) => {
                    if (isActive) return;
                    e.preventDefault();
                    setNavigatingTo(item.path);
                    startTransition(() => router.push(item.path));
                  }}
                >
                  <Button
                    variant={isActive || isPendingNav ? "secondary" : "ghost"}
                    className={`w-full justify-start cursor-pointer ${isActive || isPendingNav ? "bg-neutral-200 dark:bg-neutral-700 font-semibold" : ""} ${isPendingNav ? "opacity-70 animate-pulse" : ""}`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {sidebarOpen && item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start cursor-pointer bg-gradient-to-r from-rose-500/10 to-orange-500/10 text-rose-600 hover:from-rose-500 hover:to-orange-500 hover:text-white dark:from-rose-500/15 dark:to-orange-500/15 dark:text-rose-400 dark:hover:from-rose-500 dark:hover:to-orange-500 dark:hover:text-white transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              {sidebarOpen && "Logout"}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Montra</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.path;
                const isPendingNav = pendingPath === item.path;
                return (
                  <Link
                    key={item.label}
                    href={item.path}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      if (isActive) return;
                      e.preventDefault();
                      setNavigatingTo(item.path);
                      startTransition(() => router.push(item.path));
                    }}
                  >
                    <Button
                      variant={isActive || isPendingNav ? "secondary" : "ghost"}
                      className={`w-full justify-start cursor-pointer ${isActive || isPendingNav ? "bg-neutral-200 dark:bg-neutral-700 font-semibold" : ""} ${isPendingNav ? "opacity-70 animate-pulse" : ""}`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start cursor-pointer bg-gradient-to-r from-rose-500/10 to-orange-500/10 text-rose-600 hover:from-rose-500 hover:to-orange-500 hover:text-white dark:from-rose-500/15 dark:to-orange-500/15 dark:text-rose-400 dark:hover:from-rose-500 dark:hover:to-orange-500 dark:hover:text-white transition-all duration-200"
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="border-b bg-card px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg md:text-xl font-semibold">Dashboard</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <StockIndicator />
              <BudgetIndicator />
            </div>
            <ThemeToggle />
            <div className="hidden md:block text-sm text-muted-foreground">
              Welcome back{userName ? `, ${userName}` : ""}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
