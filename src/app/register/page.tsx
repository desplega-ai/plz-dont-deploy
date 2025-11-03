"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to register");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Finance Tracker</h1>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </header>

        {/* Success State */}
        <div className="flex items-center justify-center min-h-[calc(100vh-73px)] p-8">
          <Card className="w-full max-w-md border-2 text-center">
            <CardHeader className="space-y-4 pb-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mx-auto">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Check your email</CardTitle>
              <CardDescription className="text-base">
                We've sent you a verification link. Please check your email to verify your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/login" className="block">
                <Button className="w-full h-11">Go to Login</Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Didn't receive the email?{" "}
                <button className="text-primary font-semibold hover:underline">
                  Resend
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Finance Tracker</h1>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Split Layout */}
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-73px)]">
        {/* Left Side - Features */}
        <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 p-12">
          <div className="max-w-md space-y-8">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mx-auto">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold text-foreground">
                Start your financial journey today
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of users who are taking control of their finances with our powerful tools.
              </p>
            </div>
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Track Everything</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage multiple accounts and track all transactions in one place
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Smart Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered categorization and detailed spending reports
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is encrypted and protected with industry standards
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center p-8" role="main">
          <Card className="w-full max-w-md border-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
              <CardDescription className="text-base">
                Enter your information to get started
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div
                    id="register-error"
                    role="alert"
                    aria-live="polite"
                    className="rounded-lg bg-destructive/15 border border-destructive/20 p-3 text-sm text-destructive"
                  >
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? "register-error" : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={8}
                    className="h-11"
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? "register-error" : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? "register-error" : undefined}
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
