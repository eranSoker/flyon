// FlyOn — Formatters v1.2.1 | 2026-02-06

import { format, parseISO } from 'date-fns';

/**
 * Parse ISO 8601 duration to total minutes.
 * "PT6H15M" → 375, "PT2H" → 120, "PT45M" → 45
 */
export function parseDurationToMinutes(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  return hours * 60 + minutes;
}

/**
 * Format ISO 8601 duration to human-readable.
 * "PT6H15M" → "6h 15m", "PT2H" → "2h 0m"
 */
export function formatDuration(duration: string): string {
  const totalMinutes = parseDurationToMinutes(duration);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

/**
 * Format minutes to human-readable duration.
 * 375 → "6h 15m"
 */
export function formatMinutesToDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

/**
 * Format price with currency symbol.
 * (342, "USD") → "$342", (1234.5, "EUR") → "€1,235"
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string to display format.
 * "2025-03-15" → "Sat, Mar 15"
 */
export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'EEE, MMM d');
}

/**
 * Format ISO datetime to time only.
 * "2025-03-15T09:30:00" → "9:30 AM"
 */
export function formatTime(dateTimeStr: string): string {
  const date = parseISO(dateTimeStr);
  return format(date, 'h:mm a');
}

/**
 * Format ISO date to short date.
 * "2025-03-15" → "Mar 15"
 */
export function formatShortDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'MMM d');
}

/**
 * Format stops count to label.
 * 0 → "Nonstop", 1 → "1 stop", 2 → "2 stops"
 */
export function formatStops(stops: number): string {
  if (stops === 0) return 'Nonstop';
  if (stops === 1) return '1 stop';
  return `${stops} stops`;
}

/**
 * Get hour from ISO datetime (0-23).
 */
export function getHourFromDateTime(dateTimeStr: string): number {
  const date = parseISO(dateTimeStr);
  return date.getHours();
}

/**
 * Format hour to time-of-day label.
 * 6 → "6:00 AM", 14 → "2:00 PM"
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
}

/**
 * Get time-of-day category.
 * 0-5 → "Night", 6-11 → "Morning", 12-17 → "Afternoon", 18-23 → "Evening"
 */
export function getTimeOfDay(hour: number): string {
  if (hour < 6) return 'Night';
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}
