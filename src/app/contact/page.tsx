import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ContactContent } from "@/components/features/contact";

// =============================================================================
// Public Contact Page (unauthenticated)
// =============================================================================
export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-gradient-to-b from-background to-muted/40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            Montra
          </Link>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 py-12 md:py-24">
        <div className="container mx-auto max-w-3xl px-4 space-y-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>

          <ContactContent />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>Montra &mdash; Track your money smarter</p>
      </footer>
    </div>
  );
}
