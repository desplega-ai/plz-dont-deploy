import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const accountId = searchParams.get("accountId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build filter conditions
    const where: any = {
      bankAccount: { userId: user.id },
    };

    if (accountId) {
      where.bankAccountId = accountId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Get all transactions
    const transactions = await db.transaction.findMany({
      where,
      include: {
        category: true,
        bankAccount: true,
      },
      orderBy: { date: "desc" },
    });

    // Calculate summary stats
    // Income transactions (credits) are positive
    const totalIncome = transactions
      .filter((t) => t.type === "CREDIT")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Expense transactions (debits) are positive (stored as positive values)
    const totalExpenses = transactions
      .filter((t) => t.type === "DEBIT")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netBalance = totalIncome - totalExpenses;

    // Group by category
    const categoryBreakdown = transactions.reduce((acc: any[], t) => {
      if (t.type !== "DEBIT") return acc; // Only expenses for category breakdown

      const categoryName = t.category?.name || "Uncategorized";
      const categoryColor = t.category?.color || "#94a3b8";
      const existing = acc.find((item) => item.name === categoryName);

      if (existing) {
        existing.value += Math.abs(t.amount);
      } else {
        acc.push({
          name: categoryName,
          value: Math.abs(t.amount),
          color: categoryColor,
        });
      }

      return acc;
    }, []);

    // Sort by value descending
    categoryBreakdown.sort((a, b) => b.value - a.value);

    // Group by month for trends
    const monthlyTrends = transactions.reduce((acc: any[], t) => {
      const month = new Date(t.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });

      const existing = acc.find((item) => item.month === month);

      if (existing) {
        if (t.type === "CREDIT") {
          existing.income += Math.abs(t.amount);
        } else {
          existing.expenses += Math.abs(t.amount);
        }
      } else {
        acc.push({
          month,
          income: t.type === "CREDIT" ? Math.abs(t.amount) : 0,
          expenses: t.type === "DEBIT" ? Math.abs(t.amount) : 0,
        });
      }

      return acc;
    }, []);

    // Sort monthly trends chronologically
    monthlyTrends.sort((a, b) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });

    // Group by account
    const accountBreakdown = transactions.reduce((acc: any[], t) => {
      const accountName = t.bankAccount.name;
      const existing = acc.find((item) => item.name === accountName);

      if (existing) {
        if (t.type === "CREDIT") {
          existing.income += Math.abs(t.amount);
        } else {
          existing.expenses += Math.abs(t.amount);
        }
        existing.balance = existing.income - existing.expenses;
      } else {
        acc.push({
          name: accountName,
          income: t.type === "CREDIT" ? Math.abs(t.amount) : 0,
          expenses: t.type === "DEBIT" ? Math.abs(t.amount) : 0,
          balance: t.type === "CREDIT" ? Math.abs(t.amount) : -Math.abs(t.amount),
        });
      }

      return acc;
    }, []);

    // Get top merchants
    const merchantBreakdown = transactions
      .filter((t) => t.type === "DEBIT")
      .reduce((acc: any[], t) => {
        const merchant = t.description;
        const existing = acc.find((item) => item.name === merchant);

        if (existing) {
          existing.value += Math.abs(t.amount);
          existing.count += 1;
        } else {
          acc.push({
            name: merchant,
            value: Math.abs(t.amount),
            count: 1,
          });
        }

        return acc;
      }, []);

    // Sort by value and take top 10
    merchantBreakdown.sort((a, b) => b.value - a.value);
    const topMerchants = merchantBreakdown.slice(0, 10);

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpenses,
        netBalance,
        transactionCount: transactions.length,
      },
      categoryBreakdown,
      monthlyTrends,
      accountBreakdown,
      topMerchants,
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
