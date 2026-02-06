// FlyOn — Price Calendar API v1.9.0 | 2026-02-06
// Builds price calendar from batched Flight Offers Search requests (max=1 per date)

import { NextRequest, NextResponse } from 'next/server';
import { amadeus } from '@/lib/amadeus';
import { getCached, CACHE_TTL } from '@/lib/cache';

interface CalendarEntry {
  date: string;
  price: number | null;
  currency: string;
}

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 200;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const origin = params.get('origin');
  const destination = params.get('destination');
  const centerDate = params.get('date');
  const adults = params.get('adults') || '1';
  const currency = params.get('currency') || 'EUR';

  if (!origin || !destination || !centerDate) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  // Generate dates: +/- 15 days around the center date
  const center = new Date(centerDate);
  const today = new Date(new Date().toDateString());
  const dates: string[] = [];

  for (let i = -15; i <= 15; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    // Skip past dates
    if (d >= today) {
      dates.push(d.toISOString().split('T')[0]);
    }
  }

  const cacheKey = `price-cal:${origin}:${destination}:${centerDate}:${adults}:${currency}`;

  try {
    const calendar = await getCached<CalendarEntry[]>(cacheKey, CACHE_TTL.PRICE_CALENDAR, async () => {
      const results: CalendarEntry[] = [];

      // Batch requests to avoid rate limiting (5 at a time with delay)
      for (let i = 0; i < dates.length; i += BATCH_SIZE) {
        const batch = dates.slice(i, i + BATCH_SIZE);

        const batchResults = await Promise.allSettled(
          batch.map(async (date): Promise<CalendarEntry> => {
            try {
              const res = await amadeus.get<{
                data?: Array<{ price?: { grandTotal?: string; currency?: string } }>;
              }>('/v2/shopping/flight-offers', {
                originLocationCode: origin,
                destinationLocationCode: destination,
                departureDate: date,
                adults,
                currencyCode: currency,
                max: '1',
                nonStop: 'false',
              });

              return {
                date,
                price: res.data?.[0]?.price?.grandTotal
                  ? parseFloat(res.data[0].price.grandTotal)
                  : null,
                currency: res.data?.[0]?.price?.currency || currency,
              };
            } catch {
              return { date, price: null, currency };
            }
          })
        );

        for (const r of batchResults) {
          if (r.status === 'fulfilled') {
            results.push(r.value);
          }
        }

        // Small delay between batches to respect rate limits
        if (i + BATCH_SIZE < dates.length) {
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
        }
      }

      return results;
    });

    return NextResponse.json({ data: calendar });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get price calendar';
    console.error('Price calendar error:', message);
    return NextResponse.json(
      { error: message, data: [] },
      { status: 500 }
    );
  }
}
