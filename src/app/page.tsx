import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero section */}
      <header className="border-b bg-gradient-to-b from-background to-muted/40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-xl font-bold">Montra</div>
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

      {/* Main hero */}
      <section className="flex flex-1 items-center justify-center py-12 md:py-24">
        <div className="container px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Track your money smarter
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Simple, private, and powerful personal finance app.  
            Monitor income, expenses, investments — all in one place.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">Get Started — It&apos;s Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Already have an account? Log in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="border-t bg-muted/40 py-16 md:py-24">
        <div className="container px-4">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Why use Montra?
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Privacy First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your financial data stays private. No ads, no tracking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Simple & Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Add transactions in seconds. Beautiful charts and summaries.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Works Everywhere</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Responsive design — use on phone, tablet or desktop.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <Link href="/contact" className="hover:text-foreground hover:underline">
          Contact Us
        </Link>
      </footer>
    </div>
  );
}