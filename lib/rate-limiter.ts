/**
 * Simple in-memory rate limiter using sliding window
 * Good enough for small scale deployments (100-1000 users)
 * 
 * Not suitable for distributed systems or high-traffic APIs
 * For production at scale, use Redis or external service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class SimpleRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (entry.count < this.maxAttempts) {
      entry.count++;
      return true;
    }

    return false;
  }

  getRemaining(key: string): number {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - entry.count);
  }

  getResetTime(key: string): number {
    const entry = this.store.get(key);
    if (!entry) {
      return 0;
    }
    return entry.resetTime;
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Export singleton instances
export const loginLimiter = new SimpleRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const webhookLimiter = new SimpleRateLimiter(20, 60 * 1000); // 20 per minute
export const apiLimiter = new SimpleRateLimiter(100, 60 * 1000); // 100 per minute (general)

/**
 * Helper to extract client IP from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}
