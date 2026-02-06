// FlyOn — FlightList Component v1.3.1 | 2026-02-06

'use client';

import type { Flight } from '@/lib/types';
import FlightCard from './FlightCard';
import styles from './FlightList.module.css';

interface FlightListProps {
  flights: Flight[];
  totalCount: number;
  carriers: Record<string, string>;
}

export default function FlightList({ flights, totalCount, carriers }: FlightListProps) {
  if (flights.length === 0) {
    return (
      <div className={styles.empty}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" aria-hidden="true">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
        <h3 className={styles.emptyTitle}>No flights found</h3>
        <p className={styles.emptyText}>
          Try adjusting your filters or search for different dates.
        </p>
      </div>
    );
  }

  const cheapestPrice = Math.min(...flights.map((f) => f.price));

  return (
    <div className={styles.list}>
      <p className={styles.count}>
        Showing <strong>{flights.length}</strong>
        {flights.length !== totalCount && ` of ${totalCount}`} flight{totalCount !== 1 ? 's' : ''}
      </p>
      <div className={styles.cards}>
        {flights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            carriers={carriers}
            isCheapest={flight.price === cheapestPrice && flights.length > 1}
          />
        ))}
      </div>
    </div>
  );
}
