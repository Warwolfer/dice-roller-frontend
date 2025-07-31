import { ref, reactive, readonly } from 'vue'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface PendingRequest {
  promise: Promise<any>
  controller: AbortController
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>()
  private pendingRequests = new Map<string, PendingRequest>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  private getCacheKey(url: string, options?: RequestInit): string {
    if (!options) {
      return `${url}:{}`
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { signal, ...keyOptions } = options
    return `${url}:${JSON.stringify(keyOptions)}`
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  async fetch<T>(url: string, options?: RequestInit, ttl: number = this.DEFAULT_TTL): Promise<T> {
    const cacheKey = this.getCacheKey(url, options)
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && !this.isExpired(cached)) {
      console.log(`Cache hit for ${url}`)
      return cached.data
    }

    // Check if request is already pending (deduplication)
    const pending = this.pendingRequests.get(cacheKey)
    if (pending) {
      console.log(`Request deduplication for ${url}`)
      return pending.promise
    }

    // Create new request
    const controller = new AbortController()
    const fetchOptions = {
      ...options,
      signal: controller.signal
    }

    const promise = fetch(url, fetchOptions)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const data = await response.json()
        
        // Cache the result
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl
        })
        
        console.log(`Cached response for ${url}`)
        return data
      })
      .finally(() => {
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey)
      })

    // Store pending request
    this.pendingRequests.set(cacheKey, { promise, controller })

    return promise
  }

  invalidate(url: string, options?: RequestInit): void {
    const cacheKey = this.getCacheKey(url, options)
    this.cache.delete(cacheKey)
    
    // Cancel pending request if exists
    const pending = this.pendingRequests.get(cacheKey)
    if (pending) {
      pending.controller.abort()
      this.pendingRequests.delete(cacheKey)
    }
  }

  invalidatePattern(pattern: RegExp): void {
    // Invalidate cache entries matching pattern
    for (const [key] of this.cache) {
      if (pattern.test(key)) {
        this.cache.delete(key)
      }
    }
    
    // Cancel pending requests matching pattern
    for (const [key, pending] of this.pendingRequests) {
      if (pattern.test(key)) {
        pending.controller.abort()
        this.pendingRequests.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
    
    // Cancel all pending requests
    for (const [, pending] of this.pendingRequests) {
      pending.controller.abort()
    }
    this.pendingRequests.clear()
  }

  getCacheSize(): number {
    return this.cache.size
  }

  getPendingRequestsCount(): number {
    return this.pendingRequests.size
  }
}

// Global cache instance
const apiCache = new ApiCache()

export function useApiCache() {
  const cacheStats = reactive({
    size: 0,
    pendingRequests: 0
  })

  const updateStats = () => {
    cacheStats.size = apiCache.getCacheSize()
    cacheStats.pendingRequests = apiCache.getPendingRequestsCount()
  }

  const cachedFetch = async <T>(
    url: string, 
    options?: RequestInit, 
    ttl?: number
  ): Promise<T> => {
    try {
      const result = await apiCache.fetch<T>(url, options, ttl)
      updateStats()
      return result
    } catch (error) {
      updateStats()
      throw error
    }
  }

  const invalidateCache = (url: string, options?: RequestInit) => {
    apiCache.invalidate(url, options)
    updateStats()
  }

  const invalidateCachePattern = (pattern: RegExp) => {
    apiCache.invalidatePattern(pattern)
    updateStats()
  }

  const clearCache = () => {
    apiCache.clear()
    updateStats()
  }

  // Update stats initially
  updateStats()

  return {
    cachedFetch,
    invalidateCache,
    invalidateCachePattern,
    clearCache,
    cacheStats: readonly(cacheStats)
  }
}