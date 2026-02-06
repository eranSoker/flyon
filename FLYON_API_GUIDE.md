# Flyon — Amadeus API Guide

> Built from real, tested API responses (Feb 2026). Only includes endpoints verified to work in the test environment.

---

## Credentials

```env
# .env.local
AMADEUS_API_KEY=AMcmwhu7OzAY8i7H1vbalMEEXTk2gt03
AMADEUS_API_SECRET=BJkcNe7ePk1Y5vWL
AMADEUS_BASE_URL=https://test.api.amadeus.com
```

> ⚠️ **NEVER expose these client-side.** All Amadeus calls go through Next.js Route Handlers (server-side only).

---

## Working Endpoints (2 total)

| # | Endpoint | Path | Purpose |
|---|----------|------|---------|
| 1 | **Airport Autocomplete** | `GET /v1/reference-data/locations` | Search bar typeahead |
| 2 | **Flight Offers Search** | `GET /v2/shopping/flight-offers` | Core search + price data for graph + calendar |

### Endpoints NOT available in test environment

| Endpoint | Status | Reason |
|----------|--------|--------|
| Flight Inspiration Search (`/v1/shopping/flight-destinations`) | 500 | Test cache not populated |
| Flight Cheapest Date Search (`/v1/shopping/flight-dates`) | 500 | Test cache not populated |
| Itinerary Price Metrics (`/v1/analytics/itinerary-price-metrics`) | 410 | **Decommissioned permanently** |

**Our strategy:** Build the price graph AND price calendar entirely from Flight Offers Search by making parallel requests for multiple dates. This is more accurate (real-time prices) and more reliable.

---

## Authentication

### How It Works

Amadeus uses OAuth2 client credentials. You POST your API key + secret and receive a Bearer token valid for ~30 minutes.

### Token Request

```
POST /v1/security/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id={API_KEY}&client_secret={API_SECRET}
```

### Token Response (real)

```json
{
  "type": "amadeusOAuth2Token",
  "username": "eran1618@gmail.com",
  "application_name": "Flyon",
  "client_id": "AMcmwhu7OzAY8i7H1vbalMEEXTk2gt03",
  "token_type": "Bearer",
  "access_token": "txQKtE9JP2uJCVhfv8lfCVJXY75A",
  "expires_in": 1799,
  "state": "approved",
  "scope": ""
}
```

### Server-Side Token Manager

