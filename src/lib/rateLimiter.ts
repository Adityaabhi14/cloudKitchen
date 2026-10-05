import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const ipLimiterStore = new Map<string, RateLimitRecord>();

// Clean up stale rate limit entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    ipLimiterStore.forEach((record, key) => {
      if (record.resetTime <= now) {
        ipLimiterStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

/**
 * Extract client IP address from request headers or socket
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  prefix?: string;
}

/**
 * Check if the request exceeds rate limit
 * Returns { success: true } if allowed, or { success: false, remaining: 0, resetInSeconds: number } if throttled
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions = { maxRequests: 60, windowMs: 60 * 1000, prefix: 'general' }
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const ip = getClientIp(req);
  const key = `${options.prefix || 'limit'}:${ip}`;
  const now = Date.now();

  let record = ipLimiterStore.get(key);

  if (!record || record.resetTime <= now) {
    record = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    ipLimiterStore.set(key, record);
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetInSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  record.count += 1;
  const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
  const remaining = Math.max(0, options.maxRequests - record.count);

  if (record.count > options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  return {
    allowed: true,
    remaining,
    resetInSeconds,
  };
}

// Preset configurations for specific endpoints
export const RATE_LIMITS = {
  AUTH: { maxRequests: 10, windowMs: 60 * 1000, prefix: 'auth' },       // 10 attempts / min
  ORDER: { maxRequests: 20, windowMs: 60 * 1000, prefix: 'order' },     // 20 orders / min
  PAYMENT: { maxRequests: 25, windowMs: 60 * 1000, prefix: 'payment' }, // 25 payment requests / min
  UPLOAD: { maxRequests: 10, windowMs: 60 * 1000, prefix: 'upload' },   // 10 uploads / min
  PUBLIC_API: { maxRequests: 120, windowMs: 60 * 1000, prefix: 'api' },// 120 requests / min
};
