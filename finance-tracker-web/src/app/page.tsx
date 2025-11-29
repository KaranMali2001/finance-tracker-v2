import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">Finance Tracker</h1>
          </div>
          <Link href="/sign-in">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Take Control of Your
              <span className="block text-primary">Personal Finances</span>
          </h1>
            <p className="mb-10 text-lg leading-8 text-muted-foreground sm:text-xl">
              Track, analyze, and manage your personal finances with automated SMS transaction
              processing and comprehensive analytics. Stay on top of your spending and make
              informed financial decisions.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/sign-in">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-muted/30 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-12 text-center text-3xl font-bold text-foreground sm:text-4xl">
                Why Choose Finance Tracker?
              </h2>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="mb-4 text-3xl">📊</div>
                  <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                    Automated Tracking
                  </h3>
                  <p className="text-muted-foreground">
                    Automatically process transactions from SMS notifications and keep your
                    finances up to date without manual entry.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="mb-4 text-3xl">📈</div>
                  <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                    Comprehensive Analytics
                  </h3>
                  <p className="text-muted-foreground">
                    Get detailed insights into your spending patterns, income trends, and financial
                    health with beautiful visualizations.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="mb-4 text-3xl">🔒</div>
                  <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                    Secure & Private
                  </h3>
                  <p className="text-muted-foreground">
                    Your financial data is encrypted and stored securely. We prioritize your
                    privacy and data protection.
          </p>
        </div>
              </div>
            </div>
        </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Finance Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
