// FlyOn — ResultsContent v1.5.0 | 2026-02-06

'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchForm from '@/components/SearchForm/SearchForm';
import FlightList from '@/components/Results/FlightList';
import FilterPanel from '@/components/Filters/FilterPanel';
import PriceGraph from '@/components/PriceGraph/PriceGraph';
import SkeletonCard from '@/components/Skeleton/SkeletonCard';
import SkeletonGraph from '@/components/Skeleton/SkeletonGraph';
import { useFlightSearch } from '@/hooks/useFlightSearch';
import { useSearch } from '@/context/SearchContext';
import { SORT_OPTIONS } from '@/lib/constants';
import type { Airport, CabinClass, FilterState, SearchParams, SortOption } from '@/lib/types';
import styles from './results.module.css';

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const { state, dispatch, filteredFlights } = useSearch();

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');
  const adults = searchParams.get('adults') || '1';
  const children = searchParams.get('children') || '0';
  const infants = searchParams.get('infants') || '0';
  const cabinClass = searchParams.get('cabinClass') || 'ECONOMY';

  useFlightSearch({
    origin: origin || undefined,
    destination: destination || undefined,
    departureDate: departureDate || undefined,
    returnDate: returnDate || undefined,
    adults,
    children,
    infants,
    cabinClass,
  });

  const initialParams = useMemo((): Partial<SearchParams> => {
    const params: Partial<SearchParams> = {};
    if (origin) {
      params.origin = {
        iataCode: origin,
        name: searchParams.get('originName') || origin,
        cityName: searchParams.get('originCity') || '',
        countryCode: searchParams.get('originCountry') || '',
      } as Airport;
    }
    if (destination) {
      params.destination = {
        iataCode: destination,
        name: searchParams.get('destName') || destination,
        cityName: searchParams.get('destCity') || '',
        countryCode: searchParams.get('destCountry') || '',
      } as Airport;
    }
    if (departureDate) params.departureDate = departureDate;
    if (returnDate) params.returnDate = returnDate;
    params.adults = parseInt(adults, 10);
    params.children = parseInt(children, 10);
    params.infants = parseInt(infants, 10);
    params.cabinClass = cabinClass as CabinClass;
    params.tripType = returnDate ? 'roundTrip' : 'oneWay';
    return params;
  }, [origin, destination, departureDate, returnDate, adults, children, infants, cabinClass, searchParams]);

  return (
    <div className={styles.content}>
      <div className={styles.searchBar}>
        <SearchForm initialParams={initialParams} compact />
      </div>

      <div className={styles.resultsLayout}>
        <div className={styles.sidebar}>
          {!state.loading && state.flights.length > 0 && (
            <FilterPanel
              flights={state.flights}
              carriers={state.carriers}
              filters={state.filters}
              onFilterChange={(updates: Partial<FilterState>) => dispatch({ type: 'SET_FILTER', payload: updates })}
              onClearFilters={() => dispatch({ type: 'CLEAR_FILTERS' })}
            />
          )}
        </div>

        <div className={styles.mainContent}>
          <div className={styles.toolbar}>
            <div className={styles.sortContainer}>
              <label className={styles.sortLabel}>Sort by:</label>
              <select
                className={styles.sortSelect}
                value={state.filters.sortBy}
                onChange={(e) => dispatch({ type: 'SET_SORT', payload: e.target.value as SortOption })}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {state.loading ? (
            <div className={styles.skeletonList}>
              <SkeletonGraph />
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : state.error ? (
            <div className={styles.errorState}>
              <p className={styles.errorText}>{state.error}</p>
              <button
                className={styles.retryBtn}
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {filteredFlights.length > 0 && (
                <PriceGraph
                  flights={filteredFlights}
                  carriers={state.carriers}
                />
              )}
              <FlightList
                flights={filteredFlights}
                totalCount={state.flights.length}
                carriers={state.carriers}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
