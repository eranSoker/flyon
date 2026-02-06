// FlyOn — AirlineFilter Component v1.4.1 | 2026-02-06

'use client';

import { useMemo } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import { formatPrice } from '@/lib/formatters';
import { AIRLINE_NAMES } from '@/lib/constants';
import type { Flight } from '@/lib/types';

interface AirlineFilterProps {
  flights: Flight[];
  carriers: Record<string, string>;
  selectedAirlines: string[];
  onChange: (airlines: string[]) => void;
}

export default function AirlineFilter({ flights, carriers, selectedAirlines, onChange }: AirlineFilterProps) {
  const airlineOptions = useMemo(() => {
    const stats = new Map<string, { count: number; minPrice: number }>();
    flights.forEach((f) => {
      const existing = stats.get(f.airline);
      if (existing) {
        existing.count++;
        existing.minPrice = Math.min(existing.minPrice, f.price);
      } else {
        stats.set(f.airline, { count: 1, minPrice: f.price });
      }
    });

    return Array.from(stats.entries())
      .map(([code, data]) => ({
        code,
        name: carriers[code] || AIRLINE_NAMES[code] || code,
        count: data.count,
        minPrice: data.minPrice,
      }))
      .sort((a, b) => a.minPrice - b.minPrice);
  }, [flights, carriers]);

  const handleToggle = (code: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedAirlines, code]);
    } else {
      onChange(selectedAirlines.filter((a) => a !== code));
    }
  };

  const handleSelectAll = () => {
    onChange(airlineOptions.map((a) => a.code));
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button
          onClick={handleSelectAll}
          style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Select all
        </button>
        <button
          onClick={handleClear}
          style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Clear
        </button>
      </div>
      {airlineOptions.map((opt) => (
        <Checkbox
          key={opt.code}
          label={opt.name}
          checked={selectedAirlines.length === 0 || selectedAirlines.includes(opt.code)}
          onChange={(checked) => handleToggle(opt.code, checked)}
          suffix={`from ${formatPrice(opt.minPrice, flights[0]?.currency)}`}
        />
      ))}
    </div>
  );
}
