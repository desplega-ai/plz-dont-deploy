import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createMagicLinkToken } from "@/lib/auth";
import { sendMagicLinkEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

const magicLinkSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = magicLinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: "If an account exists with this email, a magic link has been sent.",
      });
    }

    // Check if magic link is enabled for this user
    if (!user.magicLinkEnabled) {
      return NextResponse.json(
        { error: "Magic link is not enabled for this account. Please enable it in your settings." },
        { status: 403 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before using magic link" },
        { status: 403 }
      );
    }

    // Create magic link token
    const token = await createMagicLinkToken(user.id);

    // Send magic link email
    await sendMagicLinkEmail(email, token);

    return NextResponse.json({
      message: "If an account exists with this email, a magic link has been sent.",
    });
  } catch (error) {
    logger.error("Magic link request error", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}
