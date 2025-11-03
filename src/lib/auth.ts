import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { cookies } from "next/headers";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required. Please set it in your .env file.");
}

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_COOKIE_NAME = "auth_token";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  nonce?: string; // Optional random nonce for ensuring token uniqueness
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT utilities
export function generateJWT(payload: JWTPayload, expiresIn: string = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Session management
export async function createSession(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Generate JWT with random nonce to ensure uniqueness even under concurrent requests
  const token = generateJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    nonce: crypto.randomUUID(), // Ensures uniqueness for concurrent session creation
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await db.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function deleteSession(token: string) {
  await db.session.delete({
    where: { token },
  });
}

export async function validateSession(token: string) {
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { token } });
    return null;
  }

  return session;
}

// Cookie utilities
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(TOKEN_COOKIE_NAME);
  return cookie?.value || null;
}

export async function deleteAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
}

export async function getCurrentUser() {
  const token = await getAuthCookie();
  if (!token) {
    return null;
  }

  const session = await validateSession(token);
  return session?.user || null;
}

// Token generation utilities
export function generateToken(): string {
  return crypto.randomUUID() + crypto.randomUUID();
}

export async function createEmailVerificationToken(userId: string) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

  await db.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function createMagicLinkToken(userId: string) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes

  await db.magicLinkToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function verifyEmailToken(token: string) {
  const verificationToken = await db.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verificationToken) {
    return null;
  }

  if (verificationToken.expiresAt < new Date()) {
    await db.emailVerificationToken.delete({ where: { token } });
    return null;
  }

  await db.user.update({
    where: { id: verificationToken.userId },
    data: { emailVerified: true },
  });

  await db.emailVerificationToken.delete({ where: { token } });

  return verificationToken.user;
}

export async function verifyMagicLinkToken(token: string) {
  const magicToken = await db.magicLinkToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!magicToken) {
    return null;
  }

  if (magicToken.expiresAt < new Date()) {
    await db.magicLinkToken.delete({ where: { token } });
    return null;
  }

  await db.magicLinkToken.delete({ where: { token } });

  return magicToken.user;
}
