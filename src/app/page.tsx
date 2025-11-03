import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, PieChart, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Finance Tracker</h1>
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Sign up</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main role="main">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4 max-w-3xl">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                Take Control of Your{" "}
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  Financial Future
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Track expenses, manage accounts, and gain powerful insights into your spending habits with our intelligent finance tracker.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <h3 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your finances
          </h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-600/10 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <h4 className="text-xl font-semibold">Multiple Accounts</h4>
                  <p className="text-muted-foreground">
                    Manage all your bank accounts in one place with real-time balance tracking.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-green-600/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <h4 className="text-xl font-semibold">Smart Insights</h4>
                  <p className="text-muted-foreground">
                    Get detailed reports and visualizations to understand your spending patterns.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-violet-600/10 flex items-center justify-center">
                    <PieChart className="h-6 w-6 text-violet-600" aria-hidden="true" />
                  </div>
                  <h4 className="text-xl font-semibold">Auto-Categorization</h4>
                  <p className="text-muted-foreground">
                    Automatically categorize transactions with AI-powered rules and patterns.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-orange-600/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-orange-600" aria-hidden="true" />
                  </div>
                  <h4 className="text-xl font-semibold">Secure & Private</h4>
                  <p className="text-muted-foreground">
                    Your financial data is encrypted and secured with industry-standard practices.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <Card className="bg-gradient-to-r from-blue-600 to-violet-600 border-0">
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center space-y-6">
                <h3 className="text-3xl md:text-4xl font-bold text-white">
                  Ready to get started?
                </h3>
                <p className="text-xl text-blue-50 max-w-2xl">
                  Join thousands of users who are already taking control of their finances.
                </p>
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    Create Free Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            2025 Finance Tracker. Built with Next.js and Prisma.
          </p>
        </div>
      </footer>
    </div>
  );
}
