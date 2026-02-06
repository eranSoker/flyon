// FlyOn — TypeScript Types v1.9.0 | 2026-02-06

// ----- Amadeus API Response Types -----

export interface AmadeusFlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: OfferPrice;
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

export interface Itinerary {
  duration: string; // ISO 8601: "PT6H15M"
  segments: Segment[];
}

export interface Segment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string; // ISO datetime
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: { code: string };
  operating?: { carrierCode: string };
  duration: string; // ISO 8601: "PT2H30M"
  id: string;
  numberOfStops: number;
  blacklistedInEU?: boolean;
}

export interface OfferPrice {
  currency: string;
  total: string;
  base: string;
  fees?: { amount: string; type: string }[];
  grandTotal: string;
  additionalServices?: { amount: string; type: string }[];
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: {
    currency: string;
    total: string;
    base: string;
  };
  fareDetailsBySegment: FareDetail[];
}

export interface FareDetail {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  brandedFare?: string;
  brandedFareLabel?: string;
  class: string;
  includedCheckedBags?: {
    weight?: number;
    weightUnit?: string;
    quantity?: number;
  };
  includedCabinBags?: {
    weight?: number;
    weightUnit?: string;
    quantity?: number;
  };
  amenities?: Amenity[];
}

export interface Amenity {
  description: string;
  isChargeable: boolean;
  amenityType: string;
}

export interface AmadeusFlightResponse {
  meta: { count: number };
  data: AmadeusFlightOffer[];
  dictionaries?: {
    carriers: Record<string, string>;
    aircraft: Record<string, string>;
    currencies: Record<string, string>;
    locations: Record<string, { cityCode: string; countryCode: string }>;
  };
}

export interface AmadeusLocationResponse {
  data: AmadeusLocation[];
}

export interface AmadeusLocation {
  type: string;
  subType: string;
  name: string;
  detailedName: string;
  id: string;
  iataCode: string;
  address: {
    cityName: string;
    cityCode: string;
    countryName: string;
    countryCode: string;
    regionCode?: string;
  };
  analytics?: {
    travelers: {
      score: number;
    };
  };
}

// ----- App-Level Types -----

export interface Airport {
  iataCode: string;
  name: string;
  cityName: string;
  countryCode: string;
  countryName?: string;
  subType?: 'AIRPORT' | 'CITY';
  detailedName?: string;
  score?: number;
}

export interface Layover {
  airport: string;  // IATA code
  duration: number; // minutes
}

export interface ReturnInfo {
  stops: number;
  duration: number;       // minutes
  departureTime: string;  // ISO datetime
  arrivalTime: string;    // ISO datetime
  segments: Segment[];
}

export interface Flight {
  id: string;
  price: number;
  currency: string;
  basePrice: number;
  airlineCode: string;     // carrier code e.g. "UX"
  airlineName: string;     // display name e.g. "AIR EUROPA"
  aircraftNames: string[];
  stops: number;           // 0 = nonstop, 1 = 1 stop, etc.
  duration: number;        // total minutes (outbound)
  departureTime: string;   // ISO datetime
  arrivalTime: string;     // ISO datetime
  origin: string;          // IATA code
  destination: string;     // IATA code
  departureTerminal?: string;
  arrivalTerminal?: string;
  cabin: string;           // "ECONOMY", "BUSINESS", etc.
  brandedFare?: string;    // "LITE", "LIGHT", etc.
  checkedBags: number;
  cabinBags: number;
  bagFee: number | null;   // cost to add checked bag
  amenities: string[];     // free amenities
  layovers: Layover[];
  returnFlight?: ReturnInfo;
  itineraries: Itinerary[]; // full itineraries for details view
  raw: AmadeusFlightOffer;
}

export interface SearchParams {
  origin: Airport | null;
  destination: Airport | null;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  tripType: 'roundTrip' | 'oneWay';
}

export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export interface FilterState {
  stops: number[];
  priceRange: [number, number];
  airlines: string[];
  departureTimeRange: [number, number]; // hours 0-24
  arrivalTimeRange: [number, number];
  maxDuration: number; // minutes
  sortBy: SortOption;
}

export type SortOption = 'best' | 'price' | 'duration' | 'departure';

export interface PriceCalendarDay {
  date: string; // YYYY-MM-DD
  minPrice: number | null;
  loading: boolean;
}

export interface PriceDataPoint {
  label: string;
  minPrice: number;
  avgPrice: number;
  count: number;
}

// ----- Context Types -----

export type SearchAction =
  | { type: 'SET_FLIGHTS'; payload: { flights: Flight[]; carriers: Record<string, string> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTER'; payload: Partial<FilterState> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SORT'; payload: SortOption }
  | { type: 'SET_SEARCH_PARAMS'; payload: Partial<SearchParams> };

export interface SearchState {
  flights: Flight[];
  carriers: Record<string, string>;
  filters: FilterState;
  searchParams: SearchParams;
  loading: boolean;
  error: string | null;
}
