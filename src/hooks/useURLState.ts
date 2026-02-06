// FlyOn — useURLState Hook v1.3.0 | 2026-02-06

'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import type { Airport, CabinClass, SearchParams } from '@/lib/types';

export function useURLState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getSearchParamsFromURL = useCallback((): Partial<SearchParams> => {
    const origin = searchParams.get('origin');
    const originName = searchParams.get('originName');
    const originCity = searchParams.get('originCity');
    const originCountry = searchParams.get('originCountry');
    const destination = searchParams.get('destination');
    const destName = searchParams.get('destName');
    const destCity = searchParams.get('destCity');
    const destCountry = searchParams.get('destCountry');
    const departureDate = searchParams.get('departureDate');
    const returnDate = searchParams.get('returnDate');
    const adults = searchParams.get('adults');
    const children = searchParams.get('children');
    const infants = searchParams.get('infants');
    const cabinClass = searchParams.get('cabinClass');
    const tripType = searchParams.get('tripType');

    const params: Partial<SearchParams> = {};

    if (origin) {
      params.origin = {
        iataCode: origin,
        name: originName || origin,
        cityName: originCity || '',
        countryCode: originCountry || '',
      };
    }

    if (destination) {
      params.destination = {
        iataCode: destination,
        name: destName || destination,
        cityName: destCity || '',
        countryCode: destCountry || '',
      };
    }

    if (departureDate) params.departureDate = departureDate;
    if (returnDate) params.returnDate = returnDate;
    if (adults) params.adults = parseInt(adults, 10);
    if (children) params.children = parseInt(children, 10);
    if (infants) params.infants = parseInt(infants, 10);
    if (cabinClass) params.cabinClass = cabinClass as CabinClass;
    if (tripType) params.tripType = tripType as 'roundTrip' | 'oneWay';

    return params;
  }, [searchParams]);

  const navigateToResults = useCallback(
    (params: SearchParams) => {
      const urlParams = new URLSearchParams();

      if (params.origin) {
        urlParams.set('origin', params.origin.iataCode);
        urlParams.set('originName', params.origin.name);
        urlParams.set('originCity', params.origin.cityName);
        urlParams.set('originCountry', params.origin.countryCode);
      }
      if (params.destination) {
        urlParams.set('destination', params.destination.iataCode);
        urlParams.set('destName', params.destination.name);
        urlParams.set('destCity', params.destination.cityName);
        urlParams.set('destCountry', params.destination.countryCode);
      }
      urlParams.set('departureDate', params.departureDate);
      if (params.returnDate) urlParams.set('returnDate', params.returnDate);
      urlParams.set('adults', params.adults.toString());
      if (params.children > 0) urlParams.set('children', params.children.toString());
      if (params.infants > 0) urlParams.set('infants', params.infants.toString());
      urlParams.set('cabinClass', params.cabinClass);
      urlParams.set('tripType', params.tripType);

      router.push(`/results?${urlParams.toString()}`);
    },
    [router]
  );

  const updateURLParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  return { getSearchParamsFromURL, navigateToResults, updateURLParams };
}
