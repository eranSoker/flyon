// FlyOn — PriceGraph Component v1.9.0 | 2026-02-06

'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatPrice, getTimeOfDay, formatStops } from '@/lib/formatters';
import { AIRLINE_NAMES } from '@/lib/constants';
import type { Flight, PriceDataPoint } from '@/lib/types';
import styles from './PriceGraph.module.css';

type ViewMode = 'airline' | 'timeOfDay' | 'stops';

interface PriceGraphProps {
  flights: Flight[];
  carriers: Record<string, string>;
  onBarClick?: (filter: { key: string; value: string }) => void;
  activeFilter?: { key: string; value: string } | null;
}

const VIEW_LABELS: Record<ViewMode, string> = {
  airline: 'By Airline',
  timeOfDay: 'By Time of Day',
  stops: 'By Stops',
};

const CHART_COLORS = ['#1a56db', '#0e9f6e', '#e3a008', '#e02424', '#7c3aed', '#0891b2', '#dc2626', '#059669'];

export default function PriceGraph({ flights, carriers, onBarClick, activeFilter }: PriceGraphProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('airline');

  const chartData = useMemo((): PriceDataPoint[] => {
    if (flights.length === 0) return [];

    const groups = new Map<string, { prices: number[]; count: number }>();

    flights.forEach((flight) => {
      let key: string;
      switch (viewMode) {
        case 'airline':
          key = carriers[flight.airlineCode] || AIRLINE_NAMES[flight.airlineCode] || flight.airlineCode;
          break;
        case 'timeOfDay':
          key = getTimeOfDay(new Date(flight.departureTime).getHours());
          break;
        case 'stops':
          key = formatStops(flight.stops);
          break;
      }

      const existing = groups.get(key);
      if (existing) {
        existing.prices.push(flight.price);
        existing.count++;
      } else {
        groups.set(key, { prices: [flight.price], count: 1 });
      }
    });

    return Array.from(groups.entries())
      .map(([label, data]) => ({
        label,
        minPrice: Math.min(...data.prices),
        avgPrice: Math.round(data.prices.reduce((a, b) => a + b, 0) / data.prices.length),
        count: data.count,
      }))
      .sort((a, b) => a.minPrice - b.minPrice);
  }, [flights, carriers, viewMode]);

  const currency = flights[0]?.currency || 'EUR';

  const handleBarClick = useCallback(
    (data: PriceDataPoint) => {
      if (!onBarClick) return;
      const filterKey = viewMode === 'airline' ? 'airline' : viewMode === 'stops' ? 'stops' : 'timeOfDay';
      onBarClick({ key: filterKey, value: data.label });
    },
    [viewMode, onBarClick]
  );

  if (flights.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Price Overview</h3>
        <div className={styles.toggles}>
          {(Object.keys(VIEW_LABELS) as ViewMode[]).map((mode) => (
            <button
              key={mode}
              className={`${styles.toggleBtn} ${viewMode === mode ? styles.active : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {VIEW_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatPrice(v, currency)}
              width={60}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const data = payload[0].payload as PriceDataPoint;
                return (
                  <div className={styles.tooltip}>
                    <div className={styles.tooltipLabel}>{data.label}</div>
                    <div className={styles.tooltipPrice}>
                      From {formatPrice(data.minPrice, currency)}
                    </div>
                    <div className={styles.tooltipCount}>
                      {data.count} flight{data.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="minPrice"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              isAnimationActive={true}
              animationDuration={300}
              onClick={(data) => handleBarClick(data)}
            >
              {chartData.map((entry, index) => {
                const isActive =
                  activeFilter?.value === entry.label;
                return (
                  <Cell
                    key={entry.label}
                    fill={isActive ? '#1040a0' : CHART_COLORS[index % CHART_COLORS.length]}
                    opacity={activeFilter && !isActive ? 0.4 : 1}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
