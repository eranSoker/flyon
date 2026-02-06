// FlyOn — PassengerSelector Component v1.3.0 | 2026-02-06

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { CabinClass } from '@/lib/types';
import { CABIN_CLASS_LABELS, CABIN_CLASSES } from '@/lib/constants';
import styles from './PassengerSelector.module.css';

interface PassengerSelectorProps {
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  onAdultsChange: (n: number) => void;
  onChildrenChange: (n: number) => void;
  onInfantsChange: (n: number) => void;
  onCabinClassChange: (c: CabinClass) => void;
}

export default function PassengerSelector({
  adults,
  children,
  infants,
  cabinClass,
  onAdultsChange,
  onChildrenChange,
  onInfantsChange,
  onCabinClassChange,
}: PassengerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalTravelers = adults + children + infants;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      <label className={styles.label}>Travelers & Class</label>
      <button type="button" className={styles.trigger} onClick={handleToggle} aria-expanded={isOpen}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>
          {totalTravelers} Traveler{totalTravelers !== 1 ? 's' : ''}, {CABIN_CLASS_LABELS[cabinClass]}
        </span>
        <svg className={`${styles.chevron} ${isOpen ? styles.chevronUp : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.section}>
            <CounterRow label="Adults" sublabel="12+ years" value={adults} min={1} max={9} onChange={onAdultsChange} />
            <CounterRow label="Children" sublabel="2-11 years" value={children} min={0} max={8} onChange={onChildrenChange} />
            <CounterRow label="Infants" sublabel="Under 2" value={infants} min={0} max={Math.min(4, adults)} onChange={onInfantsChange} />
          </div>
          <div className={styles.divider} />
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Cabin class</label>
            <div className={styles.cabinOptions}>
              {CABIN_CLASSES.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  className={`${styles.cabinBtn} ${cabinClass === cls ? styles.cabinActive : ''}`}
                  onClick={() => onCabinClassChange(cls)}
                >
                  {CABIN_CLASS_LABELS[cls]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CounterRow({
  label,
  sublabel,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className={styles.counterRow}>
      <div>
        <span className={styles.counterLabel}>{label}</span>
        <span className={styles.counterSublabel}>{sublabel}</span>
      </div>
      <div className={styles.counter}>
        <button
          type="button"
          className={styles.counterBtn}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          -
        </button>
        <span className={styles.counterValue}>{value}</span>
        <button
          type="button"
          className={styles.counterBtn}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
