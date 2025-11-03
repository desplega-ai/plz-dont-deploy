import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total counts
    const [userCount, accountCount, transactionCount, categoryCount] = await Promise.all([
      db.user.count(),
      db.bankAccount.count(),
      db.transaction.count(),
      db.category.count(),
    ]);

    // Get recent users with redacted email
    const recentUsers = await db.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            bankAccounts: true,
            categories: true,
          },
        },
      },
    });

    // Redact emails for privacy (show first 2 chars + ***)
    const redactedUsers = recentUsers.map((u) => ({
      ...u,
      email: u.email.substring(0, 2) + "***@" + u.email.split("@")[1],
    }));

    // Get transaction statistics
    const transactions = await db.transaction.findMany({
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    const totalIncome = transactions
      .filter((t) => t.type === "CREDIT")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "DEBIT")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Get users by role
    const usersByRole = await db.user.groupBy({
      by: ["role"],
      _count: true,
    });

    // Get transactions by type
    const transactionsByType = await db.transaction.groupBy({
      by: ["type"],
      _count: true,
      _sum: {
        amount: true,
      },
    });

    // Get recent transactions (redacted)
    const recentTransactions = await db.transaction.findMany({
      take: 20,
      orderBy: { date: "desc" },
      include: {
        bankAccount: {
          select: {
            name: true,
            userId: true,
          },
        },
        category: {
          select: {
            name: true,
            color: true,
          },
        },
      },
    });

    // Redact user IDs in transactions
    const redactedTransactions = recentTransactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      date: t.date,
      description: t.description,
      category: t.category,
      bankAccount: {
        name: t.bankAccount.name,
        userId: t.bankAccount.userId.substring(0, 8) + "***",
      },
    }));

    // Get growth stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await db.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const newTransactionsLast30Days = await db.transaction.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    return NextResponse.json({
      overview: {
        userCount,
        accountCount,
        transactionCount,
        categoryCount,
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
      },
      growth: {
        newUsersLast30Days,
        newTransactionsLast30Days,
      },
      usersByRole,
      transactionsByType,
      recentUsers: redactedUsers,
      recentTransactions: redactedTransactions,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
