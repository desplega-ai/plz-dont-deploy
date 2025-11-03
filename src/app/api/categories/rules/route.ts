import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createRuleSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(1, "Name is required"),
  matchField: z.enum(["DESCRIPTION", "AMOUNT", "DATE", "AMOUNT_RANGE"]),
  matchPattern: z.string(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  priority: z.number().default(0),
  isActive: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createRuleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    // Verify category belongs to user
    const category = await db.category.findFirst({
      where: {
        id: result.data.categoryId,
        userId: user.id,
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const rule = await db.categoryRule.create({
      data: {
        ...result.data,
        userId: user.id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Failed to create rule:", error);
    return NextResponse.json(
      { error: "Failed to create rule" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rules = await db.categoryRule.findMany({
      where: { userId: user.id },
      include: {
        category: true,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Failed to fetch rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch rules" },
      { status: 500 }
    );
  }
}
