import { ICache } from '../interfaces/ICache.js';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class InMemoryCache<T> implements ICache<T> {
  private cache: Map<string, CacheItem<T>>;
  private TTL: number;

  constructor(ttlMs = 1000 * 60 * 60) {
    this.cache = new Map();
    this.TTL = ttlMs;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  clear(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }

  flush(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
