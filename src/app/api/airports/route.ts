// FlyOn — Airport Autocomplete API v1.9.0 | 2026-02-06

import { NextRequest, NextResponse } from 'next/server';
import { amadeus } from '@/lib/amadeus';
import { getCached, CACHE_TTL } from '@/lib/cache';
import type { Airport } from '@/lib/types';

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get('keyword');

  if (!keyword || keyword.length < 1) {
    return NextResponse.json({ data: [] });
  }

  try {
    const cacheKey = `airports:${keyword.toUpperCase()}`;

    const airports = await getCached<Airport[]>(cacheKey, CACHE_TTL.AIRPORTS, async () => {
      const response = await amadeus.get<{ data: Array<{
        iataCode: string;
        name: string;
        subType: string;
        detailedName: string;
        address?: {
          cityName?: string;
          countryCode?: string;
          countryName?: string;
        };
        analytics?: {
          travelers?: { score?: number };
        };
      }> }>('/v1/reference-data/locations', {
        subType: 'AIRPORT,CITY',
        keyword: keyword.toUpperCase(),
        'page[limit]': '7',
      });

      return (response.data || []).map((loc) => ({
        iataCode: loc.iataCode,
        name: loc.name,
        cityName: loc.address?.cityName || '',
        countryCode: loc.address?.countryCode || '',
        countryName: loc.address?.countryName || '',
        subType: loc.subType as 'AIRPORT' | 'CITY',
        detailedName: loc.detailedName,
        score: loc.analytics?.travelers?.score || 0,
      }));
    });

    return NextResponse.json({ data: airports });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to search airports';
    console.error('Airport search error:', message);
    return NextResponse.json(
      { data: [], error: message },
      { status: 500 }
    );
  }
}
