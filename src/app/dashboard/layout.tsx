"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getUserSettings } from "@/actions/settings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut, Home, CreditCard, TrendingUp, Settings, Menu, FolderOpen, CalendarClock, Target, X, HelpCircle } from "lucide-react";
import { ThemeToggle, BudgetIndicator } from "@/components/shared";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

// =============================================================================
// Constants
// =============================================================================
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll"] as const;

const navItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: CreditCard, label: "Transactions", path: "/dashboard/transactions" },
  { icon: FolderOpen, label: "Categories", path: "/dashboard/categories" },
  { icon: CalendarClock, label: "Recurring", path: "/dashboard/recurring" },
  { icon: Target, label: "Budgets", path: "/dashboard/budgets" },
  { icon: TrendingUp, label: "Investments", path: "/dashboard/investments" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  { icon: HelpCircle, label: "Contact Us", path: "/dashboard/contact" },
];

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
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      toast.info("Session expired due to inactivity");
      handleLogout();
    }, IDLE_TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    resetIdleTimer();

    const handler = () => resetIdleTimer();
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handler, { passive: true });
    }

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handler);
      }
    };
  }, [resetIdleTimer]);

  // ---------------------------------------------------------------------------
  // Auth Check & Load User Name
  // ---------------------------------------------------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please login to continue");
        router.push("/login");
      } else {
        setIsLoading(false);
        getUserSettings().then((result) => {
          if (result.success && result.data?.first_name) {
            setUserName(result.data.first_name);
          }
        });
      }
    });
  }, [router]);

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

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
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.label} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start cursor-pointer"
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
              className="w-full justify-start text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
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
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link key={item.label} href={item.path} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start cursor-pointer"
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
                className="w-full justify-start text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
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
            <div className="hidden sm:block">
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
