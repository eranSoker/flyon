// FlyOn — PriceRangeFilter Component v1.4.1 | 2026-02-06

'use client';

import Slider from '@/components/ui/Slider';
import { formatPrice } from '@/lib/formatters';

interface PriceRangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  currency: string;
  onChange: (range: [number, number]) => void;
}

export default function PriceRangeFilter({ min, max, value, currency, onChange }: PriceRangeFilterProps) {
  if (min === max) return null;

  return (
    <Slider
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      formatLabel={(v) => formatPrice(v, currency)}
      step={10}
    />
  );
}
