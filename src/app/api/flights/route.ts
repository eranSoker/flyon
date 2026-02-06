// FlyOn — Flight Search API v1.2.0 | 2026-02-06

import { NextRequest, NextResponse } from 'next/server';
import { amadeus } from '@/lib/amadeus';
import { AmadeusFlightResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = params.get('origin');
  const destination = params.get('destination');
  const departureDate = params.get('departureDate');
  const returnDate = params.get('returnDate');
  const adults = params.get('adults') || '1';
  const children = params.get('children');
  const infants = params.get('infants');
  const cabinClass = params.get('cabinClass');
  const nonStop = params.get('nonStop');

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
      max: '50',
      currencyCode: 'USD',
    };

    if (returnDate) queryParams.returnDate = returnDate;
    if (children && children !== '0') queryParams.children = children;
    if (infants && infants !== '0') queryParams.infants = infants;
    if (cabinClass) queryParams.travelClass = cabinClass;
    if (nonStop === 'true') queryParams.nonStop = 'true';

    const response = (await amadeus.get(
      '/v2/shopping/flight-offers',
      queryParams
    )) as AmadeusFlightResponse;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Flight search error:', error);
    return NextResponse.json(
      { error: 'Failed to search flights' },
      { status: 500 }
    );
  }
}
