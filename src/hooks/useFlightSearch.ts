// FlyOn — useFlightSearch Hook v1.9.1 | 2026-02-06

'use client';

import { useEffect, useRef } from 'react';
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

  // Stable key from params to avoid re-fetching on every render
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    if (!params.origin || !params.destination || !params.departureDate) return;
    if (paramsKey === lastParamsRef.current) return;
    lastParamsRef.current = paramsKey;

    // Abort any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: 'SET_LOADING', payload: true });

    const urlParams = new URLSearchParams();
    urlParams.set('origin', params.origin);
    urlParams.set('destination', params.destination);
    urlParams.set('departureDate', params.departureDate);
    if (params.returnDate) urlParams.set('returnDate', params.returnDate);
    if (params.adults) urlParams.set('adults', params.adults);
    if (params.children && params.children !== '0') urlParams.set('children', params.children);
    if (params.infants && params.infants !== '0') urlParams.set('infants', params.infants);
    if (params.cabinClass) urlParams.set('travelClass', params.cabinClass);

    fetch(`/api/flights?${urlParams.toString()}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to search flights');
        }
        return res.json();
      })
      .then((data: AmadeusFlightResponse) => {
        const { flights, carriers } = normalizeFlightOffers(data);
        dispatch({ type: 'SET_FLIGHTS', payload: { flights, carriers } });
      })
      .catch((error) => {
        if (error instanceof Error && error.name !== 'AbortError') {
          dispatch({ type: 'SET_ERROR', payload: error.message });
        }
      });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);
}
