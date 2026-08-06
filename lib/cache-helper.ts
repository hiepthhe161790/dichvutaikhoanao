import { redis, isRedisEnabled } from './redis';

// Simple in-memory cache fallback
const localCache = new Map<string, { value: any; expiry: number }>();

export async function getCache<T>(key: string): Promise<T | null> {
  if (isRedisEnabled && redis) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        return typeof cached === 'string' ? JSON.parse(cached) : cached as T;
      }
    } catch (e) {
      console.error('[Cache] Error getting from Redis:', e);
    }
  }

  // Fallback to local memory
  const localCached = localCache.get(key);
  if (localCached) {
    if (Date.now() < localCached.expiry) {
      return localCached.value as T;
    }
    localCache.delete(key);
  }
  return null;
}

export async function setCache(key: string, value: any, ttlSeconds: number = 30): Promise<void> {
  if (isRedisEnabled && redis) {
    try {
      await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
      return;
    } catch (e) {
      console.error('[Cache] Error setting in Redis:', e);
    }
  }

  // Fallback to local memory
  localCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

export async function invalidateCache(key: string): Promise<void> {
  if (isRedisEnabled && redis) {
    try {
      await redis.del(key);
    } catch (e) {
      console.error('[Cache] Error deleting from Redis:', e);
    }
  }
  localCache.delete(key);
}
