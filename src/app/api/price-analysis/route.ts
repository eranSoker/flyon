// FlyOn — Price Analysis API v1.2.0 | 2026-02-06

import { NextRequest, NextResponse } from 'next/server';
import { amadeus } from '@/lib/amadeus';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = params.get('origin');
  const destination = params.get('destination');
  const departureDate = params.get('departureDate');

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { error: 'Missing required parameters: origin, destination, departureDate' },
      { status: 400 }
    );
  }

  try {
    // Try the price metrics endpoint first
    const response = await amadeus.get('/v1/analytics/itinerary-price-metrics', {
      originIataCode: origin,
      destinationIataCode: destination,
      departureDate,
      currencyCode: 'USD',
      oneWay: 'false',
    });

    return NextResponse.json(response);
  } catch {
    // Fallback: fetch flight offers for the given date and return min price
    try {
      const fallbackResponse = await amadeus.get('/v2/shopping/flight-offers', {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        adults: '1',
        max: '5',
        currencyCode: 'USD',
      });

      return NextResponse.json({
        data: [],
        fallback: true,
        flightOffers: fallbackResponse,
      });
    } catch (fallbackError) {
      console.error('Price analysis fallback error:', fallbackError);
      return NextResponse.json(
        { error: 'Failed to get price analysis', data: [] },
        { status: 500 }
      );
    }
  }
}
