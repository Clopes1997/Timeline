import { getDaysBetween } from './dateUtils';
import { TIMELINE_CONFIG, MS_PER_DAY } from '../constants';

export function getItemWidth(item: { start: Date | string; end: Date | string }, pixelsPerDay: number): number {
  const days = getDaysBetween(item.start, item.end);
  return Math.max(days * pixelsPerDay, TIMELINE_CONFIG.MIN_ITEM_WIDTH);
}

/**
 * Converts a date to a pixel position on the timeline.
 * Returns 0 for invalid dates or if viewStartDate is missing.
 */
export function dateToPosition(
  date: string | Date | null | undefined,
  viewStartDate: Date | null,
  pixelsPerDay: number
): number {
  if (!viewStartDate || !date) return 0;
  const dateObj = new Date(date);
  const startObj = new Date(viewStartDate);
  if (isNaN(dateObj.getTime()) || isNaN(startObj.getTime())) return 0;
  const daysDiff = Math.ceil((dateObj.getTime() - startObj.getTime()) / MS_PER_DAY);
  return Math.max(0, daysDiff * pixelsPerDay);
}
