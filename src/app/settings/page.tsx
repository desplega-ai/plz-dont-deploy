"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [magicLinkEnabled, setMagicLinkEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch user settings
    async function fetchSettings() {
      try {
        const response = await fetch("/api/user/settings");
        if (response.ok) {
          const data = await response.json();
          setMagicLinkEnabled(data.magicLinkEnabled || false);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleMagicLinkToggle = async (enabled: boolean) => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ magicLinkEnabled: enabled }),
      });

      if (response.ok) {
        setMagicLinkEnabled(enabled);
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky-header" role="banner">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" aria-label="Back to Dashboard">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
          <div />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl" role="main">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="magic-link">Magic Link Login</Label>
                <p id="magic-link-description" className="text-sm text-muted-foreground">
                  Enable password-less login via email
                </p>
              </div>
              <Switch
                id="magic-link"
                checked={magicLinkEnabled}
                onCheckedChange={handleMagicLinkToggle}
                disabled={loading || saving}
                aria-describedby="magic-link-description"
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
