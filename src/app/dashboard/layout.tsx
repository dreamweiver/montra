// // // // src/app/dashboard/layout.tsx

// // // import Link from 'next/link'
// // // import { Button } from '@/components/ui/button'
// // // import { LogOut } from 'lucide-react'
// // // import {useRouter, useSearchParams} from 'next/navigation';
// // // import {useEffect,useState} from 'react';
// // // import { supabase } from '@/lib/supabase';
// // // import { toast } from 'sonner'; 

// // // export default function DashboardLayout({
// // //   children,
// // // }: {
// // //   children: React.ReactNode
// // // }) {
// // //   debugger;
// // // const router = useRouter();
// // //   const [isLoading, setIsLoading] = useState(true);

// // //   useEffect(() => {
// // //     let isMounted = true;

// // //     const checkAuth = async () => {
// // //       const { data: { session } } = await supabase.auth.getSession();

// // //       if (!session && isMounted) {
// // //         toast.error("Please log in to continue");
// // //         router.push("/login");
// // //         return;
// // //       }

// // //       if (isMounted) {
// // //         setIsLoading(false);
// // //       }
// // //     };

// // //     checkAuth();

// // //     return () => {
// // //       isMounted = false;
// // //     };
// // //   }, [router]);

// // //   if (isLoading) {
// // //     return (
// // //       <div className="flex min-h-screen items-center justify-center">
// // //         <p className="text-lg">Loading...</p>
// // //       </div>
// // //     );
// // //   }

// // //   if (isLoading) {
// // //     return (
// // //       <div className="flex min-h-screen items-center justify-center">
// // //         <p className="text-lg text-muted-foreground">Loading dashboard...</p>
// // //       </div>
// // //     );
// // //   }

// // //   // Logout Server Action
// // //   const handleLogout = async () => {
// // //     'use server'

// // //     const { createServerClient } = await import('@supabase/ssr')
// // //     const { cookies } = await import('next/headers')

// // //     const cookieStore = await cookies()

// // //     const supabase = createServerClient(
// // //       process.env.NEXT_PUBLIC_SUPABASE_URL!,
// // //       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
// // //       {
// // //         cookies: {
// // //           getAll() {
// // //             return cookieStore.getAll()
// // //           },
// // //           setAll(cookiesToSet) {
// // //             try {
// // //               cookiesToSet.forEach(({ name, value, options }) =>
// // //                 cookieStore.set(name, value, options)
// // //               )
// // //             } catch {
// // //               // Ignore in server actions
// // //             }
// // //           },
// // //         },
// // //       }
// // //     )

// // //     await supabase.auth.signOut()
// // //     return Response.redirect(new URL('/login', 'http://localhost:3000'))
// // //   }

// // //   return (
// // //     <div className="flex min-h-screen flex-col">
// // //       {/* Header / Navbar */}
// // //       <header className="border-b bg-background sticky top-0 z-10">
// // //         <div className="container mx-auto flex h-16 items-center justify-between px-4">
// // //           <div className="text-xl font-bold">
// // //             <Link href="/dashboard">Finance Tracker</Link>
// // //           </div>

// // //           <div className="flex items-center gap-4">
// // //             {/* We'll fetch user email client-side later if needed */}
// // //             <form action={handleLogout}>
// // //               <Button variant="outline" size="sm" type="submit">
// // //                 <LogOut className="mr-2 h-4 w-4" />
// // //                 Logout
// // //               </Button>
// // //             </form>
// // //           </div>
// // //         </div>
// // //       </header>

// // //       {/* Main content */}
// // //       <main className="flex-1 container mx-auto px-4 py-8">
// // //         {children}
// // //       </main>
// // //     </div>
// // //   )
// // // }

// // // "use client";

// // // import { useEffect, useState } from "react";
// // // import { useRouter } from "next/navigation";
// // // import { supabase } from "@/lib/supabase";
// // // import { toast } from "sonner";

// // // export default function DashboardLayout({
// // //   children,
// // // }: {
// // //   children: React.ReactNode;
// // // }) {
// // //   debugger;
// // //   const router = useRouter();
// // //   const [isChecking, setIsChecking] = useState(true);

// // //   useEffect(() => {
// // //     const checkSession = async () => {
// // //       try {
// // //         const { data: { session }, error } = await supabase.auth.getSession();

// // //         if (error || !session) {
// // //           toast.error("Session expired. Please login again.");
// // //           router.push("/login");
// // //           return;
// // //         }

// // //         // Session is valid
// // //         setIsChecking(false);
// // //       } catch (err) {
// // //         toast.error("Something went wrong");
// // //         router.push("/login");
// // //       }
// // //     };

// // //     checkSession();
// // //   }, [router]);

// // //   if (isChecking) {
// // //     return (
// // //       <div className="flex min-h-screen items-center justify-center">
// // //         <p className="text-lg text-muted-foreground">Checking authentication...</p>
// // //       </div>
// // //     );
// // //   }

// // //   return <>{children}</>;
// // // }

// // "use client";

// // import { useEffect, useState } from "react";
// // import { useRouter } from "next/navigation";
// // import { supabase } from "@/lib/supabase";
// // import { toast } from "sonner";

