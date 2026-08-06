import { Redis } from '@upstash/redis';

// Fail-safe Redis client initialization
let redis: Redis | null = null;
let isRedisEnabled = false;

try {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    redis = new Redis({ url, token });
    isRedisEnabled = true;
    console.log('[Redis] Client initialized successfully');
  } else {
    console.warn(
      '[Redis] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN not configured. ' +
      'Falling back to in-memory caching and rate limiting.'
    );
  }
} catch (error) {
  console.error('[Redis] Initialization error:', error);
}

export { redis, isRedisEnabled };
