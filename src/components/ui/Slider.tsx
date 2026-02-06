// FlyOn — Slider Component v1.4.0 | 2026-02-06

'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import styles from './ui.module.css';

interface SliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (value: number) => string;
  step?: number;
}

export default function Slider({
  min,
  max,
  value,
  onChange,
  formatLabel = String,
  step = 1,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);

  const getValueFromPosition = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percent * (max - min);
      return Math.round(rawValue / step) * step;
    },
    [min, max, step]
  );

  const handlePointerDown = useCallback(
    (thumb: 'min' | 'max') => (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(thumb);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const newValue = getValueFromPosition(e.clientX);
      if (dragging === 'min') {
        onChange([Math.min(newValue, value[1] - step), value[1]]);
      } else {
        onChange([value[0], Math.max(newValue, value[0] + step)]);
      }
    },
    [dragging, getValueFromPosition, onChange, value, step]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  const leftPercent = ((value[0] - min) / (max - min)) * 100;
  const rightPercent = ((value[1] - min) / (max - min)) * 100;

  return (
    <div className={styles.sliderContainer}>
      <div
        className={styles.sliderTrack}
        ref={trackRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className={styles.sliderFill}
          style={{ left: `${leftPercent}%`, width: `${rightPercent - leftPercent}%` }}
        />
        <div
          className={styles.sliderThumb}
          style={{ left: `${leftPercent}%` }}
          onPointerDown={handlePointerDown('min')}
          role="slider"
          aria-label="Minimum value"
          aria-valuemin={min}
          aria-valuemax={value[1]}
          aria-valuenow={value[0]}
          tabIndex={0}
        />
        <div
          className={styles.sliderThumb}
          style={{ left: `${rightPercent}%` }}
          onPointerDown={handlePointerDown('max')}
          role="slider"
          aria-label="Maximum value"
          aria-valuemin={value[0]}
          aria-valuemax={max}
          aria-valuenow={value[1]}
          tabIndex={0}
        />
      </div>
      <div className={styles.sliderLabels}>
        <span>{formatLabel(value[0])}</span>
        <span>{formatLabel(value[1])}</span>
      </div>
    </div>
  );
}