```typescript
// src/lib/amadeus.ts

class AmadeusClient {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  private async authenticate(): Promise<string> {
    const res = await fetch(
      `${process.env.AMADEUS_BASE_URL}/v1/security/oauth2/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.AMADEUS_API_KEY!,
          client_secret: process.env.AMADEUS_API_SECRET!,
        }),
      }
    );

    if (!res.ok) throw new Error(`Amadeus auth failed: ${res.status}`);

    const data = await res.json();
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // refresh 60s early
    return this.token!;
  }

  async getToken(): Promise<string> {
    if (!this.token || Date.now() >= this.tokenExpiry) {
      return this.authenticate();
    }
    return this.token;
  }

  async get<T = any>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const token = await this.getToken();
    const url = new URL(`${process.env.AMADEUS_BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, v);
    });

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const detail = body.errors?.[0]?.detail || body.errors?.[0]?.title || `HTTP ${res.status}`;
      throw new Error(`Amadeus error: ${detail}`);
    }

    return res.json();
  }
}

export const amadeus = new AmadeusClient();
```

---

## Endpoint 1: Airport Autocomplete

### Request

```
GET /v1/reference-data/locations?subType=AIRPORT,CITY&keyword=LON&page[limit]=5
```

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `subType` | ✅ | string | `AIRPORT`, `CITY`, or `AIRPORT,CITY` |
| `keyword` | ✅ | string | User's search input (min 1 character) |
| `page[limit]` | ❌ | number | Max results per page (default 10) |
| `page[offset]` | ❌ | number | Pagination offset |

### Real Response (keyword="LON")

```json
{
  "meta": {
    "count": 49,
    "links": {
      "self": "...",
      "next": "...&page[offset]=5&page[limit]=5",
      "last": "...&page[offset]=44&page[limit]=5"
    }
  },
  "data": [
    {
      "type": "location",
      "subType": "CITY",
      "name": "LONDON",
      "detailedName": "LONDON/GB",
      "id": "CLON",
      "iataCode": "LON",
      "timeZoneOffset": "+00:00",
      "geoCode": {
        "latitude": 51.50000,
        "longitude": -0.16666
      },
      "address": {
        "cityName": "LONDON",
        "cityCode": "LON",
        "countryName": "UNITED KINGDOM",
        "countryCode": "GB",
        "regionCode": "EUROP"
      },
      "analytics": {
        "travelers": {
          "score": 100
        }
      }
    },
    {
      "type": "location",
      "subType": "AIRPORT",
      "name": "HEATHROW",
      "detailedName": "LONDON/GB:HEATHROW",
      "id": "ALHR",
      "iataCode": "LHR",
      "geoCode": {
        "latitude": 51.47750,
        "longitude": -0.46138
      },
      "address": {
        "cityName": "LONDON",
        "cityCode": "LON",
        "countryName": "UNITED KINGDOM",
        "countryCode": "GB",
        "regionCode": "EUROP"
      },
      "analytics": {
        "travelers": {
          "score": 45
        }
      }
    }
    // ... GATWICK (LGW, score 27), STANSTED (STN, score 15), LUTON (LTN, score 10)
  ]
}
```

### Key Fields to Extract

| Field | Use in Flyon |
|-------|-------------|
| `iataCode` | Send to Flight Offers Search as origin/destination |
| `name` | Display name (e.g., "HEATHROW") |
| `address.cityName` | City grouping (e.g., "LONDON") |
| `address.countryCode` | Country flag display |
| `subType` | Distinguish CITY vs AIRPORT in dropdown |
| `analytics.travelers.score` | Sort results by popularity (higher = more popular) |
| `detailedName` | Fallback display ("LONDON/GB:HEATHROW") |

### Next.js Route Handler

```typescript
// src/app/api/airports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { amadeus } from '@/lib/amadeus';

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get('keyword');

  if (!keyword || keyword.length < 1) {
    return NextResponse.json({ data: [] });
  }

  try {
    const response = await amadeus.get('/v1/reference-data/locations', {
      subType: 'AIRPORT,CITY',
      keyword: keyword.toUpperCase(),
      'page[limit]': '7',
    });

    const airports = response.data.map((loc: any) => ({
      iataCode: loc.iataCode,
      name: loc.name,
      cityName: loc.address?.cityName,
      countryCode: loc.address?.countryCode,
      countryName: loc.address?.countryName,
      subType: loc.subType,
      detailedName: loc.detailedName,
      score: loc.analytics?.travelers?.score || 0,
    }));

    return NextResponse.json({ data: airports });
  } catch (error: any) {
    console.error('Airport search error:', error.message);
    return NextResponse.json({ data: [], error: error.message }, { status: 500 });
  }
}
```

### Frontend Hook

```typescript
// src/hooks/useAirportSearch.ts
import { useState, useEffect, useRef } from 'react';

interface Airport {
  iataCode: string;
  name: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  subType: 'AIRPORT' | 'CITY';
  detailedName: string;
  score: number;
}

export function useAirportSearch(query: string) {
  const [results, setResults] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/airports?keyword=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { results, loading };
}
```

---

## Endpoint 2: Flight Offers Search

This is the **backbone of Flyon**. It powers:
- ✈️ Flight results list
- 📊 Price graph (derived from results)
- 📅 Price calendar (parallel calls for multiple dates)

### Request

```
GET /v2/shopping/flight-offers?originLocationCode=MAD&destinationLocationCode=MUC&departureDate=2026-04-15&returnDate=2026-04-22&adults=1&max=50&currencyCode=EUR
```

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `originLocationCode` | ✅ | string | IATA code: `MAD`, `JFK`, `LON`, etc. |
| `destinationLocationCode` | ✅ | string | IATA code |
| `departureDate` | ✅ | string | `YYYY-MM-DD` format |
| `adults` | ✅ | number | 1-9 |
| `returnDate` | ❌ | string | `YYYY-MM-DD` — omit for one-way |
| `children` | ❌ | number | 0-8 |
| `infants` | ❌ | number | 0-4 |
| `travelClass` | ❌ | string | `ECONOMY`, `PREMIUM_ECONOMY`, `BUSINESS`, `FIRST` |
| `nonStop` | ❌ | boolean | `true` = direct flights only |
| `currencyCode` | ❌ | string | ISO 4217: `EUR`, `USD`, `GBP` |
| `maxPrice` | ❌ | number | Max price per traveler (integer, no decimals) |
| `max` | ❌ | number | Max results: 1-250 (default 250) |

### Real Response (MAD → MUC, 5 results)

```json
{
  "meta": {
    "count": 5,
    "links": {
      "self": "https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=MAD&destinationLocationCode=MUC&departureDate=2026-04-15&returnDate=2026-04-22&adults=1&max=5&currencyCode=EUR"
    }
  },

  "data": [
    {
      "type": "flight-offer",
      "id": "1",
      "source": "GDS",
      "instantTicketingRequired": false,
      "nonHomogeneous": false,
      "oneWay": false,
      "isUpsellOffer": false,
      "lastTicketingDate": "2026-02-07",
      "lastTicketingDateTime": "2026-02-07",
      "numberOfBookableSeats": 9,

      "itineraries": [
        {
          "duration": "PT2H35M",
          "segments": [
            {
              "departure": {
                "iataCode": "MAD",
                "terminal": "2",
                "at": "2026-04-15T15:00:00"
              },
              "arrival": {
                "iataCode": "MUC",
                "terminal": "1",
                "at": "2026-04-15T17:35:00"
              },
              "carrierCode": "UX",
              "number": "1517",
              "aircraft": { "code": "7M8" },
              "operating": { "carrierCode": "UX" },
              "duration": "PT2H35M",
              "id": "2",
              "numberOfStops": 0,
              "blacklistedInEU": false
            }
          ]
        },
        {
          "duration": "PT2H50M",
          "segments": [
            {
              "departure": {
                "iataCode": "MUC",
                "terminal": "1",
                "at": "2026-04-22T10:45:00"
              },
              "arrival": {
                "iataCode": "MAD",
                "terminal": "2",
                "at": "2026-04-22T13:35:00"
              },
              "carrierCode": "UX",
              "number": "1516",
              "aircraft": { "code": "7M8" },
              "operating": { "carrierCode": "UX" },
              "duration": "PT2H50M",
              "id": "7",
              "numberOfStops": 0,
              "blacklistedInEU": false
            }
          ]
        }
      ],

      "price": {
        "currency": "EUR",
        "total": "151.04",
        "base": "78.00",
        "fees": [
          { "amount": "0.00", "type": "SUPPLIER" },
          { "amount": "0.00", "type": "TICKETING" }
        ],
        "grandTotal": "151.04",
        "additionalServices": [
          { "amount": "80.00", "type": "CHECKED_BAGS" }
        ]
      },

      "pricingOptions": {
        "fareType": ["PUBLISHED"],
        "includedCheckedBagsOnly": false
      },

      "validatingAirlineCodes": ["UX"],

      "travelerPricings": [
        {
          "travelerId": "1",
          "fareOption": "STANDARD",
          "travelerType": "ADULT",
          "price": {
            "currency": "EUR",
            "total": "151.04",
            "base": "78.00"
          },
          "fareDetailsBySegment": [
            {
              "segmentId": "2",
              "cabin": "ECONOMY",
              "fareBasis": "NYYR5L",
              "brandedFare": "LITE",
              "brandedFareLabel": "LITE",
              "class": "N",
              "includedCheckedBags": { "quantity": 0 },
              "includedCabinBags": { "quantity": 1 },
              "amenities": [
                { "description": "FIRST PREPAID BAG", "isChargeable": true, "amenityType": "BAGGAGE" },
                { "description": "PREPAID BAG", "isChargeable": true, "amenityType": "BAGGAGE" },
                { "description": "PRE RESERVED SEAT ASSIGNMENT", "isChargeable": true, "amenityType": "PRE_RESERVED_SEAT" },
                { "description": "PRIORITY BOARDING", "isChargeable": true, "amenityType": "TRAVEL_SERVICES" },
                { "description": "CHANGEABLE TICKET", "isChargeable": true, "amenityType": "BRANDED_FARES" },
                { "description": "WIFI", "isChargeable": true, "amenityType": "ENTERTAINMENT" }
              ]
            }
          ]
        }
      ]
    },

    {
      "id": "5",
      "itineraries": [
        {
          "duration": "PT6H40M",
          "segments": [
            {
              "departure": { "iataCode": "MAD", "terminal": "2", "at": "2026-04-15T11:35:00" },
              "arrival": { "iataCode": "FCO", "terminal": "1", "at": "2026-04-15T14:05:00" },
              "carrierCode": "AZ",
              "number": "61",
              "aircraft": { "code": "32N" },
              "duration": "PT2H30M",
              "id": "3",
              "numberOfStops": 0
            },
            {
              "departure": { "iataCode": "FCO", "terminal": "1", "at": "2026-04-15T16:40:00" },
              "arrival": { "iataCode": "MUC", "terminal": "2", "at": "2026-04-15T18:15:00" },
              "carrierCode": "AZ",
              "number": "436",
              "aircraft": { "code": "223" },
              "duration": "PT1H35M",
              "id": "4",
              "numberOfStops": 0
            }
          ]
        }
      ],
      "price": { "currency": "EUR", "total": "207.86", "base": "56.00", "grandTotal": "207.86" },
      "validatingAirlineCodes": ["AZ"]
    }
  ],

  "dictionaries": {
    "locations": {
      "MAD": { "cityCode": "MAD", "countryCode": "ES" },
      "FCO": { "cityCode": "ROM", "countryCode": "IT" },
      "MUC": { "cityCode": "MUC", "countryCode": "DE" }
    },
    "aircraft": {
      "7M8": "BOEING 737 MAX 8",
      "223": "AIRBUS  A220-300",
      "32N": "AIRBUS A320NEO"
    },
    "currencies": {
      "EUR": "EURO"
    },
    "carriers": {
      "UX": "AIR EUROPA",
      "AZ": "ITA AIRWAYS"
    }
  }
}
```

### Key Data Points & Where They Live

| What you need | Where to find it |
|---------------|-----------------|
| **Total price** | `data[].price.grandTotal` (string → parse to float) |
| **Currency** | `data[].price.currency` |
| **Base fare** | `data[].price.base` |
| **Bag fees** | `data[].price.additionalServices[].amount` (type: CHECKED_BAGS) |
| **Airline code** | `data[].validatingAirlineCodes[0]` |
| **Airline name** | `dictionaries.carriers["UX"]` → "AIR EUROPA" |
| **Aircraft name** | `dictionaries.aircraft["7M8"]` → "BOEING 737 MAX 8" |
| **Number of stops** | Count `itineraries[].segments` — if segments.length > 1, it has stops |
| **Total duration** | `itineraries[].duration` → "PT2H35M" (ISO 8601) |
| **Segment duration** | `itineraries[].segments[].duration` |
| **Departure time** | `itineraries[0].segments[0].departure.at` |
| **Arrival time** | `itineraries[0].segments[last].arrival.at` |
| **Terminal** | `segments[].departure.terminal` / `segments[].arrival.terminal` |
| **Layover airport** | Middle segments' arrival.iataCode (e.g., FCO for Rome layover) |
| **Layover duration** | Next segment departure.at minus current segment arrival.at |
| **Cabin class** | `travelerPricings[].fareDetailsBySegment[].cabin` → "ECONOMY" |
| **Branded fare** | `fareDetailsBySegment[].brandedFareLabel` → "LITE" |
| **Checked bags included** | `fareDetailsBySegment[].includedCheckedBags.quantity` |
| **Cabin bags included** | `fareDetailsBySegment[].includedCabinBags.quantity` |
| **Amenities** | `fareDetailsBySegment[].amenities[]` — chargeable/free services |
| **Connecting city name** | `dictionaries.locations["FCO"].cityCode` → "ROM" |

---

## Data Normalization

### Parse ISO 8601 Duration

Amadeus returns durations like `"PT2H35M"`, `"PT6H40M"`, `"PT1H35M"`. Parse them to minutes:

```typescript
// src/lib/formatters.ts

export function parseDuration(iso: string): number {
  // "PT2H35M" → 155 minutes
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] || '0') * 60) + parseInt(match[2] || '0');
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function formatTime(isoDateTime: string): string {
  // "2026-04-15T15:00:00" → "3:00 PM"
  const date = new Date(isoDateTime);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatPrice(amount: string | number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
}
```

### Normalize Flight Offers into App Types

```typescript
// src/lib/normalizers.ts

import { parseDuration } from './formatters';

export interface Flight {
  id: string;
  price: number;
  currency: string;
  basePrice: number;
  airlineCode: string;
  airlineName: string;
  aircraftNames: string[];
  stops: number;             // 0 = nonstop, 1 = 1 stop, etc.
  duration: number;          // total minutes (outbound)
  departureTime: string;     // ISO datetime
  arrivalTime: string;       // ISO datetime
  origin: string;            // IATA code
  destination: string;       // IATA code
  departureTerminal?: string;
  arrivalTerminal?: string;
  cabin: string;             // "ECONOMY", "BUSINESS", etc.
  brandedFare?: string;      // "LITE", "LIGHT", etc.
  checkedBags: number;
  cabinBags: number;
  bagFee: number | null;     // cost to add checked bag
  amenities: string[];       // free amenities
  layovers: Layover[];
  returnFlight?: ReturnInfo; // for round trips
  raw: any;                  // keep original for details view
}

export interface Layover {
  airport: string;           // IATA code
  duration: number;          // minutes
}

export interface ReturnInfo {
  stops: number;
  duration: number;
  departureTime: string;
  arrivalTime: string;
  segments: any[];
}

export function normalizeFlightOffers(response: any): {
  flights: Flight[];
  carriers: Record<string, string>;
  aircraft: Record<string, string>;
} {
  const { data, dictionaries } = response;
  const carriers = dictionaries?.carriers || {};
  const aircraftDict = dictionaries?.aircraft || {};

  const flights: Flight[] = data.map((offer: any) => {
    const outbound = offer.itineraries[0];
    const returnItinerary = offer.itineraries[1] || null;
    const segments = outbound.segments;
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    // Calculate layovers
    const layovers: Layover[] = [];
    for (let i = 0; i < segments.length - 1; i++) {
      const arrivalTime = new Date(segments[i].arrival.at).getTime();
      const nextDepartureTime = new Date(segments[i + 1].departure.at).getTime();
      layovers.push({
        airport: segments[i].arrival.iataCode,
        duration: Math.round((nextDepartureTime - arrivalTime) / 60000),
      });
    }

    // Get fare details from first traveler, first segment
    const fareDetails = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
    const amenities = (fareDetails?.amenities || [])
      .filter((a: any) => !a.isChargeable)
      .map((a: any) => a.description);

    // Aircraft names for all segments
    const aircraftNames = segments
      .map((s: any) => aircraftDict[s.aircraft?.code] || s.aircraft?.code)
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i); // unique

    // Bag fee from additionalServices
    const bagFee = offer.price.additionalServices?.find(
      (s: any) => s.type === 'CHECKED_BAGS'
    )?.amount;

    return {
      id: offer.id,
      price: parseFloat(offer.price.grandTotal),
      currency: offer.price.currency,
      basePrice: parseFloat(offer.price.base),
      airlineCode: offer.validatingAirlineCodes[0],
      airlineName: carriers[offer.validatingAirlineCodes[0]] || offer.validatingAirlineCodes[0],
      aircraftNames,
      stops: segments.length - 1,
      duration: parseDuration(outbound.duration),
      departureTime: firstSegment.departure.at,
      arrivalTime: lastSegment.arrival.at,
      origin: firstSegment.departure.iataCode,
      destination: lastSegment.arrival.iataCode,
      departureTerminal: firstSegment.departure.terminal,
      arrivalTerminal: lastSegment.arrival.terminal,
      cabin: fareDetails?.cabin || 'ECONOMY',
      brandedFare: fareDetails?.brandedFareLabel,
      checkedBags: fareDetails?.includedCheckedBags?.quantity || 0,
      cabinBags: fareDetails?.includedCabinBags?.quantity || 0,
      bagFee: bagFee ? parseFloat(bagFee) : null,
      amenities,
      layovers,
      returnFlight: returnItinerary
        ? {
            stops: returnItinerary.segments.length - 1,
            duration: parseDuration(returnItinerary.duration),
            departureTime: returnItinerary.segments[0].departure.at,
            arrivalTime: returnItinerary.segments[returnItinerary.segments.length - 1].arrival.at,
            segments: returnItinerary.segments,
          }
        : undefined,
      raw: offer,
    };
  });

  return { flights, carriers, aircraft: aircraftDict };
}
```

---

## Next.js Route Handler: Flight Search

```typescript
// src/app/api/flights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { amadeus } from '@/lib/amadeus';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

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

    const travelClass = params.get('travelClass');
    if (travelClass) queryParams.travelClass = travelClass;

    const nonStop = params.get('nonStop');
    if (nonStop) queryParams.nonStop = nonStop;

    const children = params.get('children');
    if (children && children !== '0') queryParams.children = children;

    const infants = params.get('infants');
    if (infants && infants !== '0') queryParams.infants = infants;

    const response = await amadeus.get('/v2/shopping/flight-offers', queryParams);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Flight search error:', error.message);
    return NextResponse.json(
      { error: error.message, data: [], dictionaries: {} },
      { status: 500 }
    );
  }
}
```

---

## Building the Price Calendar (from Flight Offers Search)

Since the dedicated cheapest-date APIs don't work in test mode, we build the calendar by making parallel requests for surrounding dates.

```typescript
// src/app/api/price-calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { amadeus } from '@/lib/amadeus';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const origin = params.get('origin');
  const destination = params.get('destination');
  const centerDate = params.get('date'); // The selected departure date
  const adults = params.get('adults') || '1';
  const currency = params.get('currency') || 'EUR';

  if (!origin || !destination || !centerDate) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  // Generate dates: ±15 days around the center date
  const center = new Date(centerDate);
  const dates: string[] = [];
  for (let i = -15; i <= 15; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    // Skip past dates
    if (d >= new Date(new Date().toDateString())) {
      dates.push(d.toISOString().split('T')[0]);
    }
  }

  // Parallel requests — get cheapest price for each date
  // Use max=1 to minimize response size (we only need the cheapest)
  const results = await Promise.allSettled(
    dates.map(async (date) => {
      try {
        const res = await amadeus.get('/v2/shopping/flight-offers', {
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: date,
          adults,
          currencyCode: currency,
          max: '1',  // Only need cheapest
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

  const calendar = results.map((r) =>
    r.status === 'fulfilled' ? r.value : { date: '', price: null, currency }
  ).filter(r => r.date);

  return NextResponse.json({ data: calendar });
}
```

> ⚠️ **Rate limiting:** This makes ~30 API calls at once. Amadeus test env allows ~10 req/sec. Consider:
> - Batching in groups of 5-8 with small delays between batches
> - Caching results aggressively (prices don't change every second)
> - Loading progressively (show each price as it arrives)

---

## Building the Price Graph (from Flight Results)

The price graph is derived **entirely client-side** from the already-fetched flight results. No extra API calls needed.

```typescript
// src/hooks/usePriceGraphData.ts

import { useMemo } from 'react';
import { Flight } from '@/lib/normalizers';

interface PriceGraphPoint {
  label: string;
  minPrice: number;
  avgPrice: number;
  count: number;
}

export function usePriceGraphData(
  flights: Flight[],
  groupBy: 'airline' | 'stops' | 'timeOfDay'
) {
  return useMemo(() => {
    if (!flights.length) return [];

    switch (groupBy) {
      case 'airline':
        return groupByKey(flights, (f) => f.airlineName);

      case 'stops':
        return groupByKey(flights, (f) =>
          f.stops === 0 ? 'Non-stop' : f.stops === 1 ? '1 Stop' : `${f.stops} Stops`
        );

      case 'timeOfDay':
        return groupByKey(flights, (f) => {
          const hour = new Date(f.departureTime).getHours();
          if (hour < 6) return 'Red-eye (12-6AM)';
          if (hour < 12) return 'Morning (6AM-12PM)';
          if (hour < 18) return 'Afternoon (12-6PM)';
          return 'Evening (6PM-12AM)';
        });

      default:
        return [];
    }
  }, [flights, groupBy]);
}

function groupByKey(flights: Flight[], keyFn: (f: Flight) => string): PriceGraphPoint[] {
  const groups: Record<string, number[]> = {};

  flights.forEach((f) => {
    const key = keyFn(f);
    if (!groups[key]) groups[key] = [];
    groups[key].push(f.price);
  });

  return Object.entries(groups)
    .map(([label, prices]) => ({
      label,
      minPrice: Math.min(...prices),
      avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      count: prices.length,
    }))
    .sort((a, b) => a.minPrice - b.minPrice);
}
```

This data feeds directly into Recharts — and because it's a `useMemo` derived from `filteredFlights`, it **re-renders instantly when any filter changes**.

---

## Test Environment Limitations

| Limitation | Impact | Workaround |
|-----------|--------|------------|
| **No American, Delta, British Airways** | Limited US carrier results | Test with European routes (MAD, MUC, CDG, FCO, BCN) |
| **No low-cost carriers** | No Ryanair, EasyJet, etc. | Use available carriers (Air Europa, ITA Airways, Lufthansa, etc.) |
| **Only published fares** | No negotiated/corporate rates | Fine for a search engine demo |
| **Cached APIs return 500** | No inspiration/cheapest date endpoints | Build from Flight Offers Search (better anyway) |
| **Price Metrics decommissioned** | No historical price analysis | Derive from live results |
| **Inventory can deplete** | Heavy testing may exhaust seats | Use different dates/routes if you get empty results |
| **Prices are test data** | Not real prices | Fine for demo purposes |

### Recommended Test Routes

| Route | Why |
|-------|-----|
| MAD → MUC | ✅ Tested, returns UX + AZ, direct + connections |
| MAD → CDG | Good variety, Iberia + Air France |
| LON → PAR | Classic European route |
| FCO → BCN | ITA Airways results |
| CDG → FCO | Air France + ITA |

### Error Codes Reference

| HTTP | Code | Title | Meaning |
|------|------|-------|---------|
| 400 | 477 | INVALID FORMAT | Bad parameter format (e.g., wrong date format) |
| 400 | 425 | INVALID DATE | Date is in the past |
| 404 | 1797 | NOT FOUND | Airport code not found |
| 500 | 141 | SYSTEM ERROR | Server-side issue (common on cached endpoints) |
| 410 | 41254 | GONE | API endpoint decommissioned |

---

## Rate Limiting & Caching Strategy

### Amadeus Test Environment Limits
- ~10 requests per second
- Token valid for ~30 minutes

### Recommended Caching

```typescript
// Simple in-memory cache for the server side
const cache = new Map<string, { data: any; expiry: number }>();

function getCached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return Promise.resolve(cached.data);
  }

  return fetcher().then((data) => {
    cache.set(key, { data, expiry: Date.now() + ttlMs });
    return data;
  });
}
```

| Endpoint | Cache TTL | Reason |
|----------|-----------|--------|
| Airport Autocomplete | 24 hours | Airports don't change |
| Flight Offers Search | 0 (no cache) | Real-time pricing |
| Price Calendar | 15 minutes | Prices update, but not every second |
