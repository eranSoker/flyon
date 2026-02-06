// FlyOn — Server-side Cache v1.9.0 | 2026-02-06

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
  cache.set(key, { data, expiry: Date.now() + ttlMs });
  return data;
}

// Cache TTL constants
export const CACHE_TTL = {
  AIRPORTS: 24 * 60 * 60 * 1000,   // 24 hours
  PRICE_CALENDAR: 15 * 60 * 1000,  // 15 minutes
} as const;
