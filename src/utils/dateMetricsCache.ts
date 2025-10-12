// Date Metrics Cache Utility
// LRU cache for date metrics to reduce database queries

import { DailyMetrics } from '../types';

interface CacheEntry {
  data: DailyMetrics | null;
  timestamp: number;
}

class DateMetricsCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private ttlMs: number; // Time to live in milliseconds

  constructor(maxSize: number = 21, ttlMs: number = 5 * 60 * 1000) { // 21 days, 5min TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  /**
   * Get cached metrics for a date
   */
  get(date: string): DailyMetrics | null | undefined {
    const entry = this.cache.get(date);
    
    if (!entry) {
      return undefined; // Cache miss
    }
    
    // Check if cache entry is still valid
    const isExpired = Date.now() - entry.timestamp > this.ttlMs;
    if (isExpired) {
      this.cache.delete(date);
      return undefined; // Expired
    }
    
    // Move to end (most recently used)
    this.cache.delete(date);
    this.cache.set(date, entry);
    
    return entry.data;
  }

  /**
   * Set metrics for a date in cache
   */
  set(date: string, data: DailyMetrics | null): void {
    // If cache is full, remove oldest entry (first in Map)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(date, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Invalidate cache for a specific date
   */
  invalidate(date: string): void {
    this.cache.delete(date);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if date is in cache and valid
   */
  has(date: string): boolean {
    const result = this.get(date);
    return result !== undefined;
  }
}

// Export singleton instance
export const dateMetricsCache = new DateMetricsCache();

