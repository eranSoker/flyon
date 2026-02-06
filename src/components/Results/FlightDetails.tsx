// FlyOn — FlightDetails Component v1.3.1 | 2026-02-06

'use client';

import type { Itinerary } from '@/lib/types';
import { formatTime, formatDuration, parseDurationToMinutes, formatMinutesToDuration } from '@/lib/formatters';
import { AIRLINE_NAMES } from '@/lib/constants';
import styles from './FlightDetails.module.css';

interface FlightDetailsProps {
  itineraries: Itinerary[];
  carriers: Record<string, string>;
}

export default function FlightDetails({ itineraries, carriers }: FlightDetailsProps) {
  return (
    <div className={styles.details}>
      {itineraries.map((itinerary, itinIdx) => (
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
    </div>
  );
}

function formatLayover(arrivalTime: string, nextDepartureTime: string): string {
  const arrival = new Date(arrivalTime).getTime();
  const departure = new Date(nextDepartureTime).getTime();
  const diffMinutes = Math.round((departure - arrival) / 60000);
  return formatMinutesToDuration(diffMinutes);
}
