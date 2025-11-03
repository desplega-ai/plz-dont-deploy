import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().default("#3b82f6"),
  parentId: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    // If parentId is provided, verify it exists and belongs to user
    if (result.data.parentId) {
      const parent = await db.category.findFirst({
        where: {
          id: result.data.parentId,
          userId: user.id,
        },
      });

      if (!parent) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 404 }
        );
      }
    }

    const category = await db.category.create({
      data: {
        ...result.data,
        userId: user.id,
      },
      include: {
        parent: true,
        subcategories: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
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

    // Get all categories with their relationships
    const categories = await db.category.findMany({
      where: { userId: user.id },
      include: {
        parent: true,
        subcategories: true,
        _count: {
          select: {
            transactions: true,
            rules: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Build tree structure
    const categoryMap = new Map(categories.map((cat) => [cat.id, { ...cat, children: [] as any[] }]));
    const tree: any[] = [];

    categories.forEach((category) => {
      const cat = categoryMap.get(category.id);
      if (!cat) return;

      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(cat);
        }
      } else {
        tree.push(cat);
      }
    });

    return NextResponse.json({
      categories,
      tree,
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
