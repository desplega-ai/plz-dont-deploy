import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createTransactionSchema = z.object({
  bankAccountId: z.string(),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["CREDIT", "DEBIT"]),
  date: z.string().transform((str) => new Date(str)),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locationName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createTransactionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    // Verify that the bank account belongs to the user
    const account = await db.bankAccount.findFirst({
      where: {
        id: result.data.bankAccountId,
        userId: user.id,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: 404 }
      );
    }

    // If categoryId is provided, verify it belongs to the user
    if (result.data.categoryId) {
      const category = await db.category.findFirst({
        where: {
          id: result.data.categoryId,
          userId: user.id,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
    }

    const transaction = await db.transaction.create({
      data: result.data,
      include: {
        category: true,
        bankAccount: true,
      },
    });

    // Update bank account balance
    const balanceChange = result.data.type === "CREDIT" ? result.data.amount : -result.data.amount;
    await db.bankAccount.update({
      where: { id: result.data.bankAccountId },
      data: { balance: { increment: balanceChange } },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const accountId = searchParams.get("accountId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      bankAccount: {
        userId: user.id,
      },
    };

    if (accountId) {
      where.bankAccountId = accountId;
    }

    if (type === "CREDIT" || type === "DEBIT") {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where,
        include: {
          category: true,
          bankAccount: {
            select: {
              id: true,
              name: true,
              currency: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      db.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
