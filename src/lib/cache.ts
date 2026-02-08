// FlyOn — Server-side Cache v1.9.4 | 2026-02-07

const cache = new Map<string, { data: unknown; expiry: number }>();

export async function getCached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data as T;
  }

  const data = await fetcher();

  // Don't cache empty arrays — likely rate-limited or transient API failure
  const isEmptyArray = Array.isArray(data) && data.length === 0;
  if (!isEmptyArray) {
    cache.set(key, { data, expiry: Date.now() + ttlMs });
  }

  return data;
}

// Cache TTL constants
export const CACHE_TTL = {
  AIRPORTS: 24 * 60 * 60 * 1000,   // 24 hours
  FLIGHTS: 10 * 60 * 1000,         // 10 minutes
  PRICE_CALENDAR: 15 * 60 * 1000,  // 15 minutes
} as const;
