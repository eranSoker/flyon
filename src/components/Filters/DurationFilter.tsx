// FlyOn — DurationFilter Component v1.4.1 | 2026-02-06

'use client';

import Slider from '@/components/ui/Slider';
import { formatMinutesToDuration } from '@/lib/formatters';

interface DurationFilterProps {
  maxAvailable: number;
  value: number;
  onChange: (max: number) => void;
}

export default function DurationFilter({ maxAvailable, value, onChange }: DurationFilterProps) {
  if (maxAvailable === 0) return null;

  return (
    <Slider
      min={0}
      max={maxAvailable}
      value={[0, value]}
      onChange={([, max]) => onChange(max)}
      formatLabel={(v) => (v === 0 ? '0m' : formatMinutesToDuration(v))}
      step={15}
    />
  );
}
