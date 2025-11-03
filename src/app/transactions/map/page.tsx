"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, MapPin } from "lucide-react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/TransactionMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center bg-muted rounded-lg">
      <div className="text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  ),
});

interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: string;
  description: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  category?: {
    name: string;
    color: string;
  };
}

export default function TransactionsMapPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions?limit=1000");
      if (response.ok) {
        const data = await response.json();
        // Extract transactions from the response object
        const allTransactions = data.transactions || [];
        // Filter only transactions with location data
        const transactionsWithLocation = allTransactions.filter(
          (t: Transaction) => t.latitude && t.longitude
        );
        setTransactions(transactionsWithLocation);
      } else {
        toast.error("Failed to load transactions");
      }
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky-header">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/transactions">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Transactions
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Transaction Map</h1>
          <div />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Transaction Locations</h2>
              <p className="text-muted-foreground">
                Visualize where your money is spent with an interactive heatmap
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {transactions.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {transactions.length === 1 ? 'transaction' : 'transactions'} with location
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[600px] w-full" />
            </CardContent>
          </Card>
        ) : transactions.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Location Data</h3>
            <p className="text-muted-foreground mb-4">
              No transactions with location information found. Add location data to your
              transactions to see them on the map.
            </p>
            <Link href="/transactions">
              <Button>Go to Transactions</Button>
            </Link>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Interactive Heatmap</CardTitle>
              <CardDescription>
                Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} with location data.
                Brighter areas indicate more spending activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Map transactions={transactions} />
            </CardContent>
          </Card>
        )}

        {transactions.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {transactions
                    .filter((t) => t.type === "DEBIT")
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                    .toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {transactions.filter((t) => t.type === "DEBIT").length} expense transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Unique Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    new Set(
                      transactions
                        .filter((t) => t.locationName)
                        .map((t) => t.locationName)
                    ).size
                  }
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Different places you've spent money
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const categoryCount = transactions.reduce((acc, t) => {
                    const cat = t.category?.name || "Uncategorized";
                    acc[cat] = (acc[cat] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);

                  const topCategory = Object.entries(categoryCount).sort(
                    ([, a], [, b]) => b - a
                  )[0];

                  return (
                    <>
                      <div className="text-2xl font-bold">
                        {topCategory?.[0] || "None"}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {topCategory?.[1] || 0} transaction{topCategory?.[1] !== 1 ? 's' : ''}
                      </p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
