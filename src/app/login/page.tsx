"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Leaf, Mail, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to login");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/magic-link/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send magic link");
        return;
      }

      setSuccess(data.message || "Magic link sent! Check your email.");
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = useMagicLink ? handleMagicLinkRequest : handlePasswordLogin;

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
        {/* Left Side - Image/Quote */}
        <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 p-12">
          <div className="max-w-md space-y-8">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mx-auto">
              <Leaf className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-4 text-center">
              <blockquote className="text-2xl font-serif italic text-foreground/90">
                "Finance Tracker has completely transformed how I manage my money. I finally have clarity on where every dollar goes."
              </blockquote>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Sarah Johnson</p>
                <p className="text-sm text-muted-foreground">Small Business Owner</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">99%</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center p-8" role="main">
          <Card className="w-full max-w-md border-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
              <CardDescription className="text-base">
                {useMagicLink
                  ? "Enter your email to receive a magic link"
                  : "Enter your credentials to access your account"
                }
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div
                    id="login-error"
                    role="alert"
                    aria-live="polite"
                    className="rounded-lg bg-destructive/15 border border-destructive/20 p-3 text-sm text-destructive"
                  >
                    {error}
                  </div>
                )}
                {success && (
                  <div
                    id="login-success"
                    role="alert"
                    aria-live="polite"
                    className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-800 dark:text-green-200 flex items-start gap-2"
                  >
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{success}</span>
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
                    aria-describedby={error ? "login-error" : undefined}
                  />
                </div>
                {!useMagicLink && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11"
                      aria-invalid={error ? "true" : "false"}
                      aria-describedby={error ? "login-error" : undefined}
                    />
                  </div>
                )}
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? (
                    useMagicLink ? "Sending link..." : "Logging in..."
                  ) : (
                    useMagicLink ? (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Magic Link
                      </>
                    ) : (
                      "Login"
                    )
                  )}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setUseMagicLink(!useMagicLink);
                      setError("");
                      setSuccess("");
                    }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {useMagicLink ? "Use password instead" : "Use magic link instead"}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary font-semibold hover:underline">
                    Sign up
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
