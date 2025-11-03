"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Trash2, ExternalLink } from "lucide-react";

interface BankAccount {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
  _count?: {
    transactions: number;
  };
}

function AccountsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionParam = searchParams.get("action");
  const highlightParam = searchParams.get("highlight");

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "checking",
    currency: "USD",
    balance: "0",
    description: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    type: "checking",
    currency: "USD",
    balance: "0",
    description: "",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Handle action query param from command palette
  useEffect(() => {
    if (actionParam === "new") {
      setOpen(true);
      // Clear the action param from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");
      router.replace(`/accounts?${params.toString()}`);
    }
  }, [actionParam, router, searchParams]);

  // Handle highlight query param from command palette
  useEffect(() => {
    if (highlightParam && accounts.length > 0) {
      // Find and scroll to the highlighted account
      const element = document.getElementById(`account-${highlightParam}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add a temporary highlight effect
        element.classList.add("ring-2", "ring-primary");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-primary");
        }, 2000);
      }
    }
  }, [highlightParam, accounts]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          balance: parseFloat(formData.balance),
        }),
      });

      if (response.ok) {
        toast.success("Account created successfully");
        setOpen(false);
        setFormData({ name: "", type: "checking", currency: "USD", balance: "0", description: "" });
        fetchAccounts();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create account");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleAccountClick = (account: BankAccount) => {
    setSelectedAccount(account);
    setEditFormData({
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: account.balance.toString(),
      description: "",
    });
    setSheetOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    try {
      const response = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          balance: parseFloat(editFormData.balance),
        }),
      });

      if (response.ok) {
        toast.success("Account updated successfully");
        setSheetOpen(false);
        setSelectedAccount(null);
        fetchAccounts();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update account");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const confirmDeleteAccount = (accountId: string) => {
    setAccountToDelete(accountId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (accountId: string) => {
    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Account deleted successfully");
        setDeleteDialogOpen(false);
        setAccountToDelete(null);
        setSheetOpen(false);
        setSelectedAccount(null);
        fetchAccounts();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete account");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleViewTransactions = () => {
    if (selectedAccount) {
      router.push(`/transactions?accountId=${selectedAccount.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky-header" role="banner">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" aria-label="Back to Dashboard">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-2xl font-bold">Bank Accounts</h1>
          <div />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8" role="main">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Your Accounts</h2>
            <p className="text-muted-foreground">Manage your bank accounts and balances</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Account</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add Bank Account</DialogTitle>
                  <DialogDescription>
                    Create a new bank account to track your transactions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Account Name</Label>
                    <Input
                      id="name"
                      placeholder="My Checking Account"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Account Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="credit">Credit Card</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="JPY">JPY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="balance">Initial Balance</Label>
                      <Input
                        id="balance"
                        type="number"
                        step="0.01"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Account</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-live="polite" aria-label="Loading accounts">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" aria-label="Loading account name" />
                  <Skeleton className="h-4 w-24" aria-label="Loading account type" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-40" aria-label="Loading account balance" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No accounts yet. Create your first account to get started!</p>
            <Button onClick={() => setOpen(true)}>Add Your First Account</Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <Card
                key={account.id}
                id={`account-${account.id}`}
                className="cursor-pointer hover:border-primary transition-all duration-200"
                onClick={() => handleAccountClick(account)}
              >
                <CardHeader>
                  <CardTitle>{account.name}</CardTitle>
                  <CardDescription className="capitalize">{account.type} • {account.currency}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {account.currency} {account.balance.toFixed(2)}
                  </div>
                  {account._count && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {account._count.transactions} transactions
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Account Details/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[900px] overflow-y-auto">
          {selectedAccount && (
            <form onSubmit={handleUpdate}>
              <SheetHeader>
                <SheetTitle>Account Details</SheetTitle>
                <SheetDescription>
                  View and edit your account information
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 py-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Account Name</Label>
                    <Input
                      id="edit-name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Account Type</Label>
                    <Select
                      value={editFormData.type}
                      onValueChange={(value) => setEditFormData({ ...editFormData, type: value })}
                    >
                      <SelectTrigger id="edit-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="credit">Credit Card</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-currency">Currency</Label>
                      <Select
                        value={editFormData.currency}
                        onValueChange={(value) => setEditFormData({ ...editFormData, currency: value })}
                      >
                        <SelectTrigger id="edit-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="JPY">JPY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-balance">Current Balance</Label>
                      <Input
                        id="edit-balance"
                        type="number"
                        step="0.01"
                        value={editFormData.balance}
                        onChange={(e) => setEditFormData({ ...editFormData, balance: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Transactions:</span>
                        <span className="font-medium">{selectedAccount._count?.transactions || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleViewTransactions}
                    className="w-full"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View All Transactions
                  </Button>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSheetOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => confirmDeleteAccount(selectedAccount.id)}
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => accountToDelete && handleDelete(accountToDelete)}
        title="Delete Account"
        description={
          selectedAccount && selectedAccount._count
            ? `Are you sure you want to delete this account? This will affect ${selectedAccount._count.transactions} transaction(s). This action cannot be undone.`
            : "Are you sure you want to delete this account? This action cannot be undone."
        }
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <AccountsPageContent />
    </Suspense>
  );
}