// // export default function DashboardLayout({
// //   children,
// // }: {
// //   children: React.ReactNode;
// // }) {
// //   const router = useRouter();
// //   const [isLoading, setIsLoading] = useState(true);

// //   useEffect(() => {
// //     const verifySession = async () => {
// //       try {
// //         const { data: { session }, error } = await supabase.auth.getSession();

// //         if (error || !session) {
// //           console.log("No active session found");
// //           toast.error("Please login to access dashboard");
// //           router.push("/login");
// //           return;
// //         }

// //         console.log("Session verified successfully");
// //         setIsLoading(false);
// //       } catch (err) {
// //         console.error("Session check failed:", err);
// //         router.push("/login");
// //       }
// //     };

// //     verifySession();
// //   }, [router]);

// //   if (isLoading) {
// //     return (
// //       <div className="flex min-h-screen items-center justify-center bg-background">
// //         <div className="text-center">
// //           <p className="text-lg">Verifying your session...</p>
// //           <p className="text-sm text-muted-foreground mt-2">Please wait</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return <>{children}</>;
// // }


// "use client";

// import Link from 'next/link'
// import { Button } from '@/components/ui/button'
// import { LogOut } from 'lucide-react'
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabase";
// import { toast } from "sonner";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       if (!session) {
//         toast.error("Please login to continue");
//         router.push("/login");
//       } else {
//         setLoading(false);
//       }
//     });
//   }, [router]);

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <p>Loading...</p>
//       </div>
//     );
//   }

//     //   const handleLogout = async () => {
//     //   const { createServerClient } = await import('@supabase/ssr')
//     //   const { cookies } = await import('next/headers')

//     //   const cookieStore = await cookies()

//     //   // const supabase = createServerClient(
//     //   //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     //   //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     //   //   {
//     //   //     cookies: {
//     //   //       getAll() {
//     //   //         return cookieStore.getAll()
//     //   //       },
//     //   //       setAll(cookiesToSet) {
//     //   //         try {
//     //   //           cookiesToSet.forEach(({ name, value, options }) =>
//     //   //             cookieStore.set(name, value, options)
//     //   //           )
//     //   //         } catch {
//     //   //            // Ignore in server actions
//     //   //         }
//     //   //       },
//     //   //     },
//     //   //   }
//     //   // )

//     //   await supabase.auth.signOut()
//     //   return Response.redirect(new URL('/login', 'http:localhost:3000'))
//     // }

//     const handleLogout = async () => {
//     try {
//       const { error } = await supabase.auth.signOut();

//       if (error) {
//         toast.error("Logout failed", {
//           description: error.message,
//         });
//         return;
//       }

//       toast.success("Logged out successfully", {
//         description: "See you next time!",
//       });

//       // Clean redirect to login page
//       router.push("/login");
//       router.refresh();        // Important: Refresh auth state

//     } catch (err) {
//       toast.error("Something went wrong while logging out");
//       console.error(err);
//     }
//   };

//   return (
//       <div className="flex min-h-screen flex-col">
//         {/* Header / Navbar */}
//         <header className="border-b bg-background sticky top-0 z-10">
//           <div className="container mx-auto flex h-16 items-center justify-between px-4">
//             <div className="text-xl font-bold">
//               <Link href="/dashboard">Finance Tracker</Link>
//             </div>

//             <div className="flex items-center gap-4">
//               {/* We'll fetch user email client-side later if needed */}
//               <form action={handleLogout}>
//                 <Button variant="outline" size="sm" type="submit">
//                   <LogOut className="mr-2 h-4 w-4" />
//                   Logout
//                 </Button>
//               </form>
//             </div>
//           </div>
//         </header>

//         {/* Main content */}
//         <main className="flex-1 container mx-auto px-4 py-8">
//           {children}
//         </main>
//       </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut, Home, CreditCard, TrendingUp, Settings, Menu, FolderOpen, CalendarClock, Target, X } from "lucide-react";
import { ThemeToggle, BudgetIndicator } from "@/components/shared";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please login to continue");
        router.push("/login");
      } else {
        setIsLoading(false);
      }
    });
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: CreditCard, label: "Transactions", path: "/dashboard/transactions" },
    { icon: FolderOpen, label: "Categories", path: "/dashboard/categories" },
    { icon: CalendarClock, label: "Recurring", path: "/dashboard/recurring" },
    { icon: Target, label: "Budgets", path: "/dashboard/budgets" },
    { icon: TrendingUp, label: "Investments", path: "/dashboard/investments" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  const handleNavClick = (path: string, closeMobile?: boolean) => {
    if (path) router.push(path);
    if (closeMobile) setMobileMenuOpen(false);
  };

  const handleMenuToggle = () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setMobileMenuOpen(true);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className={`hidden md:block border-r bg-card transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex h-full flex-col">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold tracking-tight">
              {sidebarOpen ? "Finance" : "F"}
            </h2>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start cursor-pointer"
                onClick={() => handleNavClick(item.path)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {sidebarOpen && item.label}
              </Button>
            ))}
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
              <h2 className="text-2xl font-bold tracking-tight">Finance</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start cursor-pointer"
                  onClick={() => handleNavClick(item.path, true)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Button>
              ))}
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
              Welcome back
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