// FlyOn — Airport Autocomplete API v1.9.4 | 2026-02-08

import { NextRequest, NextResponse } from 'next/server';
import { amadeus } from '@/lib/amadeus';
import { getCached, CACHE_TTL } from '@/lib/cache';
import { findCountry } from '@/lib/countries';
import type { Airport } from '@/lib/types';

interface AmadeusLocation {
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
}

function mapToAirport(loc: AmadeusLocation): Airport {
  return {
    iataCode: loc.iataCode,
    name: loc.name,
    cityName: loc.address?.cityName || '',
    countryCode: loc.address?.countryCode || '',
    countryName: loc.address?.countryName || '',
    subType: loc.subType as 'AIRPORT' | 'CITY',
    detailedName: loc.detailedName,
    score: loc.analytics?.travelers?.score || 0,
  };
}

async function searchAirports(keyword: string, limit: string, countryCode?: string): Promise<AmadeusLocation[]> {
  const params: Record<string, string> = {
    subType: 'AIRPORT,CITY',
    keyword,
    'page[limit]': limit,
  };
  if (countryCode) params.countryCode = countryCode;

  const response = await amadeus.get<{ data: AmadeusLocation[] }>(
    '/v1/reference-data/locations',
    params,
  );
  return response.data || [];
}

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get('keyword');

  if (!keyword || keyword.length < 1) {
    return NextResponse.json({ data: [] });
  }

  try {
    const cacheKey = `airports:${keyword.toUpperCase()}`;

    const airports = await getCached<Airport[]>(cacheKey, CACHE_TTL.AIRPORTS, async () => {
      const country = findCountry(keyword);

      if (country) {
        // Search by major city names in that country (parallel, max 3 cities)
        const citySearches = country.majorCities.slice(0, 3).map((city) =>
          searchAirports(city, '3', country.code).catch(() => [] as AmadeusLocation[])
        );

        const cityResults = await Promise.all(citySearches);

        // Merge and deduplicate, preserving order (first city = most important)
        const seen = new Set<string>();
        const merged: Airport[] = [];

        for (const results of cityResults) {
          for (const loc of results) {
            if (!seen.has(loc.iataCode)) {
              seen.add(loc.iataCode);
              merged.push(mapToAirport(loc));
            }
          }
        }

        return merged.slice(0, 10);
      }

      // Standard keyword search (not a country name)
      const results = await searchAirports(keyword.toUpperCase(), '7');
      return results.map(mapToAirport);
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
