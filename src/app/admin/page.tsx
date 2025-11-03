"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users,
  Wallet,
  Receipt,
  FolderTree,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AdminStats {
  overview: {
    userCount: number;
    accountCount: number;
    transactionCount: number;
    categoryCount: number;
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
  };
  growth: {
    newUsersLast30Days: number;
    newTransactionsLast30Days: number;
  };
  usersByRole: Array<{
    role: string;
    _count: number;
  }>;
  transactionsByType: Array<{
    type: string;
    _count: number;
    _sum: {
      amount: number;
    };
  }>;
  recentUsers: Array<{
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
    _count: {
      bankAccounts: number;
      categories: number;
    };
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    date: string;
    description: string;
    category?: {
      name: string;
      color: string;
    };
    bankAccount: {
      name: string;
      userId: string;
    };
  }>;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 401) {
        toast.error("Unauthorized: Admin access required");
      } else {
        toast.error("Failed to load admin statistics");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky-header" role="banner">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" aria-label="Back to Dashboard">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Badge variant="destructive">ADMIN</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8" role="main">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">System Overview</h2>
          <p className="text-muted-foreground">Monitor platform statistics and activity</p>
        </div>

        {loading ? (
          <div className="space-y-6" aria-busy="true" aria-live="polite" aria-label="Loading admin statistics">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" aria-label="Loading statistics" />
            ))}
          </div>
        ) : !stats ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Failed to load admin statistics</p>
            <Button onClick={fetchStats} className="mt-4">
              Retry
            </Button>
          </Card>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.userCount}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.growth.newUsersLast30Days} in last 30 days
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bank Accounts</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.accountCount}</div>
                  <p className="text-xs text-muted-foreground">Across all users</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.transactionCount}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.growth.newTransactionsLast30Days} in last 30 days
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <FolderTree className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.categoryCount}</div>
                  <p className="text-xs text-muted-foreground">Created by users</p>
                </CardContent>
              </Card>
            </div>

            {/* Financial Overview */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.overview.totalIncome)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(stats.overview.totalExpenses)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Platform Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      stats.overview.netBalance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(stats.overview.netBalance)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
              {/* Users by Role */}
              <Card>
                <CardHeader>
                  <CardTitle>Users by Role</CardTitle>
                  <CardDescription>Distribution of user roles</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.usersByRole.length > 0 ? (
                    <div
                      role="img"
                      aria-label={`Pie chart showing distribution of users by role. ${stats.usersByRole.map(r => `${r.role}: ${r._count} users`).join(', ')}`}
                    >
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={stats.usersByRole.map((item) => ({
                              name: item.role,
                              value: item._count,
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {stats.usersByRole.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Transactions by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Transactions by Type</CardTitle>
                  <CardDescription>Credit vs Debit transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.transactionsByType.length > 0 ? (
                    <div
                      role="img"
                      aria-label={`Bar chart showing transaction counts by type. ${stats.transactionsByType.map(t => `${t.type}: ${t._count} transactions`).join(', ')}`}
                    >
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={stats.transactionsByType.map((item) => ({
                            type: item.type.toUpperCase(),
                            count: item._count,
                            total: item._sum.amount || 0,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="count" fill="#3b82f6" name="Count" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Users */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest registered users (emails redacted for privacy)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table aria-label="Recent users table">
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">Email</TableHead>
                      <TableHead scope="col">Role</TableHead>
                      <TableHead scope="col">Status</TableHead>
                      <TableHead scope="col">Accounts</TableHead>
                      <TableHead scope="col">Categories</TableHead>
                      <TableHead scope="col">Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "ADMIN" ? "destructive" : "default"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.emailVerified ? (
                            <Badge variant="outline" className="text-green-600">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{user._count.bankAccounts}</TableCell>
                        <TableCell>{user._count.categories}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest platform activity (user IDs redacted)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table aria-label="Recent transactions table">
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">Date</TableHead>
                      <TableHead scope="col">Description</TableHead>
                      <TableHead scope="col">Account</TableHead>
                      <TableHead scope="col">User</TableHead>
                      <TableHead scope="col">Category</TableHead>
                      <TableHead scope="col">Type</TableHead>
                      <TableHead scope="col" className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.bankAccount.name}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {transaction.bankAccount.userId}
                        </TableCell>
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
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="capitalize">{transaction.type}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              transaction.type === "credit" ? "text-green-600" : "text-red-600"
                            }
                          >
                            {transaction.type === "credit" ? "+" : "-"}
                            {formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
