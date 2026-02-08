// FlyOn — useAirportSearch Hook v1.3.1 | 2026-02-06

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Airport } from '@/lib/types';

const DEBOUNCE_MS = 300;

export function useAirportSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((keyword: string) => {
    setQuery(keyword);
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    timerRef.current = setTimeout(async () => {
      // Abort previous request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      try {
        const res = await fetch(`/api/airports?keyword=${encodeURIComponent(query)}`, {
          signal: abortRef.current.signal,
        });
        const data = await res.json();
        // Deduplicate by iataCode — API can return same code for sub-airports
        const airports: Airport[] = data.data || [];
        const seen = new Set<string>();
        const unique = airports.filter((a) => {
          if (seen.has(a.iataCode)) return false;
          seen.add(a.iataCode);
          return true;
        });
        setResults(unique);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Airport search error:', error);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return { query, results, loading, search, clear };
}
