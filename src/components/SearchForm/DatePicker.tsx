// FlyOn — DatePicker Component v1.3.1 | 2026-02-06

'use client';

import { useCallback, useState, useEffect } from 'react';
import { format, addYears } from 'date-fns';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  departureDate: string;
  returnDate: string;
  tripType: 'roundTrip' | 'oneWay';
  onDepartureDateChange: (date: string) => void;
  onReturnDateChange: (date: string) => void;
  onTripTypeChange: (type: 'roundTrip' | 'oneWay') => void;
}

export default function DatePicker({
  departureDate,
  returnDate,
  tripType,
  onDepartureDateChange,
  onReturnDateChange,
  onTripTypeChange,
}: DatePickerProps) {
  // Compute date constraints on client only to avoid SSR hydration mismatch
  const [today, setToday] = useState('');
  const [maxDate, setMaxDate] = useState('');

  useEffect(() => {
    const now = new Date();
    setToday(format(now, 'yyyy-MM-dd'));
    setMaxDate(format(addYears(now, 1), 'yyyy-MM-dd'));
  }, []);

  const handleTripTypeToggle = useCallback(() => {
    onTripTypeChange(tripType === 'roundTrip' ? 'oneWay' : 'roundTrip');
  }, [tripType, onTripTypeChange]);

  return (
    <div className={styles.container}>
      <div className={styles.tripToggle}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${tripType === 'roundTrip' ? styles.active : ''}`}
          onClick={() => onTripTypeChange('roundTrip')}
        >
          Round trip
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${tripType === 'oneWay' ? styles.active : ''}`}
          onClick={() => onTripTypeChange('oneWay')}
        >
          One way
        </button>
      </div>
      <div className={styles.dateFields}>
        <div className={styles.dateField}>
          <label className={styles.label}>Departure</label>
          <div className={styles.inputWrapper}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input
              type="date"
              className={styles.input}
              value={departureDate}
              min={today}
              max={maxDate}
              onChange={(e) => onDepartureDateChange(e.target.value)}
              aria-label="Departure date"
            />
          </div>
        </div>
        {tripType === 'roundTrip' && (
          <div className={styles.dateField}>
            <label className={styles.label}>Return</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                className={styles.input}
                value={returnDate}
                min={departureDate || today}
                max={maxDate}
                onChange={(e) => onReturnDateChange(e.target.value)}
                aria-label="Return date"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
