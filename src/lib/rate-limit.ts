/**
 * Simple in-memory rate limiting utility
 *
 * WARNING: This implementation uses in-memory storage and is suitable for:
 * - Development environments
 * - Single-instance deployments
 * - Low-traffic applications
 *
 * For production deployments with multiple instances, consider:
 * - Redis-based rate limiting (e.g., `upstash/ratelimit`, `express-rate-limit` with Redis)
 * - Cloud-based rate limiting (Vercel Edge Config, Cloudflare Workers KV)
 * - API Gateway rate limiting
 *
 * This implementation uses a sliding window algorithm with automatic cleanup.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Unique identifier for the rate limit bucket (e.g., IP address, user ID, API key)
   */
  identifier: string;

  /**
   * Maximum number of requests allowed within the time window
   * @default 10
   */
  limit?: number;

  /**
   * Time window in seconds
   * @default 60 (1 minute)
   */
  windowSeconds?: number;
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;

  /**
   * Current number of requests in the window
   */
  current: number;

  /**
   * Maximum allowed requests
   */
  limit: number;

  /**
   * Number of remaining requests
   */
  remaining: number;

  /**
   * Unix timestamp (milliseconds) when the rate limit resets
   */
  resetTime: number;

  /**
   * Seconds until the rate limit resets
   */
  resetSeconds: number;
}

/**
 * Check if a request should be rate limited
 *
 * @example
 * ```ts
 * const result = rateLimit({ identifier: req.ip, limit: 10, windowSeconds: 60 });
 * if (!result.allowed) {
 *   return new Response('Too many requests', { status: 429 });
 * }
 * ```
 */
export function rateLimit(config: RateLimitConfig): RateLimitResult {
  const { identifier, limit = 10, windowSeconds = 60 } = config;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  let entry = rateLimitStore.get(identifier);

  // If no entry exists or the window has expired, create a new one
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(identifier, entry);

    return {
      allowed: true,
      current: 1,
      limit,
      remaining: limit - 1,
      resetTime: entry.resetTime,
      resetSeconds: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // Increment the counter
  entry.count++;

  const allowed = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);

  return {
    allowed,
    current: entry.count,
    limit,
    remaining,
    resetTime: entry.resetTime,
    resetSeconds: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Helper to get client identifier from request
 * Uses IP address or a fallback identifier
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  // In a real app, you might want to use user ID for authenticated requests
  return 'unknown';
}

/**
 * Create a rate limit Response with appropriate headers
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${result.resetSeconds} seconds.`,
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetTime,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime.toString(),
        'Retry-After': result.resetSeconds.toString(),
      },
    }
  );
}

/**
 * Rate limit presets for common use cases
 */
export const rateLimitPresets = {
  /** Very strict: 5 requests per minute */
  strict: { limit: 5, windowSeconds: 60 },

  /** Standard: 10 requests per minute */
  standard: { limit: 10, windowSeconds: 60 },

  /** Moderate: 30 requests per minute */
  moderate: { limit: 30, windowSeconds: 60 },

  /** Generous: 100 requests per minute */
  generous: { limit: 100, windowSeconds: 60 },

  /** Auth endpoints: 5 requests per 15 minutes */
  auth: { limit: 5, windowSeconds: 15 * 60 },

  /** Public API: 60 requests per hour */
  publicApi: { limit: 60, windowSeconds: 60 * 60 },
};
