import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all user's accounts
    const accounts = await db.bankAccount.findMany({
      where: { userId: user.id },
    });

    const accountCount = accounts.length;
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Get transactions from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await db.transaction.findMany({
      where: {
        bankAccount: { userId: user.id },
        date: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        category: true,
      },
      orderBy: { date: "desc" },
    });

    // Calculate income and expenses
    const totalIncome = transactions
      .filter((t) => t.type === "CREDIT")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "DEBIT")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Get last 14 days for trend - create full date range with zeros
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const recentTransactions = transactions.filter(
      (t) => t.date >= fourteenDaysAgo && t.type === "DEBIT"
    );

    // Create a map with all dates initialized to 0
    const trendMap = new Map<string, number>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      trendMap.set(dateKey, 0);
    }

    // Fill in actual transaction amounts
    recentTransactions.forEach((t) => {
      const dateKey = t.date.toISOString().split("T")[0];
      if (trendMap.has(dateKey)) {
        const current = trendMap.get(dateKey) || 0;
        trendMap.set(dateKey, current + Math.abs(t.amount));
      }
    });

    // Convert to array in chronological order
    const recentTrends = Array.from(trendMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        amount,
      }));

    // Category breakdown (top 5)
    const categoryMap = new Map<
      string,
      { value: number; color: string }
    >();

    transactions
      .filter((t) => t.type === "DEBIT")
      .forEach((t) => {
        const categoryName = t.category?.name || "Uncategorized";
        const categoryColor = t.category?.color || "#94a3b8";
        const current = categoryMap.get(categoryName) || {
          value: 0,
          color: categoryColor,
        };
        categoryMap.set(categoryName, {
          value: current.value + Math.abs(t.amount),
          color: categoryColor,
        });
      });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        value: data.value,
        color: data.color,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return NextResponse.json({
      user: {
        email: user.email,
        role: user.role,
      },
      summary: {
        totalBalance,
        totalIncome,
        totalExpenses,
        accountCount,
      },
      recentTrends,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
