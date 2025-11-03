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
  }).optional(),
  defaultType: z.enum(["CREDIT", "DEBIT"]).optional(), // Used if type column not mapped
});

// Intelligent column mapping - detects column names automatically
function detectColumnMapping(headers: string[]): {
  date?: string;
  amount?: string;
  description?: string;
  type?: string;
  latitude?: string;
  longitude?: string;
  locationName?: string;
  category?: string;
} {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  const mapping: any = {};

  // Date detection
  const datePatterns = ['date', 'transaction date', 'transaction_date', 'posted date', 'posted_date', 'trans date', 'trans_date'];
  for (const pattern of datePatterns) {
    const index = lowerHeaders.findIndex(h => h === pattern || h.includes(pattern));
    if (index !== -1) {
      mapping.date = headers[index];
      break;
    }
  }

  // Amount detection
  const amountPatterns = ['amount', 'transaction amount', 'transaction_amount', 'value', 'price', 'total', 'sum'];
  for (const pattern of amountPatterns) {
    const index = lowerHeaders.findIndex(h => h === pattern || h.includes(pattern));
    if (index !== -1) {
      mapping.amount = headers[index];
      break;
    }
  }

  // Description detection (check multiple possible fields)
  const descriptionPatterns = ['description', 'merchant', 'merchantname', 'merchant_name', 'vendor', 'payee', 'details', 'memo', 'narrative'];
  for (const pattern of descriptionPatterns) {
    const index = lowerHeaders.findIndex(h => h === pattern || h.includes(pattern));
    if (index !== -1) {
      mapping.description = headers[index];
      break;
    }
  }

  // Type detection
  const typePatterns = ['type', 'transaction type', 'transaction_type', 'trans type', 'trans_type', 'debit/credit', 'credit/debit'];
  for (const pattern of typePatterns) {
    const index = lowerHeaders.findIndex(h => h === pattern || h.includes(pattern));
    if (index !== -1) {
      mapping.type = headers[index];
      break;
    }
  }

  // Location name detection
  const locationPatterns = ['location', 'locationname', 'location_name', 'place', 'venue'];
  for (const pattern of locationPatterns) {
    const index = lowerHeaders.findIndex(h => h === pattern || h.includes(pattern));
    if (index !== -1) {
      mapping.locationName = headers[index];
      break;
    }
  }

  // Latitude detection
  const latPatterns = ['latitude', 'lat'];
  for (const pattern of latPatterns) {
    const index = lowerHeaders.findIndex(h => h === pattern);
    if (index !== -1) {
      mapping.latitude = headers[index];
      break;
    }
  }

  // Longitude detection
  const lngPatterns = ['longitude', 'lng', 'lon', 'long'];
  for (const pattern of lngPatterns) {
    const index = lowerHeaders.findIndex(h => h === pattern);
    if (index !== -1) {
      mapping.longitude = headers[index];
      break;
    }
  }

  // Category detection
  const categoryPatterns = ['category', 'cat', 'transaction category', 'transaction_category'];
  for (const pattern of categoryPatterns) {
    const index = lowerHeaders.findIndex(h => h === pattern || h.includes(pattern));
    if (index !== -1) {
      mapping.category = headers[index];
      break;
    }
  }

  return mapping;
}

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

    const { bankAccountId, csvData, defaultType } = result.data;
    let { columnMapping } = result.data;

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

    // If no column mapping provided, use intelligent detection
    if (!columnMapping && parseResult.meta.fields) {
      const detectedMapping = detectColumnMapping(parseResult.meta.fields);

      // Check if we have the required fields
      if (!detectedMapping.date || !detectedMapping.amount || !detectedMapping.description) {
        return NextResponse.json(
          {
            error: "Could not detect required columns (date, amount, description)",
            detectedColumns: detectedMapping,
            availableColumns: parseResult.meta.fields
          },
          { status: 400 }
        );
      }

      columnMapping = {
        date: detectedMapping.date,
        amount: detectedMapping.amount,
        description: detectedMapping.description,
        type: detectedMapping.type,
      };
    }

    if (!columnMapping) {
      return NextResponse.json(
        { error: "Column mapping is required" },
        { status: 400 }
      );
    }

    const transactions: any[] = [];
    const errors: string[] = [];

    // Also detect optional columns for enhanced data
    const detectedMapping = parseResult.meta.fields
      ? detectColumnMapping(parseResult.meta.fields)
      : {};

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

        // Extract optional location data
        let latitude: number | undefined;
        let longitude: number | undefined;
        let locationName: string | undefined;

        if (detectedMapping.latitude && row[detectedMapping.latitude]) {
          const lat = parseFloat(row[detectedMapping.latitude]);
          if (!isNaN(lat)) latitude = lat;
        }

        if (detectedMapping.longitude && row[detectedMapping.longitude]) {
          const lng = parseFloat(row[detectedMapping.longitude]);
          if (!isNaN(lng)) longitude = lng;
        }

        if (detectedMapping.locationName && row[detectedMapping.locationName]) {
          locationName = row[detectedMapping.locationName];
        }

        transactions.push({
          bankAccountId,
          amount,
          type,
          date,
          description,
          isRecurring: false,
          latitude,
          longitude,
          locationName,
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
