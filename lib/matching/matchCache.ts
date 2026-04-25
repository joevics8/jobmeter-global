import { MatchResult } from './matchEngine';

const CACHE_PREFIX = 'match_cache_';
const CACHE_EXPIRY_DAYS = 7; // Cache expires after 7 days

interface CachedMatch {
  score: number;
  breakdown: MatchResult['breakdown'];
  cachedAt: string;
}

interface MatchCache {
  [jobId: string]: CachedMatch;
}

export class MatchCacheService {
  private getCacheKey(userId: string): string {
    return `${CACHE_PREFIX}${userId}`;
  }

  /**
   * Load match cache for a user from localStorage
   */
  loadMatchCache(userId: string | null): MatchCache {
    if (!userId || typeof window === 'undefined') {
      return {};
    }

    try {
      const cacheKey = this.getCacheKey(userId);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        return {};
      }

      const cache: MatchCache = JSON.parse(cached);
      const now = new Date();
      
      // Filter out expired entries
      const validCache: MatchCache = {};
      for (const [jobId, match] of Object.entries(cache)) {
        const cachedAt = new Date(match.cachedAt);
        const daysSinceCache = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceCache < CACHE_EXPIRY_DAYS) {
          validCache[jobId] = match;
        }
      }

      // Save cleaned cache back if any were removed
      if (Object.keys(validCache).length !== Object.keys(cache).length) {
        this.saveMatchCache(userId, validCache);
      }

      return validCache;
    } catch (error) {
      console.error('Error loading match cache:', error);
      return {};
    }
  }

  /**
   * Save match cache for a user to localStorage
   */
  saveMatchCache(userId: string | null, cache: MatchCache): void {
    if (!userId || typeof window === 'undefined') {
      return;
    }

    try {
      const cacheKey = this.getCacheKey(userId);
      localStorage.setItem(cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.error('Error saving match cache:', error);
      // Handle quota exceeded error
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // Clear old cache and try again
        this.clearMatchCache(userId);
      }
    }
  }

  /**
   * Get a cached match for a specific job
   */
  getCachedMatch(userId: string | null, jobId: string): CachedMatch | null {
    const cache = this.loadMatchCache(userId);
    return cache[jobId] || null;
  }

  /**
   * Save a single match to cache
   */
  saveCachedMatch(userId: string | null, jobId: string, match: MatchResult): void {
    if (!userId) return;

    const cache = this.loadMatchCache(userId);
    cache[jobId] = {
      score: match.score,
      breakdown: match.breakdown,
      cachedAt: new Date().toISOString(),
    };
    this.saveMatchCache(userId, cache);
  }

  /**
   * Clear match cache for a user
   */
  clearMatchCache(userId: string | null): void {
    if (!userId || typeof window === 'undefined') {
      return;
    }

    try {
      const cacheKey = this.getCacheKey(userId);
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Error clearing match cache:', error);
    }
  }

  /**
   * Invalidate cache for a specific job (useful when job is updated)
   */
  invalidateJob(userId: string | null, jobId: string): void {
    if (!userId) return;

    const cache = this.loadMatchCache(userId);
    if (cache[jobId]) {
      delete cache[jobId];
      this.saveMatchCache(userId, cache);
    }
  }

  /**
   * Invalidate all caches for all users (useful for admin operations)
   */
  clearAllCaches(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing all match caches:', error);
    }
  }
}

export const matchCacheService = new MatchCacheService();














