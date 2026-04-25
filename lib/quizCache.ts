// 📁 lib/quizCache.ts
/**
 * Lightweight localStorage cache for quiz data.
 * TTL: 7 days. Stale entries are auto-evicted on read.
 *
 * ┌─ CACHE BUSTING (for you, the developer) ───────────────────────────────┐
 * │ Bump CACHE_VERSION below whenever you update questions or company data. │
 * │ Every user's old cache will be treated as stale on their next visit,    │
 * │ and fresh data will be fetched automatically from Supabase.             │
 * └────────────────────────────────────────────────────────────────────────┘
 */

// ── Bump this string whenever you want everyone to get a fresh load ──────────
// Format suggestion: 'v' + date, e.g. 'v2024-07-01' or just increment: 'v2'
export const CACHE_VERSION = 'v1';

const VERSION_KEY = 'quiz_cache_version';
const TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/** Call once on app init (e.g. in the quiz listing page useEffect).
 *  If the stored version doesn't match CACHE_VERSION, all quiz_ keys are wiped. */
export function checkCacheVersion(): void {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(VERSION_KEY);
  if (stored !== CACHE_VERSION) {
    // Wipe all quiz cache entries
    Object.keys(localStorage)
      .filter((k) => k.startsWith('quiz_') && k !== VERSION_KEY)
      .forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(VERSION_KEY, CACHE_VERSION);
  }
}

export function getCached<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // storage full or unavailable — fail silently
  }
}

export function clearCacheKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

/** Wipes all quiz-related cache entries (keys prefixed with "quiz_") */
export function clearQuizCache(): void {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith('quiz_'))
    .forEach((k) => localStorage.removeItem(k));
}

// ── Cache key constants ──────────────────────────────────────────────────────
export const CACHE_KEYS = {
  companies: 'quiz_companies',
  companyData: (company: string) => `quiz_company_${company.toLowerCase().replace(/\s+/g, '_')}`,
  sections: (company: string) => `quiz_sections_${company.toLowerCase().replace(/\s+/g, '_')}`,
};