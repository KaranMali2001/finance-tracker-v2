import Link from 'next/link';
import { Button } from '@/components/ui/button';

const APK_URL =
  'https://github.com/KaranMali2001/finance-tracker-v2/releases/download/v1.0.0/app-arm64-v8a-release.apk';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">Wealth Reserve</h1>
          </div>
          <Link href="/sign-in">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Take Control of Your
              <span className="block text-primary">Personal Finances</span>
            </h1>
            <p className="mb-10 text-lg leading-8 text-muted-foreground sm:text-xl">
              Track, analyze, and manage your personal finances with automated SMS transaction
              processing and comprehensive analytics. Stay on top of your spending and make informed
              financial decisions.
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

        {/* Android App Download Section */}
        <section className="border-t border-border py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <div className="mb-4 text-5xl">📱</div>
              <h2 className="mb-3 text-2xl font-bold text-card-foreground">Get the Android App</h2>
              <p className="mb-6 text-muted-foreground">
                Automatically capture bank transactions from SMS in the background — even when the
                app is closed. Works with all major Indian banks.
              </p>
              <a href={APK_URL} download>
                <Button size="lg" className="w-full sm:w-auto">
                  Download for Android
                </Button>
              </a>
              <p className="mt-4 text-xs text-muted-foreground">
                Version 1.0.0 · Android 7.0+ · 64-bit devices
              </p>
              <div className="mt-6 rounded-lg bg-muted/50 p-4 text-left text-sm text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">Installation steps:</p>
                <ol className="list-inside list-decimal space-y-1">
                  <li>Download the APK file</li>
                  <li>Go to Settings → Apps → Special access → Install unknown apps</li>
                  <li>Allow your browser to install apps</li>
                  <li>Open the downloaded file and tap Install</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-muted/30 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-12 text-center text-3xl font-bold text-foreground sm:text-4xl">
                Why Choose Wealth Reserve?
              </h2>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="mb-4 text-3xl">📊</div>
                  <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                    Automated Tracking
                  </h3>
                  <p className="text-muted-foreground">
                    Automatically process transactions from SMS notifications and keep your finances
                    up to date without manual entry.
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
                    Your financial data is encrypted and stored securely. We prioritize your privacy
                    and data protection.
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
          <p>© {new Date().getFullYear()} Wealth Reserve. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
