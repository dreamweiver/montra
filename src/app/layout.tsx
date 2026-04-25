import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Montra",
  description: "Montra (Money + Tracker) - Simple personal finance and investment tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <main className="min-h-screen bg-background antialiased">
            {children}
          </main>
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}