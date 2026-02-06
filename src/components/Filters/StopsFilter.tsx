// FlyOn — StopsFilter Component v1.4.1 | 2026-02-06

'use client';

import { useMemo } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import { formatPrice, formatStops } from '@/lib/formatters';
import type { Flight } from '@/lib/types';

interface StopsFilterProps {
  flights: Flight[];
  selectedStops: number[];
  onChange: (stops: number[]) => void;
}

export default function StopsFilter({ flights, selectedStops, onChange }: StopsFilterProps) {
  const stopOptions = useMemo(() => {
    const stats = new Map<number, { count: number; minPrice: number }>();
    flights.forEach((f) => {
      const existing = stats.get(f.stops);
      if (existing) {
        existing.count++;
        existing.minPrice = Math.min(existing.minPrice, f.price);
      } else {
        stats.set(f.stops, { count: 1, minPrice: f.price });
      }
    });

    return [0, 1, 2].map((stops) => ({
      stops,
      label: formatStops(stops === 2 ? 2 : stops),
      count: stats.get(stops)?.count || 0,
      minPrice: stats.get(stops)?.minPrice,
    })).filter((opt) => opt.count > 0 || (stops => stops <= 2)(opt.stops));
  }, [flights]);

  const handleToggle = (stops: number, checked: boolean) => {
    if (checked) {
      onChange([...selectedStops, stops]);
    } else {
      onChange(selectedStops.filter((s) => s !== stops));
    }
  };

  return (
    <div>
      {stopOptions.map((opt) => (
        <Checkbox
          key={opt.stops}
          label={opt.label}
          checked={selectedStops.includes(opt.stops)}
          onChange={(checked) => handleToggle(opt.stops, checked)}
          suffix={
            opt.count > 0
              ? `(${opt.count}) from ${formatPrice(opt.minPrice!, flights[0]?.currency)}`
              : '(0)'
          }
        />
      ))}
    </div>
  );
}
