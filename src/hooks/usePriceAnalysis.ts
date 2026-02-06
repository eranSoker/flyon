// FlyOn — usePriceAnalysis Hook v1.7.0 | 2026-02-06

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isBefore, startOfDay } from 'date-fns';
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

    // Only fetch for future dates
    const futureDays = allDays.filter((d) => !isBefore(d, today));

    // Batch requests: fetch 5 dates at a time to avoid rate limiting
    const batchSize = 5;
    const results = new Map<string, number | null>();

    for (let i = 0; i < futureDays.length; i += batchSize) {
      if (abortRef.current.signal.aborted) return;

      const batch = futureDays.slice(i, i + batchSize);
      const promises = batch.map(async (day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        try {
          const params = new URLSearchParams({
            origin,
            destination,
            departureDate: dateStr,
          });
          const res = await fetch(`/api/price-analysis?${params}`, {
            signal: abortRef.current!.signal,
          });
          if (!res.ok) {
            results.set(dateStr, null);
            return;
          }
          const data = await res.json();

          if (data.fallback && data.flightOffers?.data?.length > 0) {
            const prices = data.flightOffers.data.map((o: { price: { grandTotal: string } }) =>
              parseFloat(o.price.grandTotal)
            );
            results.set(dateStr, Math.min(...prices));
          } else if (data.data?.length > 0) {
            const firstMetric = data.data[0];
            const price = firstMetric?.priceMetrics?.find(
              (m: { quartileRanking: string }) => m.quartileRanking === 'MINIMUM'
            );
            results.set(dateStr, price ? parseFloat(price.amount) : null);
          } else {
            results.set(dateStr, null);
          }
        } catch {
          results.set(dateStr, null);
        }
      });

      await Promise.allSettled(promises);

      // Progressive update
      setDays((prev) =>
        prev.map((d) => {
          if (results.has(d.date)) {
            return { ...d, minPrice: results.get(d.date) ?? null, loading: false };
          }
          return d;
        })
      );
    }

    setLoading(false);
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
