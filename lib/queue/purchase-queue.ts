import { redis, isRedisEnabled } from '@/lib/redis';

export interface PurchaseJobData {
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  mappingId: string;
  externalProductId: string;
  coupon?: string;
}

/**
 * Lightweight and Serverless-compatible background queue helper.
 * If Redis is enabled, it records active background jobs to prevent duplicate orders (idempotency).
 * It supports running jobs asynchronously using Next.js `request.waitUntil` or falling back to synchronous execution.
 */
class PurchaseQueue {
  private activeJobsKey = 'queue:purchase:active';

  /**
   * Register a job starting. Returns false if a duplicate job is already running (idempotency safety).
   */
  async registerJobStart(userId: string, productId: string): Promise<boolean> {
    if (!isRedisEnabled || !redis) return true;

    try {
      const jobLockKey = `lock:purchase:${userId}:${productId}`;
      // Set lock for 60 seconds to prevent double submission
      const acquired = await redis.set(jobLockKey, 'locked', { nx: true, ex: 60 });
      return acquired === 'OK';
    } catch (error) {
      console.error('[PurchaseQueue] Failed to register job start in Redis:', error);
      return true; // Fallback to allowing execution
    }
  }

  /**
   * Release the job lock after completion.
   */
  async releaseJobLock(userId: string, productId: string): Promise<void> {
    if (!isRedisEnabled || !redis) return;

    try {
      const jobLockKey = `lock:purchase:${userId}:${productId}`;
      await redis.del(jobLockKey);
    } catch (error) {
      console.error('[PurchaseQueue] Failed to release job lock in Redis:', error);
    }
  }

  /**
   * Logs job failures in Redis for administrator diagnostics.
   */
  async recordJobFailure(userId: string, errorMsg: string): Promise<void> {
    if (!isRedisEnabled || !redis) return;

    try {
      const logKey = `queue:purchase:failed:${userId}`;
      await redis.lpush(logKey, JSON.stringify({
        timestamp: new Date().toISOString(),
        error: errorMsg
      }));
      // Keep only last 50 failed jobs per user
      await redis.ltrim(logKey, 0, 49);
    } catch (error) {
      console.error('[PurchaseQueue] Failed to log job failure in Redis:', error);
    }
  }
}

export const purchaseQueue = new PurchaseQueue();
