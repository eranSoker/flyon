// FlyOn — useFlightSearch Hook v1.3.1 | 2026-02-06

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSearch } from '@/context/SearchContext';
import { parseDurationToMinutes } from '@/lib/formatters';
import { AIRLINE_NAMES } from '@/lib/constants';
import type { AmadeusFlightResponse, Flight } from '@/lib/types';

function normalizeFlights(
  response: AmadeusFlightResponse
): { flights: Flight[]; carriers: Record<string, string> } {
  const carriers = response.dictionaries?.carriers || {};

  const flights: Flight[] = (response.data || []).map((offer) => {
    const outbound = offer.itineraries[0];
    const firstSegment = outbound.segments[0];
    const lastSegment = outbound.segments[outbound.segments.length - 1];
    const totalStops = outbound.segments.length - 1;
    const mainCarrier = offer.validatingAirlineCodes[0] || firstSegment.carrierCode;

    return {
      id: offer.id,
      price: parseFloat(offer.price.grandTotal),
      currency: offer.price.currency,
      airline: mainCarrier,
      airlineName: carriers[mainCarrier] || AIRLINE_NAMES[mainCarrier] || mainCarrier,
      stops: totalStops,
      duration: parseDurationToMinutes(outbound.duration),
      departureTime: firstSegment.departure.at,
      arrivalTime: lastSegment.arrival.at,
      origin: firstSegment.departure.iataCode,
      destination: lastSegment.arrival.iataCode,
      itineraries: offer.itineraries,
      raw: offer,
    };
  });

  return { flights, carriers };
}

export function useFlightSearch(params: {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  adults?: string;
  children?: string;
  infants?: string;
  cabinClass?: string;
}) {
  const { dispatch } = useSearch();
  const abortRef = useRef<AbortController | null>(null);
  const lastParamsRef = useRef<string>('');

  const fetchFlights = useCallback(async () => {
    if (!params.origin || !params.destination || !params.departureDate) return;

    const paramsKey = JSON.stringify(params);
    if (paramsKey === lastParamsRef.current) return;
    lastParamsRef.current = paramsKey;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const urlParams = new URLSearchParams();
      urlParams.set('origin', params.origin);
      urlParams.set('destination', params.destination);
      urlParams.set('departureDate', params.departureDate);
      if (params.returnDate) urlParams.set('returnDate', params.returnDate);
      if (params.adults) urlParams.set('adults', params.adults);
      if (params.children && params.children !== '0') urlParams.set('children', params.children);
      if (params.infants && params.infants !== '0') urlParams.set('infants', params.infants);
      if (params.cabinClass) urlParams.set('cabinClass', params.cabinClass);

      const res = await fetch(`/api/flights?${urlParams.toString()}`, {
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to search flights');
      }

      const data: AmadeusFlightResponse = await res.json();
      const { flights, carriers } = normalizeFlights(data);

      dispatch({ type: 'SET_FLIGHTS', payload: { flights, carriers } });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
  }, [params, dispatch]);

  useEffect(() => {
    fetchFlights();

    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [fetchFlights]);
}
