/**
 * Simple in-memory rate limiter using sliding window
 * Good enough for small scale deployments (100-1000 users)
 * 
 * Not suitable for distributed systems or high-traffic APIs
 * For production at scale, use Redis or external service
 */

import { redis, isRedisEnabled } from './redis';

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

    // Clean up expired local entries every 5 minutes if Redis is disabled
    if (typeof window === 'undefined' || !isRedisEnabled) {
      setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  async isAllowed(key: string): Promise<boolean> {
    if (isRedisEnabled && redis) {
      try {
        const redisKey = `rate-limit:${key}`;
        const current = await redis.get<number>(redisKey);

        if (current === null) {
          // Key doesn't exist, create it with TTL
          await redis.set(redisKey, 1, { ex: Math.ceil(this.windowMs / 1000) });
          return true;
        }

        if (current < this.maxAttempts) {
          await redis.incr(redisKey);
          return true;
        }

        return false;
      } catch (error) {
        console.error('[RateLimiter] Redis error, falling back to local memory:', error);
      }
    }

    // Local Memory Fallback
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
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

  async getRemaining(key: string): Promise<number> {
    if (isRedisEnabled && redis) {
      try {
        const redisKey = `rate-limit:${key}`;
        const current = await redis.get<number>(redisKey);
        if (current === null) return this.maxAttempts;
        return Math.max(0, this.maxAttempts - current);
      } catch (error) {
        console.error('[RateLimiter] Redis getRemaining error:', error);
      }
    }

    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - entry.count);
  }

  async getResetTime(key: string): Promise<number> {
    if (isRedisEnabled && redis) {
      try {
        const redisKey = `rate-limit:${key}`;
        const ttl = await redis.ttl(redisKey);
        if (ttl < 0) return 0;
        return Date.now() + (ttl * 1000);
      } catch (error) {
        console.error('[RateLimiter] Redis getResetTime error:', error);
      }
    }

    const entry = this.store.get(key);
    if (!entry) return 0;
    return entry.resetTime;
  }

  async reset(key: string): Promise<void> {
    if (isRedisEnabled && redis) {
      try {
        await redis.del(`rate-limit:${key}`);
        return;
      } catch (error) {
        console.error('[RateLimiter] Redis reset error:', error);
      }
    }
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
export const registerLimiter = new SimpleRateLimiter(3, 15 * 60 * 1000); // 3 registrations per 15 minutes
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
