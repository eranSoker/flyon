// FlyOn — useAirportSearch Hook v1.3.0 | 2026-02-06

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
        setResults(data.data || []);
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
