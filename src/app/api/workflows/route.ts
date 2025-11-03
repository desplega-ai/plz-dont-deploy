import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all workflows for the user
    const workflows = await db.workflow.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, nodes, edges, isActive } = await request.json();

    // If setting as active, deactivate all other workflows
    if (isActive) {
      await db.workflow.updateMany({
        where: { userId: user.id },
        data: { isActive: false },
      });
    }

    // Create new workflow
    const workflow = await db.workflow.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        nodes,
        edges,
        isActive: isActive || false,
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("Error creating workflow:", error);
    return NextResponse.json(
      { error: "Failed to create workflow" },
      { status: 500 }
    );
  }
}
