import { getDaysBetween } from './utils/dateUtils';
import { TIMELINE_CONFIG, MS_PER_DAY } from './constants';
import type { TimelineItemInternal } from './types';

/** End position in ms (start + visual width in time). Used for overlap checks. */
export function getItemEndPositionMs(
  item: TimelineItemInternal,
  pixelsPerDay: number,
  minItemWidth: number
): number {
  const startDate = item.start instanceof Date ? item.start : new Date(item.start);
  if (isNaN(startDate.getTime())) return 0;
  const days = getDaysBetween(item.start, item.end);
  const naturalWidth = days * pixelsPerDay;
  const visualWidth = Math.max(naturalWidth, minItemWidth);
  const startPos = startDate.getTime();
  return startPos + (visualWidth / pixelsPerDay) * MS_PER_DAY;
}

/** True when last item's visual end is at or before the new item's start. */
export function itemsNonOverlapping(lastItemEndPosMs: number, itemStartMs: number): boolean {
  return lastItemEndPosMs <= itemStartMs;
}

/** True when there is a gap and the new item is small enough to fit with sufficient pixel gap. */
export function smallItemWithSufficientGap(
  item: TimelineItemInternal,
  lastItemEndPosMs: number,
  lastItemEndMs: number,
  itemStartMs: number,
  pixelsPerDay: number,
  minItemWidth: number,
  gapThresholdPx: number
): boolean {
  if (lastItemEndMs >= itemStartMs) return false;
  const days = getDaysBetween(item.start, item.end);
  const naturalWidth = days * pixelsPerDay;
  if (naturalWidth >= minItemWidth) return false;
  const gapMs = itemStartMs - lastItemEndPosMs;
  const gapPixels = (gapMs / MS_PER_DAY) * pixelsPerDay;
  return gapPixels >= gapThresholdPx;
}

/**
 * Checks if an item can share a lane with the last item in a lane.
 * Items can share if they don't overlap, or if there's sufficient gap when the new item is small.
 */
export function canShareLane(
  item: TimelineItemInternal,
  laneLastItem: TimelineItemInternal,
  pixelsPerDay: number,
  minItemWidth: number
): boolean {
  const itemStartDate = item.start instanceof Date ? item.start : new Date(item.start);
  const lastItemEndDate = laneLastItem.end instanceof Date ? laneLastItem.end : new Date(laneLastItem.end);
  if (isNaN(itemStartDate.getTime()) || isNaN(lastItemEndDate.getTime())) return false;

  const itemStartMs = itemStartDate.getTime();
  const lastItemEndMs = lastItemEndDate.getTime();
  const lastItemEndPosMs = getItemEndPositionMs(laneLastItem, pixelsPerDay, minItemWidth);

  if (itemsNonOverlapping(lastItemEndPosMs, itemStartMs)) return true;
  return smallItemWithSufficientGap(
    item,
    lastItemEndPosMs,
    lastItemEndMs,
    itemStartMs,
    pixelsPerDay,
    minItemWidth,
    TIMELINE_CONFIG.GAP_THRESHOLD_PX
  );
}

function assignLanes(
  items: TimelineItemInternal[],
  pixelsPerDay: number = TIMELINE_CONFIG.BASE_PIXELS_PER_DAY,
  minItemWidth: number = TIMELINE_CONFIG.MIN_ITEM_WIDTH
): TimelineItemInternal[][] {
  if (items.length === 0) return [];

  const sortedItems = [...items].sort((a, b) => {
    const aStart = a.start instanceof Date ? a.start : new Date(a.start);
    const bStart = b.start instanceof Date ? b.start : new Date(b.start);
    const aEnd = a.end instanceof Date ? a.end : new Date(a.end);
    const bEnd = b.end instanceof Date ? b.end : new Date(b.end);

    const aStartValid = !isNaN(aStart.getTime());
    const bStartValid = !isNaN(bStart.getTime());
    const aEndValid = !isNaN(aEnd.getTime());
    const bEndValid = !isNaN(bEnd.getTime());

    if (!aStartValid && !bStartValid) return 0;
    if (!aStartValid) return 1;
    if (!bStartValid) return -1;

    const dateDiff = aStart.getTime() - bStart.getTime();
    if (dateDiff !== 0) return dateDiff;

    if (!aEndValid && !bEndValid) return 0;
    if (!aEndValid) return 1;
    if (!bEndValid) return -1;

    return aEnd.getTime() - bEnd.getTime();
  });

  const lanes: TimelineItemInternal[][] = [];

  for (const item of sortedItems) {
    let assigned = false;
    
    for (const lane of lanes) {
      const lastItem = lane[lane.length - 1];
      if (canShareLane(item, lastItem, pixelsPerDay, minItemWidth)) {
        lane.push(item);
        assigned = true;
        break;
      }
    }
    
    if (!assigned) {
      lanes.push([item]);
    }
  }
  
  return lanes;
}

export default assignLanes;
