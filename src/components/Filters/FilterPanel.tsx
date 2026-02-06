// FlyOn — FilterPanel Component v1.4.1 | 2026-02-06

'use client';

import { useMemo } from 'react';
import StopsFilter from './StopsFilter';
import PriceRangeFilter from './PriceRangeFilter';
import AirlineFilter from './AirlineFilter';
import TimeFilter from './TimeFilter';
import DurationFilter from './DurationFilter';
import Button from '@/components/ui/Button';
import type { Flight, FilterState } from '@/lib/types';
import styles from './FilterPanel.module.css';

interface FilterPanelProps {
  flights: Flight[];
  carriers: Record<string, string>;
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onClearFilters: () => void;
}

export default function FilterPanel({
  flights,
  carriers,
  filters,
  onFilterChange,
  onClearFilters,
}: FilterPanelProps) {
  const priceRange = useMemo(() => {
    if (flights.length === 0) return { min: 0, max: 1000 };
    const prices = flights.map((f) => f.price);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [flights]);

  const maxDuration = useMemo(() => {
    if (flights.length === 0) return 1440;
    return Math.max(...flights.map((f) => f.duration));
  }, [flights]);

  const currency = flights[0]?.currency || 'USD';

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.stops.length > 0) count++;
    if (filters.priceRange[0] > priceRange.min || filters.priceRange[1] < priceRange.max) count++;
    if (filters.airlines.length > 0) count++;
    if (filters.departureTimeRange[0] > 0 || filters.departureTimeRange[1] < 24) count++;
    if (filters.arrivalTimeRange[0] > 0 || filters.arrivalTimeRange[1] < 24) count++;
    if (filters.maxDuration < maxDuration) count++;
    return count;
  }, [filters, priceRange, maxDuration]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filters</h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear all ({activeFilterCount})
          </Button>
        )}
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Stops</h4>
        <StopsFilter
          flights={flights}
          selectedStops={filters.stops}
          onChange={(stops) => onFilterChange({ stops })}
        />
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Price</h4>
        <PriceRangeFilter
          min={priceRange.min}
          max={priceRange.max}
          value={[
            Math.max(filters.priceRange[0], priceRange.min),
            Math.min(filters.priceRange[1], priceRange.max),
          ]}
          currency={currency}
          onChange={(range) => onFilterChange({ priceRange: range })}
        />
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Airlines</h4>
        <AirlineFilter
          flights={flights}
          carriers={carriers}
          selectedAirlines={filters.airlines}
          onChange={(airlines) => onFilterChange({ airlines })}
        />
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Times</h4>
        <TimeFilter
          label="Departure"
          value={filters.departureTimeRange}
          onChange={(range) => onFilterChange({ departureTimeRange: range })}
        />
        <TimeFilter
          label="Arrival"
          value={filters.arrivalTimeRange}
          onChange={(range) => onFilterChange({ arrivalTimeRange: range })}
        />
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Duration</h4>
        <DurationFilter
          maxAvailable={maxDuration}
          value={Math.min(filters.maxDuration, maxDuration)}
          onChange={(max) => onFilterChange({ maxDuration: max })}
        />
      </div>
    </div>
  );
}

export { type FilterPanelProps };
