"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { Eye, EyeOff, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";

interface DashboardData {
  user: {
    email: string;
    role: string;
  };
  summary: {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    accountCount: number;
  };
  recentTrends: Array<{
    date: string;
    amount: number;
  }>;
  categoryBreakdown: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [blurSensitive, setBlurSensitive] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else if (response.status === 401) {
        window.location.href = "/login";
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
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
          <h1 className="text-2xl font-bold">Finance Tracker</h1>
          <nav className="flex items-center gap-4" role="navigation" aria-label="Main navigation">
            {dashboardData && (
              <span className={`text-sm text-muted-foreground ${blurSensitive ? "blur-sm" : ""}`}>
                {dashboardData.user.email}
              </span>
            )}
            <Link href="/settings">
              <Button variant="outline" size="sm">Settings</Button>
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8" role="main">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Welcome back!</h2>
            <p className="text-muted-foreground">Here's your financial overview</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBlurSensitive(!blurSensitive)}
            className="gap-2"
            aria-pressed={blurSensitive}
            aria-label="Toggle sensitive data visibility"
          >
            {blurSensitive ? (
              <>
                <Eye className="h-4 w-4" aria-hidden="true" />
                Show
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" aria-hidden="true" />
                Hide
              </>
            )}
          </Button>
        </div>

        {loading ? (
          <div className="space-y-6" aria-busy="true" aria-live="polite" aria-label="Loading dashboard data">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" aria-label="Loading summary card" />
              ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-80" aria-label="Loading spending trend chart" />
              <Skeleton className="h-80" aria-label="Loading category breakdown chart" />
            </div>
          </div>
        ) : dashboardData ? (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${blurSensitive ? "blur-md" : ""}`}>
                    {formatCurrency(dashboardData.summary.totalBalance)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across {dashboardData.summary.accountCount} accounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-green-600" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold text-green-600 ${blurSensitive ? "blur-md" : ""}`}>
                    {formatCurrency(dashboardData.summary.totalIncome)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <ArrowDownRight className="h-4 w-4 text-red-600" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold text-red-600 ${blurSensitive ? "blur-md" : ""}`}>
                    {formatCurrency(dashboardData.summary.totalExpenses)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${dashboardData.summary.totalIncome - dashboardData.summary.totalExpenses >= 0
                      ? "text-green-600"
                      : "text-red-600"
                      } ${blurSensitive ? "blur-md" : ""}`}
                  >
                    {formatCurrency(dashboardData.summary.totalIncome - dashboardData.summary.totalExpenses)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              {/* Recent Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Spending Trend</CardTitle>
                  <CardDescription>Daily expenses over the last 14 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData.recentTrends.length > 0 ? (
                    <>
                      <div
                        role="img"
                        aria-label={`Line chart showing daily spending trend over the last 14 days. Highest amount: ${formatCurrency(Math.max(...dashboardData.recentTrends.map(t => t.amount)))}, Lowest: ${formatCurrency(Math.min(...dashboardData.recentTrends.map(t => t.amount)))}`}
                      >
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={dashboardData.recentTrends}>
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis fontSize={12} />
                            <Tooltip
                              formatter={(value: number) => formatCurrency(value)}
                              contentStyle={{ filter: blurSensitive ? "blur(8px)" : "none" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="amount"
                              stroke="#f87171"
                              strokeWidth={2}
                              dot={false}
                              className={blurSensitive ? "blur-md" : ""}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <details className="mt-4">
                        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                          View data table
                        </summary>
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full text-sm">
                            <caption className="sr-only">Daily spending trend data</caption>
                            <thead>
                              <tr className="border-b">
                                <th scope="col" className="text-left py-2">Date</th>
                                <th scope="col" className="text-right py-2">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboardData.recentTrends.map((trend, index) => (
                                <tr key={index} className="border-b">
                                  <td className="py-2">{trend.date}</td>
                                  <td className={`text-right ${blurSensitive ? "blur-sm" : ""}`}>
                                    {formatCurrency(trend.amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No trend data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>Top categories this month</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData.categoryBreakdown.length > 0 ? (
                    <>
                      <div
                        role="img"
                        aria-label={`Pie chart showing spending by category. Top 5 categories: ${dashboardData.categoryBreakdown.slice(0, 5).map(c => `${c.name}: ${formatCurrency(c.value)}`).join(', ')}`}
                      >
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={dashboardData.categoryBreakdown.slice(0, 5)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              className={blurSensitive ? "blur-sm" : ""}
                            >
                              {dashboardData.categoryBreakdown.slice(0, 5).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => formatCurrency(value)}
                              contentStyle={{ filter: blurSensitive ? "blur(8px)" : "none" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <details className="mt-4">
                        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                          View data table
                        </summary>
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full text-sm">
                            <caption className="sr-only">Category spending breakdown</caption>
                            <thead>
                              <tr className="border-b">
                                <th scope="col" className="text-left py-2">Category</th>
                                <th scope="col" className="text-right py-2">Amount</th>
                                <th scope="col" className="text-right py-2">Percentage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboardData.categoryBreakdown.slice(0, 5).map((category, index) => {
                                const total = dashboardData.categoryBreakdown.slice(0, 5).reduce((sum, c) => sum + c.value, 0);
                                const percent = ((category.value / total) * 100).toFixed(1);
                                return (
                                  <tr key={index} className="border-b">
                                    <td className="py-2 flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                        aria-hidden="true"
                                      />
                                      {category.name}
                                    </td>
                                    <td className={`text-right ${blurSensitive ? "blur-sm" : ""}`}>
                                      {formatCurrency(category.value)}
                                    </td>
                                    <td className={`text-right ${blurSensitive ? "blur-sm" : ""}`}>
                                      {percent}%
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No category data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/accounts">
                <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                  <CardHeader>
                    <CardTitle>Bank Accounts</CardTitle>
                    <CardDescription>Manage your bank accounts</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/transactions">
                <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                  <CardHeader>
                    <CardTitle>Transactions</CardTitle>
                    <CardDescription>Track your income and expenses</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/workflows">
                <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                  <CardHeader>
                    <CardTitle>Workflows</CardTitle>
                    <CardDescription>Build automation workflows</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/reports">
                <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>View financial insights</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              {dashboardData.user.role === "ADMIN" && (
                <Link href="/admin">
                  <Card className="cursor-pointer hover:border-primary transition-colors border-primary h-full">
                    <CardHeader>
                      <CardTitle>Admin Dashboard</CardTitle>
                      <CardDescription>Manage users and system</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
