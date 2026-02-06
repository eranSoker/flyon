// FlyOn — FlightCard Component v1.9.0 | 2026-02-06

'use client';

import { useState, useCallback } from 'react';
import type { Flight } from '@/lib/types';
import { formatPrice, formatTime, formatMinutesToDuration, formatStops } from '@/lib/formatters';
import FlightDetails from './FlightDetails';
import styles from './FlightCard.module.css';

interface FlightCardProps {
  flight: Flight;
  carriers: Record<string, string>;
  isCheapest?: boolean;
}

export default function FlightCard({ flight, carriers, isCheapest = false }: FlightCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const hasReturn = flight.itineraries.length > 1;

  return (
    <article className={`${styles.card} ${isCheapest ? styles.cheapest : ''}`}>
      {isCheapest && <span className={styles.cheapestBadge}>Cheapest</span>}
      <div className={styles.main} onClick={handleToggle} role="button" tabIndex={0} aria-expanded={expanded}>
        <div className={styles.priceSection}>
          <span className={styles.price}>{formatPrice(flight.price, flight.currency)}</span>
          {hasReturn && <span className={styles.priceNote}>round trip</span>}
        </div>

        <div className={styles.flightSection}>
          {/* Outbound */}
          <div className={styles.leg}>
            <div className={styles.legTimes}>
              <span className={styles.time}>{formatTime(flight.departureTime)}</span>
              <div className={styles.route}>
                <span className={styles.routeLine} />
                <span className={styles.stopsLabel}>{formatStops(flight.stops)}</span>
              </div>
              <span className={styles.time}>{formatTime(flight.arrivalTime)}</span>
            </div>
            <div className={styles.legMeta}>
              <span className={styles.airports}>{flight.origin} — {flight.destination}</span>
              <span className={styles.duration}>{formatMinutesToDuration(flight.duration)}</span>
            </div>
          </div>

          {/* Return */}
          {hasReturn && (() => {
            const returnItinerary = flight.itineraries[1];
            const returnFirst = returnItinerary.segments[0];
            const returnLast = returnItinerary.segments[returnItinerary.segments.length - 1];
            const returnStops = returnItinerary.segments.length - 1;
            return (
              <div className={styles.leg}>
                <div className={styles.legTimes}>
                  <span className={styles.time}>{formatTime(returnFirst.departure.at)}</span>
                  <div className={styles.route}>
                    <span className={styles.routeLine} />
                    <span className={styles.stopsLabel}>{formatStops(returnStops)}</span>
                  </div>
                  <span className={styles.time}>{formatTime(returnLast.arrival.at)}</span>
                </div>
                <div className={styles.legMeta}>
                  <span className={styles.airports}>{returnFirst.departure.iataCode} — {returnLast.arrival.iataCode}</span>
                  <span className={styles.duration}>{formatMinutesToDuration(
                    Math.round((new Date(returnLast.arrival.at).getTime() - new Date(returnFirst.departure.at).getTime()) / 60000)
                  )}</span>
                </div>
              </div>
            );
          })()}
        </div>

        <div className={styles.airlineSection}>
          <span className={styles.airlineName}>{flight.airlineName}</span>
          <span className={styles.cabinInfo}>
            {flight.cabin.charAt(0) + flight.cabin.slice(1).toLowerCase().replace('_', ' ')}
            {flight.brandedFare ? ` · ${flight.brandedFare}` : ''}
          </span>
          <span className={styles.expandIcon}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <FlightDetails flight={flight} carriers={carriers} />
      )}
    </article>
  );
}
