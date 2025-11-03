import { NextResponse } from "next/server";
import { getAuthCookie, deleteSession, deleteAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    const token = await getAuthCookie();

    if (token) {
      await deleteSession(token);
      await deleteAuthCookie();
    }

    return NextResponse.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}
