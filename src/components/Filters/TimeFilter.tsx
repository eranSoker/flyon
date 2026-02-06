// FlyOn — TimeFilter Component v1.4.1 | 2026-02-06

'use client';

import Slider from '@/components/ui/Slider';
import { formatHour } from '@/lib/formatters';

interface TimeFilterProps {
  label: string;
  value: [number, number];
  onChange: (range: [number, number]) => void;
}

export default function TimeFilter({ label, value, onChange }: TimeFilterProps) {
  return (
    <div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
        {label}
      </div>
      <Slider
        min={0}
        max={24}
        value={value}
        onChange={onChange}
        formatLabel={formatHour}
        step={1}
      />
    </div>
  );
}
