// Simple in-memory cache for payment status
interface PaymentCacheEntry {
  status: "pending" | "done" | "failed";
  timestamp: number;
  amount?: number;
}

class PaymentCache {
  private cache: Map<string, PaymentCacheEntry> = new Map();
  private subscribers: Map<string, Set<(data: PaymentCacheEntry) => void>> = new Map();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Auto cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  // Set payment status
  set(orderCode: string, status: "pending" | "done" | "failed", amount?: number) {
    const entry: PaymentCacheEntry = {
      status,
      timestamp: Date.now(),
      amount
    };
    
    this.cache.set(orderCode, entry);
    
    // Notify all subscribers
    this.notifySubscribers(orderCode, entry);
  }

  // Get payment status from cache
  get(orderCode: string): PaymentCacheEntry | null {
    const entry = this.cache.get(orderCode);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(orderCode);
      return null;
    }
    
    return entry;
  }

  // Subscribe to payment status changes
  subscribe(orderCode: string, callback: (data: PaymentCacheEntry) => void): () => void {
    if (!this.subscribers.has(orderCode)) {
      this.subscribers.set(orderCode, new Set());
    }
    
    this.subscribers.get(orderCode)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(orderCode)?.delete(callback);
      if (this.subscribers.get(orderCode)?.size === 0) {
        this.subscribers.delete(orderCode);
      }
    };
  }

  // Notify all subscribers for an order
  private notifySubscribers(orderCode: string, data: PaymentCacheEntry) {
    const callbacks = this.subscribers.get(orderCode);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Cleanup expired entries
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  // Destroy cache
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
    this.subscribers.clear();
  }

  // Get cache stats for monitoring
  getStats() {
    return {
      cachedOrders: this.cache.size,
      activeSubscriptions: this.subscribers.size
    };
  }
}

// Singleton instance
export const paymentCache = new PaymentCache();
