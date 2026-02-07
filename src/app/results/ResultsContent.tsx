// FlyOn — ResultsContent v1.9.3 | 2026-02-07

'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import SearchForm from '@/components/SearchForm/SearchForm';
import FlightList from '@/components/Results/FlightList';
import FilterPanel from '@/components/Filters/FilterPanel';
import PriceGraph from '@/components/PriceGraph/PriceGraph';
import PriceCalendar from '@/components/PriceCalendar/PriceCalendar';
import SkeletonCard from '@/components/Skeleton/SkeletonCard';
import SkeletonGraph from '@/components/Skeleton/SkeletonGraph';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useFlightSearch } from '@/hooks/useFlightSearch';
import { useSearch } from '@/context/SearchContext';
import { useURLState } from '@/hooks/useURLState';
import { SORT_OPTIONS, CABIN_CLASS_LABELS } from '@/lib/constants';
import type { Airport, CabinClass, FilterState, SearchParams, SortOption } from '@/lib/types';
import styles from './results.module.css';

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const { state, dispatch, filteredFlights } = useSearch();
  const { updateURLParams } = useURLState();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

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

  const activeFilterCount = useMemo(() => {
    const f = state.filters;
    let count = 0;
    if (f.stops.length > 0) count++;
    if (f.airlines.length > 0) count++;
    if (f.departureTimeRange[0] > 0 || f.departureTimeRange[1] < 24) count++;
    if (f.arrivalTimeRange[0] > 0 || f.arrivalTimeRange[1] < 24) count++;
    return count;
  }, [state.filters]);

  const handleFilterChange = useCallback(
    (updates: Partial<FilterState>) => dispatch({ type: 'SET_FILTER', payload: updates }),
    [dispatch]
  );

  const handleClearFilters = useCallback(
    () => dispatch({ type: 'CLEAR_FILTERS' }),
    [dispatch]
  );

  const handleCalendarDateSelect = useCallback(
    (date: string) => {
      updateURLParams({ departureDate: date });
    },
    [updateURLParams]
  );

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const summaryText = useMemo(() => {
    const parts: string[] = [];
    if (origin && destination) {
      parts.push(`${origin} → ${destination}`);
    }
    if (departureDate) {
      const formatDate = (dateStr: string) => {
        const [, m, d] = dateStr.split('-');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
      };
      if (returnDate) {
        parts.push(`${formatDate(departureDate)} - ${formatDate(returnDate)}`);
      } else {
        parts.push(formatDate(departureDate));
      }
    }
    const totalPax = parseInt(adults, 10) + parseInt(children, 10) + parseInt(infants, 10);
    parts.push(`${totalPax} traveler${totalPax !== 1 ? 's' : ''}`);
    parts.push(CABIN_CLASS_LABELS[cabinClass as CabinClass] || 'Economy');
    return parts.join('  |  ');
  }, [origin, destination, departureDate, returnDate, adults, children, infants, cabinClass]);

  const filterPanelElement = !state.loading && state.flights.length > 0 && (
    <FilterPanel
      flights={state.flights}
      carriers={state.carriers}
      filters={state.filters}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
    />
  );

  return (
    <div className={styles.content}>
      <div className={`${styles.searchBar} ${isScrolled ? styles.searchBarScrolled : ''}`}>
        <div className={styles.searchBarHeader}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src="/flyon_logo.svg"
              alt="flyon"
              width={120}
              height={40}
              className={styles.logoImg}
              priority
            />
          </Link>
        </div>
        <div className={styles.searchFormWrapper}>
          <SearchForm initialParams={initialParams} compact />
        </div>
        <button
          className={styles.summaryBar}
          onClick={handleScrollToTop}
          aria-label="Scroll to top to edit search"
        >
          <span className={styles.summaryText}>{summaryText}</span>
          <svg className={styles.summaryEditIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>

      <div className={styles.resultsLayout}>
        {/* Desktop sidebar */}
        <div className={styles.sidebar}>
          {filterPanelElement}
        </div>

        <div className={styles.mainContent}>
          <div className={styles.toolbar}>
            {/* Mobile filter button */}
            <button
              className={styles.mobileFilterBtn}
              onClick={() => setFilterDrawerOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="8" y1="18" x2="16" y2="18" />
              </svg>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>

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
              {origin && destination && (
                <div className={styles.calendarSection}>
                  <button
                    className={styles.calendarToggle}
                    onClick={() => setShowCalendar((prev) => !prev)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {showCalendar ? 'Hide' : 'Show'} price calendar
                  </button>
                  {showCalendar && (
                    <PriceCalendar
                      origin={origin}
                      destination={destination}
                      selectedDate={departureDate || ''}
                      onDateSelect={handleCalendarDateSelect}
                    />
                  )}
                </div>
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

      {/* Mobile filter drawer */}
      <Modal
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        title="Filters"
        variant="drawer"
        footer={
          <div className={styles.drawerFooter}>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear all
            </Button>
            <Button variant="primary" size="md" onClick={() => setFilterDrawerOpen(false)}>
              Show {filteredFlights.length} results
            </Button>
          </div>
        }
      >
        {filterPanelElement}
      </Modal>
    </div>
  );
}
