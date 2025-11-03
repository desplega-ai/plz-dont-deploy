import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({
        transactions: [],
        accounts: [],
        categories: [],
      });
    }

    // Search transactions
    const transactions = await db.transaction.findMany({
      where: {
        bankAccount: {
          userId: user.id,
        },
        description: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        description: true,
        amount: true,
        date: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
    });

    // Search accounts
    const accounts = await db.bankAccount.findMany({
      where: {
        userId: user.id,
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
      take: 3,
    });

    // Search categories
    const categories = await db.category.findMany({
      where: {
        userId: user.id,
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
      },
      take: 3,
    });

    return NextResponse.json({
      transactions,
      accounts,
      categories,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}
