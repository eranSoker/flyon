// FlyOn — Flight Search API v1.9.0 | 2026-02-06

import { NextRequest, NextResponse } from 'next/server';
import { amadeus } from '@/lib/amadeus';
import type { AmadeusFlightResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = params.get('origin');
  const destination = params.get('destination');
  const departureDate = params.get('departureDate');
  const adults = params.get('adults') || '1';

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { error: 'Missing required parameters: origin, destination, departureDate' },
      { status: 400 }
    );
  }

  try {
    const queryParams: Record<string, string> = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults,
      max: params.get('max') || '50',
      currencyCode: params.get('currency') || 'EUR',
    };

    // Optional params
    const returnDate = params.get('returnDate');
    if (returnDate) queryParams.returnDate = returnDate;

    const travelClass = params.get('travelClass') || params.get('cabinClass');
    if (travelClass) queryParams.travelClass = travelClass;

    const nonStop = params.get('nonStop');
    if (nonStop === 'true') queryParams.nonStop = 'true';

    const children = params.get('children');
    if (children && children !== '0') queryParams.children = children;

    const infants = params.get('infants');
    if (infants && infants !== '0') queryParams.infants = infants;

    const response = await amadeus.get<AmadeusFlightResponse>(
      '/v2/shopping/flight-offers',
      queryParams
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to search flights';
    console.error('Flight search error:', message);
    return NextResponse.json(
      { error: message, data: [], dictionaries: {} },
      { status: 500 }
    );
  }
}
