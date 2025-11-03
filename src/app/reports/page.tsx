"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Download, TrendingUp, TrendingDown, DollarSign, Receipt, FileText } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import jsPDF from "jspdf";

interface BankAccount {
  id: string;
  name: string;
}

interface ReportData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    transactionCount: number;
  };
  categoryBreakdown: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  accountBreakdown: Array<{
    name: string;
    income: number;
    expenses: number;
    balance: number;
  }>;
  topMerchants: Array<{
    name: string;
    value: number;
    count: number;
  }>;
}

export default function ReportsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>("__all__");

  // Set default dates to last 3 months
  const getDefaultDates = () => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 3);

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultDates();
  const [startDate, setStartDate] = useState<string>(defaultDates.start);
  const [endDate, setEndDate] = useState<string>(defaultDates.end);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [selectedAccount, startDate, endDate]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      toast.error("Failed to load accounts");
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedAccount && selectedAccount !== "__all__") params.append("accountId", selectedAccount);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const rows = [
      ["Summary Report"],
      [""],
      ["Metric", "Value"],
      ["Total Income", reportData.summary.totalIncome.toFixed(2)],
      ["Total Expenses", reportData.summary.totalExpenses.toFixed(2)],
      ["Net Balance", reportData.summary.netBalance.toFixed(2)],
      ["Transaction Count", reportData.summary.transactionCount.toString()],
      [""],
      ["Category Breakdown"],
      ["Category", "Amount"],
      ...reportData.categoryBreakdown.map((cat) => [cat.name, cat.value.toFixed(2)]),
      [""],
      ["Monthly Trends"],
      ["Month", "Income", "Expenses"],
      ...reportData.monthlyTrends.map((trend) => [
        trend.month,
        trend.income.toFixed(2),
        trend.expenses.toFixed(2),
      ]),
    ];

    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const exportToPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.text("Financial Report", pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    // Summary Section
    doc.setFontSize(14);
    doc.text("Summary", 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.text(`Total Income: ${formatCurrency(reportData.summary.totalIncome)}`, 20, yPos);
    yPos += 6;
    doc.text(`Total Expenses: ${formatCurrency(reportData.summary.totalExpenses)}`, 20, yPos);
    yPos += 6;
    doc.text(`Net Balance: ${formatCurrency(reportData.summary.netBalance)}`, 20, yPos);
    yPos += 6;
    doc.text(`Transaction Count: ${reportData.summary.transactionCount}`, 20, yPos);
    yPos += 15;

    // Category Breakdown
    if (reportData.categoryBreakdown.length > 0) {
      doc.setFontSize(14);
      doc.text("Expenses by Category", 15, yPos);
      yPos += 8;

      doc.setFontSize(10);
      reportData.categoryBreakdown.slice(0, 10).forEach((cat) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${cat.name}: ${formatCurrency(cat.value)}`, 20, yPos);
        yPos += 6;
      });
      yPos += 10;
    }

    // Monthly Trends
    if (reportData.monthlyTrends.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text("Monthly Trends", 15, yPos);
      yPos += 8;

      doc.setFontSize(10);
      reportData.monthlyTrends.forEach((trend) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(
          `${trend.month} - Income: ${formatCurrency(trend.income)}, Expenses: ${formatCurrency(trend.expenses)}`,
          20,
          yPos
        );
        yPos += 6;
      });
    }

    // Top Merchants
    if (reportData.topMerchants.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text("Top Merchants", 15, yPos);
      yPos += 8;

      doc.setFontSize(10);
      reportData.topMerchants.slice(0, 10).forEach((merchant) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${merchant.name}: ${formatCurrency(merchant.value)} (${merchant.count} transactions)`, 20, yPos);
        yPos += 6;
      });
    }

    doc.save(`financial-report-${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF exported successfully");
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
          <h1 className="text-2xl font-bold">Financial Reports</h1>
          <div />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8" role="main">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold">Analytics & Insights</h2>
            <p className="text-muted-foreground">Visualize your financial data and trends</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} disabled={!reportData} variant="outline">
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Export CSV
            </Button>
            <Button onClick={exportToPDF} disabled={!reportData}>
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
              Export PDF
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Customize your report view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account-filter">Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-6" aria-busy="true" aria-live="polite" aria-label="Loading report data">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" aria-label="Loading chart" />
            ))}
          </div>
        ) : !reportData ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No data available for the selected filters</p>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(reportData.summary.totalIncome)}
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
                    {formatCurrency(reportData.summary.totalExpenses)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      reportData.summary.netBalance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(reportData.summary.netBalance)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.summary.transactionCount}</div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trends */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Income vs Expenses Over Time</CardTitle>
                <CardDescription>Monthly trend comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  role="img"
                  aria-label={`Line chart showing income versus expenses over time. Total income: ${formatCurrency(reportData.summary.totalIncome)}, Total expenses: ${formatCurrency(reportData.summary.totalExpenses)}`}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={2} />
                      <Line type="monotone" dataKey="expenses" stroke="#dc2626" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <details className="mt-4">
                  <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                    View data table
                  </summary>
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-sm">
                      <caption className="sr-only">Monthly income and expenses data</caption>
                      <thead>
                        <tr className="border-b">
                          <th scope="col" className="text-left py-2">Month</th>
                          <th scope="col" className="text-right py-2">Income</th>
                          <th scope="col" className="text-right py-2">Expenses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.monthlyTrends.map((trend, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{trend.month}</td>
                            <td className="text-right text-green-600">{formatCurrency(trend.income)}</td>
                            <td className="text-right text-red-600">{formatCurrency(trend.expenses)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Expenses by Category</CardTitle>
                  <CardDescription>Distribution of spending across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportData.categoryBreakdown.length > 0 ? (
                    <>
                      <div
                        role="img"
                        aria-label={`Pie chart showing expenses by category. Top categories: ${reportData.categoryBreakdown.slice(0, 3).map(c => `${c.name}: ${formatCurrency(c.value)}`).join(', ')}`}
                      >
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={reportData.categoryBreakdown}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {reportData.categoryBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.categoryBreakdown.map((category, index) => (
                                <tr key={index} className="border-b">
                                  <td className="py-2 flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: category.color }}
                                      aria-hidden="true"
                                    />
                                    {category.name}
                                  </td>
                                  <td className="text-right">{formatCurrency(category.value)}</td>
                                </tr>
                              ))}
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

              {/* Account Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                  <CardDescription>Income and expenses per account</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportData.accountBreakdown.length > 0 ? (
                    <>
                      <div
                        role="img"
                        aria-label={`Bar chart showing income and expenses per account across ${reportData.accountBreakdown.length} accounts`}
                      >
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={reportData.accountBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="income" fill="#16a34a" />
                            <Bar dataKey="expenses" fill="#dc2626" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <details className="mt-4">
                        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                          View data table
                        </summary>
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full text-sm">
                            <caption className="sr-only">Account income and expenses summary</caption>
                            <thead>
                              <tr className="border-b">
                                <th scope="col" className="text-left py-2">Account</th>
                                <th scope="col" className="text-right py-2">Income</th>
                                <th scope="col" className="text-right py-2">Expenses</th>
                                <th scope="col" className="text-right py-2">Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.accountBreakdown.map((account, index) => (
                                <tr key={index} className="border-b">
                                  <td className="py-2">{account.name}</td>
                                  <td className="text-right text-green-600">{formatCurrency(account.income)}</td>
                                  <td className="text-right text-red-600">{formatCurrency(account.expenses)}</td>
                                  <td className={`text-right ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(account.balance)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No account data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Merchants */}
            <Card>
              <CardHeader>
                <CardTitle>Top Merchants</CardTitle>
                <CardDescription>Where you spend the most</CardDescription>
              </CardHeader>
              <CardContent>
                {reportData.topMerchants.length > 0 ? (
                  <>
                    <div
                      role="img"
                      aria-label={`Bar chart showing top ${reportData.topMerchants.length} merchants by spending. Highest: ${reportData.topMerchants[0]?.name} at ${formatCurrency(reportData.topMerchants[0]?.value)}`}
                    >
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={reportData.topMerchants} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={150} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <details className="mt-4">
                      <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                        View data table
                      </summary>
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-sm">
                          <caption className="sr-only">Top merchants by spending</caption>
                          <thead>
                            <tr className="border-b">
                              <th scope="col" className="text-left py-2">Merchant</th>
                              <th scope="col" className="text-right py-2">Total Spent</th>
                              <th scope="col" className="text-right py-2">Transactions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.topMerchants.map((merchant, index) => (
                              <tr key={index} className="border-b">
                                <td className="py-2">{merchant.name}</td>
                                <td className="text-right">{formatCurrency(merchant.value)}</td>
                                <td className="text-right">{merchant.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-12">No merchant data available</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
