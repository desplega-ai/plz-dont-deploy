import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateRuleSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().optional(),
  matchField: z.enum(["description", "amount", "date"]).optional(),
  matchPattern: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  priority: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const rule = await db.categoryRule.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        category: true,
      },
    });

    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Error fetching rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateRuleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.issues },
        { status: 400 }
      );
    }

    const existingRule = await db.categoryRule.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingRule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    const { categoryId, ...updateData } = result.data;

    const updatedRule = await db.categoryRule.update({
      where: { id },
      data: {
        ...updateData,
        ...(categoryId && { category: { connect: { id: categoryId } } }),
      } as any,
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedRule);
  } catch (error) {
    console.error("Error updating rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingRule = await db.categoryRule.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingRule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    await db.categoryRule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
