import { Resend } from "resend";
import { logger } from "./logger";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Use custom email sender in production, fallback to Resend dev domain for development
// IMPORTANT: In production, you must verify your domain with Resend first
const EMAIL_FROM = process.env.EMAIL_FROM || "Finance Tracker <onboarding@resend.dev>";

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Verify your email address",
      html: `
        <h1>Welcome to Finance Tracker!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
    });
  } catch (error) {
    logger.error("Failed to send verification email", error, { email });
    throw new Error("Failed to send verification email");
  }
}

export async function sendMagicLinkEmail(email: string, token: string) {
  const magicLinkUrl = `${APP_URL}/api/auth/magic-link/verify?token=${token}`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Your magic link to sign in",
      html: `
        <h1>Sign in to Finance Tracker</h1>
        <p>Click the link below to sign in to your account:</p>
        <a href="${magicLinkUrl}">${magicLinkUrl}</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this link, you can safely ignore this email.</p>
      `,
    });
  } catch (error) {
    logger.error("Failed to send magic link email", error, { email });
    throw new Error("Failed to send magic link email");
  }
}
