import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security headers applied to all responses.
 *
 * These headers protect against common web vulnerabilities:
 * - XSS (Content-Security-Policy, X-XSS-Protection)
 * - Clickjacking (X-Frame-Options)
 * - MIME sniffing (X-Content-Type-Options)
 * - Information leakage (Referrer-Policy, Permissions-Policy)
 * - Downgrade attacks (Strict-Transport-Security)
 */
export const securityHeaders: Record<string, string> = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS filter (legacy browsers)
  'X-XSS-Protection': '1; mode=block',

  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // HSTS — enforce HTTPS (1 year, include subdomains)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

  // Restrict browser features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

  // Content Security Policy (strict in production, relaxed in dev)
  'Content-Security-Policy': [
    "default-src 'self'",
    process.env.NODE_ENV === 'production'
      ? "script-src 'self'"
      : "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'", // Tailwind requires inline styles
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

/**
 * Apply security headers to a NextResponse.
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

/**
 * Rate limiting state (in-memory, suitable for single-instance).
 * For multi-instance or serverless deployments (e.g., Vercel), this
 * provides per-instance limiting only. For distributed rate limiting,
 * use Redis or a dedicated service like Upstash.
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

/**
 * Simple in-memory rate limiter.
 * Returns true if the request should be allowed, false if rate-limited.
 */
export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Clean up expired entries periodically
  if (rateLimitMap.size > 10_000) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  entry.count++;
  return entry.count <= RATE_LIMIT_MAX_REQUESTS;
}

/**
 * Extract client IP from request for rate limiting.
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
