// FlyOn — Airport Autocomplete API v1.2.0 | 2026-02-06

import { NextRequest, NextResponse } from 'next/server';
import { amadeus } from '@/lib/amadeus';
import { AmadeusLocationResponse, Airport } from '@/lib/types';

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get('keyword');

  if (!keyword || keyword.length < 2) {
    return NextResponse.json({ data: [] });
  }

  try {
    const response = (await amadeus.get('/v1/reference-data/locations', {
      subType: 'AIRPORT,CITY',
      keyword: keyword.toUpperCase(),
      'page[limit]': '10',
      sort: 'analytics.travelers.score',
      view: 'LIGHT',
    })) as AmadeusLocationResponse;

    const airports: Airport[] = (response.data || []).map((loc) => ({
      iataCode: loc.iataCode,
      name: loc.name,
      cityName: loc.address.cityName,
      countryCode: loc.address.countryCode,
    }));

    return NextResponse.json({ data: airports });
  } catch (error) {
    console.error('Airport search error:', error);
    return NextResponse.json(
      { error: 'Failed to search airports' },
      { status: 500 }
    );
  }
}
