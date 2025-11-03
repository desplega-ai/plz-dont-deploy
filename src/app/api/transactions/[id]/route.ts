import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(["CREDIT", "DEBIT"]).optional(),
  date: z.string().transform((str) => new Date(str)).optional(),
  description: z.string().min(1).optional(),
  categoryId: z.string().optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  locationName: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transaction = await db.transaction.findFirst({
      where: {
        id,
        bankAccount: {
          userId: user.id,
        },
      },
      include: {
        category: true,
        bankAccount: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Failed to fetch transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = updateTransactionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    // Check if transaction exists and belongs to user
    const existingTransaction = await db.transaction.findFirst({
      where: {
        id,
        bankAccount: {
          userId: user.id,
        },
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // If updating category, verify it belongs to user
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

    // If amount or type changed, update account balance
    if (result.data.amount !== undefined || result.data.type !== undefined) {
      const oldAmount = existingTransaction.type === "CREDIT"
        ? existingTransaction.amount
        : -existingTransaction.amount;

      const newType = result.data.type || existingTransaction.type;
      const newAmount = result.data.amount || existingTransaction.amount;
      const newBalanceChange = newType === "CREDIT" ? newAmount : -newAmount;

      const balanceDiff = newBalanceChange - oldAmount;

      await db.bankAccount.update({
        where: { id: existingTransaction.bankAccountId },
        data: { balance: { increment: balanceDiff } },
      });
    }

    const transaction = await db.transaction.update({
      where: { id },
      data: result.data,
      include: {
        category: true,
        bankAccount: true,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if transaction exists and belongs to user
    const existingTransaction = await db.transaction.findFirst({
      where: {
        id,
        bankAccount: {
          userId: user.id,
        },
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Update account balance
    const balanceChange = existingTransaction.type === "CREDIT"
      ? -existingTransaction.amount
      : existingTransaction.amount;

    await db.bankAccount.update({
      where: { id: existingTransaction.bankAccountId },
      data: { balance: { increment: balanceChange } },
    });

    await db.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
