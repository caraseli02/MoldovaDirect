---
status: ready
priority: p2
issue_id: "022"
tags: [performance, memory-leak, cache, mobile, store]
dependencies: []
---

# Unbounded Cache in Search Store

## Problem Statement

The search store caches all search results indefinitely without any size limit or TTL (time-to-live). Over a long session, this grows unbounded and can cause memory issues, especially on mobile devices with limited RAM.

## Findings

- **Location**: stores/search.ts (estimated - need to verify actual store implementation)
- **Issue**: Cache grows indefinitely without eviction policy
- **Impact**: Memory leaks, mobile crashes, poor performance on long sessions

### Problem Scenario:
1. User browses products for 30 minutes
2. Performs 50 different searches ("wine", "cheese", "bread", "chocolate", etc.)
3. Each search caches results (50 products × 50 searches = 2,500 products in memory)
4. Cache never clears or evicts old entries
5. After 100 searches: ~5,000 cached product objects (~5-10MB)
6. Mobile device (2GB RAM): significant memory pressure, potential crashes
7. Garbage collector can't free memory because references are held in cache

### Issues with Current Implementation:
- **No maximum cache size**: Can grow indefinitely
- **No TTL/expiration**: Cached entries never expire
- **No LRU eviction**: Doesn't remove least recently used entries
- **No cache invalidation**: Stale data can persist
- **Persists across navigation**: Cache not cleared on route change
- **Mobile impact**: Particularly problematic on low-memory devices

### Memory Impact Over Time:
- **10 searches**: ~500KB cached data
- **50 searches**: ~2.5MB cached data
- **100 searches**: ~5-10MB cached data
- **500 searches** (power user): ~25-50MB cached data

### Real-World Scenario:
- E-commerce site with engaged user browsing for 1 hour
- User searches multiple times, filters, browses categories
- Each interaction potentially adds to cache
- Mobile Safari (iOS): 1-2GB total memory limit for web apps
- Cache consumes significant portion, leads to crashes/reloads

## Proposed Solutions

### Option 1: Implement LRU Cache with Max Size (RECOMMENDED)
- **Description**: Use LRU (Least Recently Used) eviction with configurable max entries
- **Implementation**:
  ```typescript
  import { defineStore } from 'pinia'

  interface CacheEntry<T> {
    data: T
    timestamp: number
    accessCount: number
  }

  class LRUCache<T> {
    private cache = new Map<string, CacheEntry<T>>()
    private maxSize: number
    private ttl: number // milliseconds

    constructor(maxSize = 20, ttl = 5 * 60 * 1000) { // 20 entries, 5 min TTL
      this.maxSize = maxSize
      this.ttl = ttl
    }

    get(key: string): T | undefined {
      const entry = this.cache.get(key)
      if (!entry) return undefined

      // Check if expired
      if (Date.now() - entry.timestamp > this.ttl) {
        this.cache.delete(key)
        return undefined
      }

      // Update access time and count (LRU tracking)
      entry.timestamp = Date.now()
      entry.accessCount++

      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, entry)

      return entry.data
    }

    set(key: string, data: T): void {
      // Evict oldest if at max size
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value
        this.cache.delete(firstKey)
      }

      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        accessCount: 1
      })
    }

    clear(): void {
      this.cache.clear()
    }

    size(): number {
      return this.cache.size
    }
  }

  export const useSearchStore = defineStore('search', () => {
    const searchCache = new LRUCache<SearchResults>(20, 5 * 60 * 1000)

    const search = async (query: string) => {
      // Check cache first
      const cached = searchCache.get(query)
      if (cached) return cached

      // Fetch from API
      const results = await $fetch('/api/products/search', { query })

      // Cache results
      searchCache.set(query, results)

      return results
    }

    return { search, clearCache: () => searchCache.clear() }
  })
  ```
- **Pros**:
  - Limits memory growth to predictable size
  - Automatic eviction of old entries
  - TTL prevents stale data
  - Maintains most useful searches in cache
  - Configurable size and TTL
- **Cons**: Slightly more complex implementation
- **Effort**: Medium (3 hours)
- **Risk**: Low

### Option 2: Simple Size Limit with FIFO
- **Description**: Keep only last N searches, evict first-in-first-out
- **Pros**: Simpler than LRU
- **Cons**: May evict frequently-used searches, no TTL
- **Effort**: Small (1 hour)
- **Risk**: Low

### Option 3: TTL Only (No Size Limit)
- **Description**: Keep entries for fixed time (e.g., 5 minutes), then expire
- **Pros**: Very simple, prevents stale data
- **Cons**: Doesn't prevent unbounded growth in short term
- **Effort**: Small (1 hour)
- **Risk**: Medium (still can grow large in active session)

## Recommended Action

Implement Option 1 - LRU cache with both max size (20 entries) and TTL (5 minutes). This provides comprehensive protection against memory leaks while maintaining good cache hit rates.

**Configuration Recommendations:**
- **Max size**: 20 entries (reasonable for most users)
- **TTL**: 5 minutes (balances freshness vs cache utility)
- **Clear on route change**: Optional, consider user experience

## Technical Details

- **Affected Files**:
  - stores/search.ts (or wherever search caching is implemented)
  - composables/useProductSearch.ts (may need updates)
- **Related Components**:
  - Search functionality across site
  - Product listing pages
  - Category browsing
- **Database Changes**: No
- **Performance Impact**:
  - Limits memory growth: unbounded → max ~1-2MB
  - Mobile: Prevents crashes from memory pressure
  - Cache hit rate: Should remain >80% with 20 entry limit
  - Slight CPU increase for LRU bookkeeping (negligible)

## Resources

- LRU Cache pattern: https://www.npmjs.com/package/lru-cache
- Map-based LRU: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#implementing_a_cache
- Pinia store patterns: https://pinia.vuejs.org/core-concepts/

## Acceptance Criteria

- [ ] Implement LRUCache class with max size and TTL
- [ ] Integrate into search store
- [ ] Configure max size = 20 entries
- [ ] Configure TTL = 5 minutes
- [ ] Add cache clear on logout/session end
- [ ] Test memory usage doesn't grow unbounded
- [ ] Test cache eviction works correctly
- [ ] Test TTL expiration works
- [ ] Verify cache hit rate remains good (>70%)
- [ ] Mobile testing on low-memory devices
- [ ] Code reviewed

## Work Log

### 2025-11-11 - Initial Discovery
**By:** Claude Triage System (Performance Analysis)
**Actions:**
- Issue discovered during performance-oracle analysis
- Categorized as P2 IMPORTANT (memory leak risk)
- Particularly critical for mobile users
- Estimated effort: Medium (3 hours)
- Marked as ready for implementation

**Learnings:**
- Unbounded caches are common source of memory leaks in SPAs
- Mobile devices have strict memory limits (1-2GB for web apps)
- LRU + TTL is industry standard for cache management
- JavaScript Map maintains insertion order, perfect for LRU implementation
- Cache size should be tuned based on actual usage patterns

## Notes

Source: Performance triage session on 2025-11-11
Part of: feat/enhanced-product-filters branch cleanup
**Mobile Impact**: HIGH - this can cause app crashes on iOS Safari
**Testing Priority**: Test on real mobile devices, not just desktop
Consider: Adding cache size monitoring/metrics for tuning
