import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { logger } from "./lib/logger";

const publicPaths = ["/", "/login", "/register", "/verify-email"];
const authPaths = ["/login", "/register"];

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required. Please set it in your .env file.");
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long for security.");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie (single declaration)
  const token = request.cookies.get("auth_token")?.value;

  // Redirect logged-in users from root to dashboard
  if (pathname === "/" && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (error) {
      // Invalid token, continue to public page
    }
  }

  // Allow public paths and API auth routes
  if (
    publicPaths.some((path) => pathname === path) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate JWT token (without database access - edge compatible)
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // If logged in and trying to access auth pages, redirect to dashboard
    if (authPaths.some((path) => pathname === path)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Check admin routes
    if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    logger.error("JWT verification failed", error, { pathname });
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
