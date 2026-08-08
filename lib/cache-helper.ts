import { redis, isRedisEnabled } from './redis';

// L1 Cache: In-memory cache (0ms latency, free command usage)
const l1Cache = new Map<string, { value: any; expiry: number }>();

export async function getCache<T>(key: string): Promise<T | null> {
  // 1. Check L1 Cache first
  const l1Cached = l1Cache.get(key);
  if (l1Cached) {
    if (Date.now() < l1Cached.expiry) {
      return l1Cached.value as T;
    }
    l1Cache.delete(key);
  }

  // 2. Check L2 Cache (Redis)
  if (isRedisEnabled && redis) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached as T;
        
        // Sync to L1 Cache with a short 10-second TTL to avoid hitting Redis on immediately following requests
        l1Cache.set(key, {
          value: parsed,
          expiry: Date.now() + 10 * 1000,
        });
        
        return parsed;
      }
    } catch (e) {
      console.error('[Cache L2] Error getting from Redis:', e);
    }
  }

  return null;
}

export async function setCache(key: string, value: any, ttlSeconds: number = 30): Promise<void> {
  // 1. Save to L1 Cache
  l1Cache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });

  // 2. Save to L2 Cache (Redis)
  if (isRedisEnabled && redis) {
    try {
      await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
    } catch (e) {
      console.error('[Cache L2] Error setting in Redis:', e);
    }
  }
}

export async function invalidateCache(key: string): Promise<void> {
  l1Cache.delete(key);
  
  if (isRedisEnabled && redis) {
    try {
      await redis.del(key);
    } catch (e) {
      console.error('[Cache L2] Error deleting from Redis:', e);
    }
  }
}
