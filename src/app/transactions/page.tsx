"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Trash2, Upload, MapPin, Eye, Search, FileText } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSearchParams, useRouter } from "next/navigation";
import dynamicImport from "next/dynamic";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const SingleTransactionMap = dynamicImport(() => import("@/components/SingleTransactionMap"), {
  ssr: false,
});

interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: string;
  description: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  isRecurring: boolean;
  recurringFrequency?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  bankAccount: {
    id: string;
    name: string;
    currency: string;
  };
}

interface BankAccount {
  id: string;
  name: string;
  currency: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

function TransactionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read all filters from URL params
  const accountIdParam = searchParams.get("accountId");
  const searchQueryParam = searchParams.get("search");
  const categoryParam = searchParams.get("category");
  const typeParam = searchParams.get("type");
  const dateFromParam = searchParams.get("dateFrom");
  const dateToParam = searchParams.get("dateTo");
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");
  const actionParam = searchParams.get("action");
  const highlightParam = searchParams.get("highlight");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>(accountIdParam || "__all__");
  const [searchQuery, setSearchQuery] = useState(searchQueryParam || "");
  const [searchInput, setSearchInput] = useState(searchQueryParam || ""); // Immediate input value
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "__all__");
  const [selectedType, setSelectedType] = useState<string>(typeParam || "__all__");
  const [dateFrom, setDateFrom] = useState(dateFromParam || "");
  const [dateTo, setDateTo] = useState(dateToParam || "");
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [locationSearchResults, setLocationSearchResults] = useState<any[]>([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [page, setPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [pageSize, setPageSize] = useState(pageSizeParam ? parseInt(pageSizeParam) : 20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    bankAccountId: accountIdParam || "",
    amount: "",
    type: "debit",
    date: new Date().toISOString().split("T")[0],
    description: "",
    categoryId: "",
    isRecurring: false,
    recurringFrequency: "",
    locationName: "",
  });

  const [importData, setImportData] = useState({
    bankAccountId: accountIdParam || "",
    csvFile: null as File | null,
    csvData: "",
    defaultType: "debit",
  });

  // Function to update URL with current filter state
  const updateURL = useCallback((filters: {
    accountId?: string;
    search?: string;
    category?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const params = new URLSearchParams();

    const account = filters.accountId ?? selectedAccount;
    const search = filters.search ?? searchQuery;
    const category = filters.category ?? selectedCategory;
    const type = filters.type ?? selectedType;
    const from = filters.dateFrom ?? dateFrom;
    const to = filters.dateTo ?? dateTo;
    const pg = filters.page ?? page;
    const size = filters.pageSize ?? pageSize;

    if (account && account !== "__all__") params.set("accountId", account);
    if (search) params.set("search", search);
    if (category && category !== "__all__") params.set("category", category);
    if (type && type !== "__all__") params.set("type", type);
    if (from) params.set("dateFrom", from);
    if (to) params.set("dateTo", to);
    if (pg > 1) params.set("page", pg.toString());
    if (size !== 20) params.set("pageSize", size.toString());

    router.replace(`/transactions?${params.toString()}`);
  }, [router, selectedAccount, searchQuery, selectedCategory, selectedType, dateFrom, dateTo, page, pageSize]);

  // Debounce search input
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
        setPage(1);
        updateURL({ search: searchInput, page: 1 });
      }
    }, 500); // 500ms delay

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInput]);

  useEffect(() => {
    fetchAccounts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchTransactions();
    }
  }, [selectedAccount, accounts, page, pageSize]);

  // Handle action query param from command palette
  useEffect(() => {
    if (actionParam === "new") {
      setOpen(true);
      // Clear the action param from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");
      router.replace(`/transactions?${params.toString()}`);
    } else if (actionParam === "import") {
      setImportOpen(true);
      // Clear the action param from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");
      router.replace(`/transactions?${params.toString()}`);
    }
  }, [actionParam, router, searchParams]);

  // Handle highlight query param from command palette
  useEffect(() => {
    if (highlightParam && transactions.length > 0) {
      // Find and scroll to the highlighted transaction
      const element = document.getElementById(`transaction-${highlightParam}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add a temporary highlight effect
        element.classList.add("ring-2", "ring-primary");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-primary");
        }, 2000);
      }
    }
  }, [highlightParam, transactions]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
        if (!selectedAccount && data.length > 0) {
          setSelectedAccount(accountIdParam || data[0].id);
        }
      }
    } catch (error) {
      toast.error("Failed to load accounts");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || data);
      }
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedAccount && selectedAccount !== "__all__") {
        params.append("accountId", selectedAccount);
      }
      params.append("page", page.toString());
      params.append("limit", pageSize.toString());

      const response = await fetch(`/api/transactions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalTransactions(data.pagination.total || 0);
        }
      }
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        latitude: mapLocation?.lat,
        longitude: mapLocation?.lng,
        categoryId: formData.categoryId === "__none__" ? undefined : formData.categoryId || undefined,
        recurringFrequency: formData.isRecurring ? formData.recurringFrequency : undefined,
      };

      const url = editingId ? `/api/transactions/${editingId}` : "/api/transactions";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingId ? "Transaction updated successfully" : "Transaction created successfully");
        setOpen(false);
        setEditingId(null);
        setFormData({
          bankAccountId: selectedAccount !== "__all__" ? selectedAccount : "",
          amount: "",
          type: "debit",
          date: new Date().toISOString().split("T")[0],
          description: "",
          categoryId: "",
          isRecurring: false,
          recurringFrequency: "",
          locationName: "",
        });
        setMapLocation(null);
        fetchTransactions();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save transaction");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const confirmDeleteTransaction = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;

    try {
      const response = await fetch(`/api/transactions/${transactionToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Transaction deleted successfully");
        setDeleteDialogOpen(false);
        setTransactionToDelete(null);
        fetchTransactions();
      } else {
        toast.error("Failed to delete transaction");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importData.csvFile) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvData = event.target?.result as string;

        const response = await fetch("/api/transactions/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bankAccountId: importData.bankAccountId,
            csvData,
            defaultType: importData.defaultType.toUpperCase(),
            // No columnMapping needed - backend will auto-detect columns
          }),
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(`Imported ${result.imported} transactions successfully`);
          setImportOpen(false);
          setImportData({ ...importData, csvFile: null, csvData: "" });
          fetchTransactions();
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to import transactions");
        }
      };
      reader.readAsText(importData.csvFile);
    } catch (error) {
      toast.error("An error occurred during import");
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMapLocation({ lat, lng });
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setViewingTransaction(transaction);
    setFormData({
      bankAccountId: transaction.bankAccount.id,
      amount: Math.abs(transaction.amount).toString(),
      type: transaction.type.toLowerCase(),
      date: new Date(transaction.date).toISOString().split("T")[0],
      description: transaction.description,
      categoryId: transaction.categoryId || "",
      isRecurring: transaction.isRecurring,
      recurringFrequency: transaction.recurringFrequency || "",
      locationName: transaction.locationName || "",
    });
    if (transaction.latitude && transaction.longitude) {
      setMapLocation({ lat: transaction.latitude, lng: transaction.longitude });
    }
    setViewOpen(true);
  };

  const handleLocationSearch = async () => {
    if (!locationSearch.trim()) {
      toast.error("Please enter a location to search");
      return;
    }

    setSearchingLocation(true);
    try {
      // Use our backend API to search for locations (proxies to Nominatim)
      const response = await fetch(
        `/api/location/search?q=${encodeURIComponent(locationSearch)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();

      if (results.length === 0) {
        toast.info("No locations found. Try a different search term.");
        setLocationSearchResults([]);
      } else {
        setLocationSearchResults(results);
        toast.success(`Found ${results.length} location${results.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error("Location search error:", error);
      toast.error("Failed to search location. Please try again.");
      setLocationSearchResults([]);
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMapLocation({ lat, lng });
    setFormData({ ...formData, locationName: result.display_name });
    setLocationSearchResults([]);
    setLocationSearch("");
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingTransaction) return;

    try {
      const response = await fetch(`/api/transactions/${viewingTransaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          type: formData.type.toUpperCase(),
          latitude: mapLocation?.lat,
          longitude: mapLocation?.lng,
          categoryId: formData.categoryId === "__none__" ? null : formData.categoryId || null,
          recurringFrequency: formData.isRecurring ? formData.recurringFrequency.toUpperCase() : null,
        }),
      });

      if (response.ok) {
        toast.success("Transaction updated successfully");
        setViewOpen(false);
        setViewingTransaction(null);
        setMapLocation(null);
        fetchTransactions();
      } else {
        toast.error("Failed to update transaction");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  // Filter transactions based on all criteria
  const filteredTransactions = transactions.filter((transaction) => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesDescription = transaction.description.toLowerCase().includes(query);
      const matchesAmount = transaction.amount.toString().includes(query);
      const matchesLocation = transaction.locationName?.toLowerCase().includes(query);
      if (!matchesDescription && !matchesAmount && !matchesLocation) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== "__all__") {
      if (transaction.categoryId !== selectedCategory) {
        return false;
      }
    }

    // Type filter
    if (selectedType !== "__all__") {
      if (transaction.type !== selectedType) {
        return false;
      }
    }

    // Date range filter
    if (dateFrom) {
      const transactionDate = new Date(transaction.date);
      const fromDate = new Date(dateFrom);
      if (transactionDate < fromDate) {
        return false;
      }
    }

    if (dateTo) {
      const transactionDate = new Date(transaction.date);
      const toDate = new Date(dateTo);
      // Set time to end of day for "to" date
      toDate.setHours(23, 59, 59, 999);
      if (transactionDate > toDate) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky-header" role="banner">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" aria-label="Back to Dashboard">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <div />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8" role="main">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Transaction History</h2>
            <p className="text-muted-foreground">Track and manage your financial transactions</p>
          </div>
          <div className="flex gap-2">
            <Link href="/transactions/map">
              <Button variant="outline">
                <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />
                View Map
              </Button>
            </Link>
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleImportCSV}>
                  <DialogHeader>
                    <DialogTitle>Import Transactions from CSV</DialogTitle>
                    <DialogDescription>
                      Our intelligent import automatically detects your CSV columns
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Collapsible CSV Format Guide */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="format-guide" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-semibold">CSV Format Guide</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2 text-sm">
                            <div>
                              <div className="font-semibold mb-2">Required Columns:</div>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li><code className="bg-muted px-1.5 py-0.5 rounded text-xs">date</code> - Transaction date (YYYY-MM-DD)</li>
                                <li><code className="bg-muted px-1.5 py-0.5 rounded text-xs">amount</code> - Transaction amount (positive or negative)</li>
                                <li><code className="bg-muted px-1.5 py-0.5 rounded text-xs">description</code> or <code className="bg-muted px-1.5 py-0.5 rounded text-xs">merchant</code> - What the transaction was for</li>
                              </ul>
                            </div>

                            <div>
                              <div className="font-semibold mb-2">Optional Columns:</div>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li><code className="bg-muted px-1.5 py-0.5 rounded text-xs">type</code> - credit/debit (auto-detected from amount if not provided)</li>
                                <li><code className="bg-muted px-1.5 py-0.5 rounded text-xs">latitude</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs">longitude</code> - Location coordinates</li>
                                <li><code className="bg-muted px-1.5 py-0.5 rounded text-xs">merchantName</code> or <code className="bg-muted px-1.5 py-0.5 rounded text-xs">location</code> - Location name</li>
                              </ul>
                            </div>

                            <div>
                              <div className="font-semibold mb-2">Example CSV:</div>
                              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto font-mono">
date,amount,description{"\n"}2025-01-15,45.50,Coffee at Main Street Cafe{"\n"}2025-01-16,-120.00,Grocery shopping{"\n"}2025-01-17,2500.00,Monthly salary deposit
                              </pre>
                            </div>

                            <div className="pt-1">
                              <a
                                href="/sample-data/basic-transactions.csv"
                                download
                                className="text-primary hover:underline text-xs inline-flex items-center gap-1"
                              >
                                <FileText className="h-3 w-3" />
                                Download sample CSV template
                              </a>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    <div className="space-y-2">
                      <Label htmlFor="import-account">Bank Account</Label>
                      <Select
                        value={importData.bankAccountId}
                        onValueChange={(value) => setImportData({ ...importData, bankAccountId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="csv-file">CSV File</Label>
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={(e) => setImportData({ ...importData, csvFile: e.target.files?.[0] || null })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default-type">Default Transaction Type</Label>
                      <Select
                        value={importData.defaultType}
                        onValueChange={(value) => setImportData({ ...importData, defaultType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debit">Debit (Expense)</SelectItem>
                          <SelectItem value="credit">Credit (Income)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setImportOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Import</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Add Transaction</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
                    <DialogDescription>
                      {editingId ? "Update transaction details" : "Create a new transaction"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="account">Bank Account</Label>
                      <Select
                        value={formData.bankAccountId}
                        onValueChange={(value) => setFormData({ ...formData, bankAccountId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} ({account.currency})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="100.00"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="debit">Debit (Expense)</SelectItem>
                            <SelectItem value="credit">Credit (Income)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="Coffee shop"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category (Optional)</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">None</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recurring"
                          checked={formData.isRecurring}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, isRecurring: checked as boolean })
                          }
                        />
                        <Label htmlFor="recurring">Recurring Transaction</Label>
                      </div>
                      {formData.isRecurring && (
                        <Select
                          value={formData.recurringFrequency}
                          onValueChange={(value) => setFormData({ ...formData, recurringFrequency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Location (Optional)
                      </Label>

                      {/* Location Search */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search for a location..."
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleLocationSearch();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleLocationSearch}
                          disabled={searchingLocation}
                        >
                          {searchingLocation ? (
                            <span className="h-4 w-4 animate-spin">⏳</span>
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Search Results */}
                      {locationSearchResults.length > 0 && (
                        <div className="border rounded-lg max-h-48 overflow-y-auto">
                          {locationSearchResults.map((result, index) => (
                            <div
                              key={index}
                              className="p-2 hover:bg-muted cursor-pointer text-sm border-b last:border-b-0"
                              onClick={() => handleSelectSearchResult(result)}
                            >
                              {result.display_name}
                            </div>
                          ))}
                        </div>
                      )}

                      <Input
                        id="location"
                        placeholder="Location name"
                        value={formData.locationName}
                        onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                      />

                      {mapLocation ? (
                        <div className="mt-2">
                          <SingleTransactionMap
                            latitude={mapLocation.lat}
                            longitude={mapLocation.lng}
                            description={formData.description || "New transaction"}
                            amount={parseFloat(formData.amount) || 0}
                            type={formData.type.toUpperCase()}
                            locationName={formData.locationName}
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            Location: {mapLocation.lat.toFixed(6)}, {mapLocation.lng.toFixed(6)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Search for a location above to add it to this transaction
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOpen(false);
                        setEditingId(null);
                        setMapLocation(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">{editingId ? "Update" : "Create"} Transaction</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative" role="search">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="search"
                    placeholder="Search description, amount, or location..."
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                    }}
                    className="pl-9"
                    aria-label="Search transactions by description, amount, or location"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="account-filter">Account</Label>
                <Select
                  value={selectedAccount}
                  onValueChange={(value) => {
                    setSelectedAccount(value);
                    setPage(1);
                    updateURL({ accountId: value, page: 1 });
                  }}
                >
                  <SelectTrigger id="account-filter">
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Accounts</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category-filter">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    updateURL({ category: value });
                  }}
                >
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type-filter">Type</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => {
                    setSelectedType(value);
                    updateURL({ type: value });
                  }}
                >
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Types</SelectItem>
                    <SelectItem value="DEBIT">Expense</SelectItem>
                    <SelectItem value="CREDIT">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="date-from">From Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDateFrom(value);
                    updateURL({ dateFrom: value });
                  }}
                />
              </div>

              <div>
                <Label htmlFor="date-to">To Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDateTo(value);
                    updateURL({ dateTo: value });
                  }}
                />
              </div>
            </div>

            {(searchQuery || selectedCategory !== "__all__" || selectedType !== "__all__" || dateFrom || dateTo) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                    setSelectedCategory("__all__");
                    setSelectedType("__all__");
                    setDateFrom("");
                    setDateTo("");
                    updateURL({
                      search: "",
                      category: "__all__",
                      type: "__all__",
                      dateFrom: "",
                      dateTo: "",
                    });
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4" aria-busy="true" aria-live="polite" aria-label="Loading transactions">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" aria-label="Loading transaction row" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : transactions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No transactions yet. Add your first transaction or import from CSV!
            </p>
            <Button onClick={() => setOpen(true)}>Add Your First Transaction</Button>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription aria-live="polite" aria-atomic="true">
                Showing page {page} of {totalPages} ({totalTransactions} total transactions)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table aria-label="Transaction history table">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Date</TableHead>
                    <TableHead scope="col">Description</TableHead>
                    <TableHead scope="col">Account</TableHead>
                    <TableHead scope="col">Category</TableHead>
                    <TableHead scope="col">Type</TableHead>
                    <TableHead scope="col" className="text-right">Amount</TableHead>
                    <TableHead scope="col" className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      id={`transaction-${transaction.id}`}
                      className="transition-all duration-200"
                    >
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.description}
                          {transaction.locationName && (
                            <div className="group relative">
                              <MapPin
                                className="h-4 w-4 text-primary cursor-help"
                                aria-label={`Location: ${transaction.locationName}`}
                                role="img"
                              />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                <div className="bg-popover text-popover-foreground text-xs rounded-lg p-2 shadow-lg border whitespace-nowrap">
                                  <div className="font-semibold">{transaction.locationName}</div>
                                  {transaction.latitude && transaction.longitude && (
                                    <div className="text-muted-foreground text-xs mt-1">
                                      {transaction.latitude.toFixed(4)}, {transaction.longitude.toFixed(4)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.bankAccount.name}</TableCell>
                      <TableCell>
                        {transaction.category ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: transaction.category.color }}
                              aria-hidden="true"
                            />
                            {transaction.category.name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Uncategorized</span>
                        )}
                      </TableCell>
                      <TableCell className="capitalize">{transaction.type}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            transaction.type === "CREDIT" ? "text-green-600" : "text-red-600"
                          }
                        >
                          {transaction.bankAccount.currency} {transaction.amount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTransaction(transaction)}
                            aria-label={`View and edit transaction: ${transaction.description}`}
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDeleteTransaction(transaction.id)}
                            aria-label={`Delete transaction: ${transaction.description}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Pagination Controls */}
        {!loading && transactions.length > 0 && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="page-size" className="text-sm">
                      Per page:
                    </Label>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        const size = parseInt(value);
                        setPageSize(size);
                        setPage(1);
                        updateURL({ pageSize: size, page: 1 });
                      }}
                    >
                      <SelectTrigger id="page-size" className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * pageSize + 1} to {Math.min((page - 1) * pageSize + transactions.length, totalTransactions)} of {totalTransactions} transactions
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPage = page - 1;
                      setPage(newPage);
                      updateURL({ page: newPage });
                    }}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPage = page + 1;
                      setPage(newPage);
                      updateURL({ page: newPage });
                    }}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* View/Edit Transaction Side Panel */}
        <Sheet open={viewOpen} onOpenChange={setViewOpen}>
          <SheetContent className="w-[900px] sm:max-w-[900px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Transaction Details</SheetTitle>
              <SheetDescription>
                View and edit transaction information
              </SheetDescription>
            </SheetHeader>

            <form
              onSubmit={handleUpdateTransaction}
              className="space-y-6 mt-6"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON') {
                  e.preventDefault();
                }
              }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="view-account">Bank Account</Label>
                  <Select
                    value={formData.bankAccountId}
                    onValueChange={(value) => setFormData({ ...formData, bankAccountId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="view-amount">Amount</Label>
                    <Input
                      id="view-amount"
                      type="number"
                      step="0.01"
                      placeholder="100.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="view-type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debit">Debit (Expense)</SelectItem>
                        <SelectItem value="credit">Credit (Income)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="view-date">Date</Label>
                  <Input
                    id="view-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="view-description">Description</Label>
                  <Input
                    id="view-description"
                    placeholder="Coffee shop"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="view-category">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="view-recurring"
                      checked={formData.isRecurring}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isRecurring: checked as boolean })
                      }
                    />
                    <Label htmlFor="view-recurring">Recurring Transaction</Label>
                  </div>
                  {formData.isRecurring && (
                    <Select
                      value={formData.recurringFrequency}
                      onValueChange={(value) => setFormData({ ...formData, recurringFrequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Location Section with Search */}
                <div className="space-y-2">
                  <Label>
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Location
                  </Label>

                  {/* Location Search */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search for a location..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleLocationSearch();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLocationSearch}
                      disabled={searchingLocation}
                    >
                      {searchingLocation ? (
                        <span className="h-4 w-4 animate-spin">⏳</span>
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Search Results */}
                  {locationSearchResults.length > 0 && (
                    <div className="border rounded-lg max-h-48 overflow-y-auto">
                      {locationSearchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-muted cursor-pointer text-sm border-b last:border-b-0"
                          onClick={() => handleSelectSearchResult(result)}
                        >
                          {result.display_name}
                        </div>
                      ))}
                    </div>
                  )}

                  <Input
                    placeholder="Location name"
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  />

                  {/* Transaction Map */}
                  {mapLocation && (
                    <div className="mt-2">
                      <SingleTransactionMap
                        latitude={mapLocation.lat}
                        longitude={mapLocation.lng}
                        description={formData.description}
                        amount={parseFloat(formData.amount) || 0}
                        type={formData.type.toUpperCase()}
                        locationName={formData.locationName}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Location: {mapLocation.lat.toFixed(6)}, {mapLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  )}

                  {!mapLocation && (
                    <p className="text-sm text-muted-foreground">
                      Search for a location above to add it to this transaction
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setViewOpen(false);
                    setViewingTransaction(null);
                    setMapLocation(null);
                    setLocationSearchResults([]);
                    setLocationSearch("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TransactionsPageContent />
    </Suspense>
  );
}
