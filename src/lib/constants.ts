// FlyOn — Constants v1.2.1 | 2026-02-06

import type { CabinClass } from './types';

export const AIRLINE_NAMES: Record<string, string> = {
  AA: 'American Airlines',
  DL: 'Delta Air Lines',
  UA: 'United Airlines',
  WN: 'Southwest Airlines',
  B6: 'JetBlue Airways',
  AS: 'Alaska Airlines',
  NK: 'Spirit Airlines',
  F9: 'Frontier Airlines',
  G4: 'Allegiant Air',
  HA: 'Hawaiian Airlines',
  SY: 'Sun Country Airlines',
  BA: 'British Airways',
  LH: 'Lufthansa',
  AF: 'Air France',
  KL: 'KLM',
  IB: 'Iberia',
  AY: 'Finnair',
  SK: 'SAS',
  LX: 'Swiss',
  OS: 'Austrian Airlines',
  TK: 'Turkish Airlines',
  EK: 'Emirates',
  QR: 'Qatar Airways',
  EY: 'Etihad Airways',
  SQ: 'Singapore Airlines',
  CX: 'Cathay Pacific',
  JL: 'Japan Airlines',
  NH: 'All Nippon Airways',
  QF: 'Qantas',
  AC: 'Air Canada',
  AM: 'Aeromexico',
  LA: 'LATAM Airlines',
  AV: 'Avianca',
  CM: 'Copa Airlines',
  TP: 'TAP Air Portugal',
  AZ: 'ITA Airways',
  VY: 'Vueling',
  U2: 'easyJet',
  FR: 'Ryanair',
  W6: 'Wizz Air',
};

export const CABIN_CLASS_LABELS: Record<CabinClass, string> = {
  ECONOMY: 'Economy',
  PREMIUM_ECONOMY: 'Premium Economy',
  BUSINESS: 'Business',
  FIRST: 'First',
};

export const CABIN_CLASSES: CabinClass[] = [
  'ECONOMY',
  'PREMIUM_ECONOMY',
  'BUSINESS',
  'FIRST',
];

export const DEFAULT_FILTER_STATE = {
  stops: [] as number[],
  priceRange: [0, 10000] as [number, number],
  airlines: [] as string[],
  departureTimeRange: [0, 24] as [number, number],
  arrivalTimeRange: [0, 24] as [number, number],
  maxDuration: 2880, // 48 hours
  sortBy: 'best' as const,
};

export const SORT_OPTIONS = [
  { value: 'best', label: 'Best' },
  { value: 'price', label: 'Price' },
  { value: 'duration', label: 'Duration' },
  { value: 'departure', label: 'Departure time' },
] as const;
