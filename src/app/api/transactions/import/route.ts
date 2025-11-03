import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Papa from "papaparse";
import { z } from "zod";

const importSchema = z.object({
  bankAccountId: z.string(),
  csvData: z.string(),
  columnMapping: z.object({
    date: z.string(),
    amount: z.string(),
    description: z.string(),
    type: z.string().optional(), // Optional: column that indicates CREDIT/DEBIT
  }),
  defaultType: z.enum(["CREDIT", "DEBIT"]).optional(), // Used if type column not mapped
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = importSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { bankAccountId, csvData, columnMapping, defaultType } = result.data;

    // Verify that the bank account belongs to the user
    const account = await db.bankAccount.findFirst({
      where: {
        id: bankAccountId,
        userId: user.id,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: 404 }
      );
    }

    // Parse CSV
    const parseResult = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: "Failed to parse CSV", details: parseResult.errors },
        { status: 400 }
      );
    }

    const rows = parseResult.data as Record<string, string>[];
    const transactions: any[] = [];
    const errors: string[] = [];

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      try {
        const dateStr = row[columnMapping.date];
        const amountStr = row[columnMapping.amount];
        const description = row[columnMapping.description];

        if (!dateStr || !amountStr || !description) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          errors.push(`Row ${i + 1}: Invalid date format`);
          continue;
        }

        const amount = Math.abs(parseFloat(amountStr.replace(/[^0-9.-]/g, "")));
        if (isNaN(amount)) {
          errors.push(`Row ${i + 1}: Invalid amount`);
          continue;
        }

        // Determine transaction type
        let type: "CREDIT" | "DEBIT" = defaultType || "DEBIT";
        if (columnMapping.type && row[columnMapping.type]) {
          const typeValue = row[columnMapping.type]?.toLowerCase();
          if (typeValue?.includes("credit") || typeValue?.includes("deposit") || parseFloat(amountStr) > 0) {
            type = "CREDIT";
          } else if (typeValue?.includes("debit") || typeValue?.includes("withdrawal") || parseFloat(amountStr) < 0) {
            type = "DEBIT";
          }
        }

        transactions.push({
          bankAccountId,
          amount,
          type,
          date,
          description,
          isRecurring: false,
        });
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "No valid transactions to import", details: errors },
        { status: 400 }
      );
    }

    // Batch insert transactions
    const imported = await db.transaction.createMany({
      data: transactions,
    });

    // Update account balance
    const balanceChange = transactions.reduce((sum, tx) => {
      return sum + (tx.type === "CREDIT" ? tx.amount : -tx.amount);
    }, 0);

    await db.bankAccount.update({
      where: { id: bankAccountId },
      data: { balance: { increment: balanceChange } },
    });

    return NextResponse.json({
      message: "Import completed",
      imported: imported.count,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Failed to import transactions:", error);
    return NextResponse.json(
      { error: "Failed to import transactions" },
      { status: 500 }
    );
  }
}
