// API Cache system to prevent duplicate requests
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ApiCache {
  private readonly cache = new Map<string, CacheEntry<any>>();
  private readonly pendingRequests = new Map<string, Promise<any>>();

  // Default TTL: 5 minutes
  private readonly defaultTTL = 5 * 60 * 1000;

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  public generateKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : "";
    return `${endpoint}:${paramString}`;
  }

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Check if we have a pending request for this key
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Check cache first
    const cached = this.cache.get(key);
    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }

    // Create new request
    const request = fetcher()
      .then((data) => {
        // Cache the result
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl,
        });

        // Remove from pending requests
        this.pendingRequests.delete(key);

        return data;
      })
      .catch((error) => {
        // Remove from pending requests on error
        this.pendingRequests.delete(key);
        throw error;
      });

    // Store pending request
    this.pendingRequests.set(key, request);

    return request;
  }

  // Clear specific cache entry
  clear(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  // Clear all cache
  clearAll(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Clear expired entries
  clearExpired(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

export const apiCache = new ApiCache();

// Helper function to create cached API calls
export function createCachedApiCall<T>(
  endpoint: string,
  fetcher: () => Promise<T>,
  ttl?: number
) {
  return (params?: Record<string, any>) => {
    const key = apiCache.generateKey(endpoint, params);
    return apiCache.get(key, fetcher, ttl);
  };
}
