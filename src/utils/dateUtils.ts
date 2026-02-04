import type { TimelineItem, DateRange } from '../types';

export type ItemWithStartEnd = { start: Date | string; end: Date | string };
import { MS_PER_DAY } from '../constants';

/**
 * Calculates the number of days between two dates (inclusive).
 * Returns 0 for invalid dates.
 */
export function getDaysBetween(start: string | Date, end: string | Date): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 0;
  }
  // +1 to include both start and end dates (inclusive)
  return Math.ceil((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
}

/**
 * Parses a YYYY-MM-DD string to Date. Use at boundary when converting API data.
 */
export function parseDate(date: string | Date | null | undefined): Date {
  if (!date) return new Date(NaN);
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date.getTime());
  return isNaN(d.getTime()) ? new Date(NaN) : d;
}

/**
 * Formats a date as YYYY-MM-DD string.
 * Returns empty string for invalid dates.
 * Parses date-only strings (YYYY-MM-DD) as local midnight to avoid UTC shift.
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d =
    typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(date + 'T00:00:00')
      : new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets the date range (earliest start, latest end) from an array of items.
 * Returns null for both if no valid dates found.
 */
export function getDateRange(items: ItemWithStartEnd[]): DateRange {
  if (!items || items.length === 0) {
    return { start: null, end: null };
  }
  
  const dates = items.flatMap(item => {
    const startDate = new Date(item.start);
    const endDate = new Date(item.end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return [];
    }
    return [startDate, endDate];
  });
  
  if (dates.length === 0) {
    return { start: null, end: null };
  }
  
  const start = dates.reduce((min, d) => d < min ? d : min);
  const end = dates.reduce((max, d) => d > max ? d : max);
  
  return { start, end };
}

/**
 * Validates that an item has required properties and valid dates.
 * Type guard that narrows unknown to TimelineItem without unsafe type assertions.
 */
export function isValidItem(item: unknown): item is TimelineItem {
  if (!item || typeof item !== 'object' || item === null) return false;
  
  // Check if item has required properties with proper types
  if (!('id' in item) || typeof item.id !== 'number') return false;
  if (!('name' in item) || typeof item.name !== 'string') return false;
  if (!('start' in item) || typeof item.start !== 'string') return false;
  if (!('end' in item) || typeof item.end !== 'string') return false;
  
  // Validate dates
  const startDate = new Date(item.start);
  const endDate = new Date(item.end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return false;
  }
  return startDate <= endDate;
}
