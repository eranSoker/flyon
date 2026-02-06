// FlyOn — useFlightSearch Hook v1.9.0 | 2026-02-06

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSearch } from '@/context/SearchContext';
import { normalizeFlightOffers } from '@/lib/normalizers';
import type { AmadeusFlightResponse } from '@/lib/types';

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
      if (params.cabinClass) urlParams.set('travelClass', params.cabinClass);

      const res = await fetch(`/api/flights?${urlParams.toString()}`, {
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to search flights');
      }

      const data: AmadeusFlightResponse = await res.json();
      const { flights, carriers } = normalizeFlightOffers(data);

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
