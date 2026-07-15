interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000;
const MAX_SUBMISSIONS_PER_WINDOW = 8;

const globalForRateLimit = globalThis as typeof globalThis & {
  mishliScoreRateLimits?: Map<string, RateLimitEntry>;
};

const buckets =
  globalForRateLimit.mishliScoreRateLimits ??
  new Map<string, RateLimitEntry>();

globalForRateLimit.mishliScoreRateLimits = buckets;

/**
 * Process-local protection only. Vercel instances do not share this map, so a
 * globally authoritative limiter should use a managed distributed store.
 */
export function isScoreSubmissionRateLimited(
  key: string,
  now = Date.now(),
): boolean {
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_SUBMISSIONS_PER_WINDOW;
}
