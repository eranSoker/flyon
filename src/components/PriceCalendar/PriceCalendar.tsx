// FlyOn — PriceCalendar Component v1.7.0 | 2026-02-06

'use client';

import { useState, useMemo, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, getDay, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import { usePriceAnalysis } from '@/hooks/usePriceAnalysis';
import { formatPrice } from '@/lib/formatters';
import styles from './PriceCalendar.module.css';

interface PriceCalendarProps {
  origin: string;
  destination: string;
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PriceCalendar({ origin, destination, selectedDate, onDateSelect }: PriceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return selectedDate ? startOfMonth(new Date(selectedDate)) : startOfMonth(new Date());
  });

  const { days } = usePriceAnalysis({ origin, destination, month: currentMonth });

  const priceThresholds = useMemo(() => {
    const prices = days.filter((d) => d.minPrice !== null).map((d) => d.minPrice!);
    if (prices.length === 0) return { cheap: 0, expensive: Infinity };
    const sorted = [...prices].sort((a, b) => a - b);
    const cheapIdx = Math.floor(sorted.length * 0.2);
    const expIdx = Math.floor(sorted.length * 0.8);
    return { cheap: sorted[cheapIdx], expensive: sorted[expIdx] };
  }, [days]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDayOfWeek = (getDay(monthStart) + 6) % 7; // Monday-based
  const today = startOfDay(new Date());
  const canGoPrev = !isBefore(subMonths(currentMonth, 1), startOfMonth(today));

  const currency = days[0]?.minPrice !== null ? 'USD' : 'USD';

  const calendarCells = useMemo(() => {
    const cells: Array<{ date: string; dayNum: number; price: number | null; loading: boolean; isPast: boolean } | null> = [];

    // Empty cells before first day
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push(null);
    }

    // Days of month
    for (let day = 1; day <= monthEnd.getDate(); day++) {
      const dateStr = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), 'yyyy-MM-dd');
      const dayData = days.find((d) => d.date === dateStr);
      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      cells.push({
        date: dateStr,
        dayNum: day,
        price: dayData?.minPrice ?? null,
        loading: dayData?.loading ?? false,
        isPast: isBefore(dateObj, today),
      });
    }

    return cells;
  }, [currentMonth, days, monthEnd, startDayOfWeek, today]);

  const getPriceClass = (price: number | null): string => {
    if (price === null) return '';
    if (price <= priceThresholds.cheap) return styles.cheap;
    if (price >= priceThresholds.expensive) return styles.expensive;
    return styles.mid;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.navBtn}
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          &#9664;
        </button>
        <h3 className={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</h3>
        <button
          className={styles.navBtn}
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          &#9654;
        </button>
      </div>

      <div className={styles.weekdays}>
        {WEEKDAYS.map((day) => (
          <div key={day} className={styles.weekday}>{day}</div>
        ))}
      </div>

      <div className={styles.grid}>
        {calendarCells.map((cell, i) => {
          if (!cell) {
            return <div key={`empty-${i}`} className={styles.emptyCell} />;
          }

          const isSelected = cell.date === selectedDate;

          return (
            <button
              key={cell.date}
              className={`${styles.dayCell} ${getPriceClass(cell.price)} ${isSelected ? styles.selected : ''} ${cell.isPast ? styles.past : ''}`}
              onClick={() => !cell.isPast && onDateSelect(cell.date)}
              disabled={cell.isPast}
            >
              <span className={styles.dayNum}>{cell.dayNum}</span>
              {cell.loading ? (
                <span className={styles.dayPriceLoading} />
              ) : cell.price !== null ? (
                <span className={styles.dayPrice}>{formatPrice(cell.price, currency)}</span>
              ) : (
                <span className={styles.dayPrice}>—</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
