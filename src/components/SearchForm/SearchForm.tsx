// FlyOn — SearchForm Component v1.3.0 | 2026-02-06

'use client';

import { useState, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import AirportInput from './AirportInput';
import DatePicker from './DatePicker';
import PassengerSelector from './PassengerSelector';
import { useURLState } from '@/hooks/useURLState';
import type { Airport, CabinClass, SearchParams } from '@/lib/types';
import styles from './SearchForm.module.css';

interface SearchFormProps {
  initialParams?: Partial<SearchParams>;
  compact?: boolean;
}

export default function SearchForm({ initialParams, compact = false }: SearchFormProps) {
  const { navigateToResults } = useURLState();

  const [origin, setOrigin] = useState<Airport | null>(initialParams?.origin || null);
  const [destination, setDestination] = useState<Airport | null>(initialParams?.destination || null);
  const [departureDate, setDepartureDate] = useState(
    initialParams?.departureDate || format(addDays(new Date(), 7), 'yyyy-MM-dd')
  );
  const [returnDate, setReturnDate] = useState(
    initialParams?.returnDate || format(addDays(new Date(), 14), 'yyyy-MM-dd')
  );
  const [tripType, setTripType] = useState<'roundTrip' | 'oneWay'>(
    initialParams?.tripType || 'roundTrip'
  );
  const [adults, setAdults] = useState(initialParams?.adults || 1);
  const [children, setChildren] = useState(initialParams?.children || 0);
  const [infants, setInfants] = useState(initialParams?.infants || 0);
  const [cabinClass, setCabinClass] = useState<CabinClass>(
    initialParams?.cabinClass || 'ECONOMY'
  );

  const handleSwap = useCallback(() => {
    setOrigin(destination);
    setDestination(origin);
  }, [origin, destination]);

  const handleSearch = useCallback(() => {
    if (!origin || !destination || !departureDate) return;

    const params: SearchParams = {
      origin,
      destination,
      departureDate,
      returnDate: tripType === 'roundTrip' ? returnDate : undefined,
      adults,
      children,
      infants,
      cabinClass,
      tripType,
    };

    navigateToResults(params);
  }, [origin, destination, departureDate, returnDate, tripType, adults, children, infants, cabinClass, navigateToResults]);

  const isValid = origin && destination && departureDate;

  return (
    <form
      className={`${styles.form} ${compact ? styles.compact : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <div className={styles.row}>
        <div className={styles.airportGroup}>
          <AirportInput
            label="From"
            placeholder="City or airport"
            value={origin}
            onChange={setOrigin}
          />
          <button type="button" className={styles.swapBtn} onClick={handleSwap} aria-label="Swap origin and destination">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M7 16l-4-4 4-4" />
              <path d="M17 8l4 4-4 4" />
              <path d="M3 12h18" />
            </svg>
          </button>
          <AirportInput
            label="To"
            placeholder="City or airport"
            value={destination}
            onChange={setDestination}
          />
        </div>
      </div>

      <div className={styles.row}>
        <DatePicker
          departureDate={departureDate}
          returnDate={returnDate}
          tripType={tripType}
          onDepartureDateChange={setDepartureDate}
          onReturnDateChange={setReturnDate}
          onTripTypeChange={setTripType}
        />
        <PassengerSelector
          adults={adults}
          children={children}
          infants={infants}
          cabinClass={cabinClass}
          onAdultsChange={setAdults}
          onChildrenChange={setChildren}
          onInfantsChange={setInfants}
          onCabinClassChange={setCabinClass}
        />
      </div>

      <button type="submit" className={styles.searchBtn} disabled={!isValid}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Search flights
      </button>
    </form>
  );
}
