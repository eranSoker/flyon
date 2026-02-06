// FlyOn — FlightDetails Component v1.9.0 | 2026-02-06

'use client';

import type { Flight } from '@/lib/types';
import { formatTime, formatDuration, formatMinutesToDuration } from '@/lib/formatters';
import { AIRLINE_NAMES } from '@/lib/constants';
import styles from './FlightDetails.module.css';

interface FlightDetailsProps {
  flight: Flight;
  carriers: Record<string, string>;
}

export default function FlightDetails({ flight, carriers }: FlightDetailsProps) {
  return (
    <div className={styles.details}>
      {flight.itineraries.map((itinerary, itinIdx) => (
        <div key={itinIdx} className={styles.itinerary}>
          <h4 className={styles.itineraryLabel}>
            {itinIdx === 0 ? 'Outbound' : 'Return'} — {formatDuration(itinerary.duration)}
          </h4>
          <div className={styles.segments}>
            {itinerary.segments.map((segment, segIdx) => {
              const carrierName =
                carriers[segment.carrierCode] ||
                AIRLINE_NAMES[segment.carrierCode] ||
                segment.carrierCode;

              return (
                <div key={segment.id}>
                  <div className={styles.segment}>
                    <div className={styles.segmentTimeline}>
                      <div className={styles.dot} />
                      <div className={styles.line} />
                      <div className={styles.dot} />
                    </div>
                    <div className={styles.segmentInfo}>
                      <div className={styles.segmentRow}>
                        <span className={styles.time}>{formatTime(segment.departure.at)}</span>
                        <span className={styles.airport}>
                          {segment.departure.iataCode}
                          {segment.departure.terminal ? ` T${segment.departure.terminal}` : ''}
                        </span>
                      </div>
                      <div className={styles.flightInfo}>
                        <span className={styles.carrier}>
                          {carrierName} {segment.carrierCode}{segment.number}
                        </span>
                        <span className={styles.duration}>{formatDuration(segment.duration)}</span>
                        <span className={styles.aircraft}>{segment.aircraft.code}</span>
                      </div>
                      <div className={styles.segmentRow}>
                        <span className={styles.time}>{formatTime(segment.arrival.at)}</span>
                        <span className={styles.airport}>
                          {segment.arrival.iataCode}
                          {segment.arrival.terminal ? ` T${segment.arrival.terminal}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  {segIdx < itinerary.segments.length - 1 && (
                    <div className={styles.layover}>
                      <span className={styles.layoverDot} />
                      <span className={styles.layoverText}>
                        {formatLayover(
                          segment.arrival.at,
                          itinerary.segments[segIdx + 1].departure.at
                        )}{' '}
                        layover in {segment.arrival.iataCode}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Fare details */}
      <div className={styles.fareDetails}>
        <div className={styles.fareRow}>
          <span className={styles.fareLabel}>Cabin bags</span>
          <span className={styles.fareValue}>
            {flight.cabinBags > 0 ? `${flight.cabinBags} included` : 'Not included'}
          </span>
        </div>
        <div className={styles.fareRow}>
          <span className={styles.fareLabel}>Checked bags</span>
          <span className={styles.fareValue}>
            {flight.checkedBags > 0
              ? `${flight.checkedBags} included`
              : flight.bagFee !== null
                ? `From ${formatBagFee(flight.bagFee, flight.currency)}`
                : 'Not included'}
          </span>
        </div>
        {flight.aircraftNames.length > 0 && (
          <div className={styles.fareRow}>
            <span className={styles.fareLabel}>Aircraft</span>
            <span className={styles.fareValue}>{flight.aircraftNames.join(', ')}</span>
          </div>
        )}
        {flight.amenities.length > 0 && (
          <div className={styles.fareRow}>
            <span className={styles.fareLabel}>Included</span>
            <span className={styles.fareValue}>
              {flight.amenities.map((a) => a.charAt(0) + a.slice(1).toLowerCase()).join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatLayover(arrivalTime: string, nextDepartureTime: string): string {
  const arrival = new Date(arrivalTime).getTime();
  const departure = new Date(nextDepartureTime).getTime();
  const diffMinutes = Math.round((departure - arrival) / 60000);
  return formatMinutesToDuration(diffMinutes);
}

function formatBagFee(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
