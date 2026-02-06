// FlyOn — usePriceAnalysis Hook v1.9.0 | 2026-02-06
// Uses /api/price-calendar endpoint (batched Flight Offers Search)

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, startOfDay } from 'date-fns';
import type { PriceCalendarDay } from '@/lib/types';

interface UsePriceAnalysisParams {
  origin: string;
  destination: string;
  month: Date;
}

export function usePriceAnalysis({ origin, destination, month }: UsePriceAnalysisParams) {
  const [days, setDays] = useState<PriceCalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPrices = useCallback(async () => {
    if (!origin || !destination) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const today = startOfDay(new Date());
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Initialize all days as loading
    const initialDays: PriceCalendarDay[] = allDays.map((d) => ({
      date: format(d, 'yyyy-MM-dd'),
      minPrice: null,
      loading: !isBefore(d, today),
    }));
    setDays(initialDays);
    setLoading(true);

    // Use the middle of the month as the center date for the API request
    const centerDay = Math.min(15, monthEnd.getDate());
    const centerDate = format(
      new Date(monthStart.getFullYear(), monthStart.getMonth(), centerDay),
      'yyyy-MM-dd'
    );

    try {
      const params = new URLSearchParams({
        origin,
        destination,
        date: centerDate,
      });

      const res = await fetch(`/api/price-calendar?${params}`, {
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      const calendarData: Array<{ date: string; price: number | null; currency: string }> =
        data.data || [];

      // Map results to PriceCalendarDay format
      const priceMap = new Map<string, number | null>();
      calendarData.forEach((entry) => {
        priceMap.set(entry.date, entry.price);
      });

      setDays(
        allDays.map((d) => {
          const dateStr = format(d, 'yyyy-MM-dd');
          const isPast = isBefore(d, today);
          return {
            date: dateStr,
            minPrice: isPast ? null : (priceMap.get(dateStr) ?? null),
            loading: false,
          };
        })
      );
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        // On error, just show no prices
        setDays(
          allDays.map((d) => ({
            date: format(d, 'yyyy-MM-dd'),
            minPrice: null,
            loading: false,
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [origin, destination, month]);

  useEffect(() => {
    fetchPrices();
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [fetchPrices]);

  return { days, loading };
}
