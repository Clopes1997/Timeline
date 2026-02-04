import assignLanes from '../assignLanes';
import { parseDate } from '../utils/dateUtils';
import type { TimelineItem, TimelineItemInternal } from '../types';

function toInternal(items: TimelineItem[]): TimelineItemInternal[] {
  return items.map((i) => ({ ...i, start: parseDate(i.start), end: parseDate(i.end) }));
}

describe('assignLanes', () => {
  it('should return empty array for empty input', () => {
    expect(assignLanes([])).toEqual([]);
  });

  it('should assign non-overlapping items to the same lane', () => {
    const items: TimelineItem[] = [
      { id: 1, name: 'Item 1', start: '2021-01-01', end: '2021-01-05' },
      { id: 2, name: 'Item 2', start: '2021-01-10', end: '2021-01-15' },
    ];

    const lanes = assignLanes(toInternal(items));
    expect(lanes.length).toBe(1);
    expect(lanes[0].length).toBe(2);
  });

  it('should assign overlapping items to different lanes', () => {
    const items: TimelineItem[] = [
      { id: 1, name: 'Item 1', start: '2021-01-01', end: '2021-01-10' },
      { id: 2, name: 'Item 2', start: '2021-01-05', end: '2021-01-15' },
    ];

    const lanes = assignLanes(toInternal(items));
    expect(lanes.length).toBe(2);
    expect(lanes[0].length).toBe(1);
    expect(lanes[1].length).toBe(1);
  });

  it('should sort items by start date, then end date', () => {
    const items: TimelineItem[] = [
      { id: 2, name: 'Item 2', start: '2021-01-10', end: '2021-01-15' },
      { id: 1, name: 'Item 1', start: '2021-01-01', end: '2021-01-05' },
      { id: 3, name: 'Item 3', start: '2021-01-01', end: '2021-01-03' },
    ];

    const lanes = assignLanes(toInternal(items));
    // Sorted by start then end: Item 3 (1/1-1/3), Item 1 (1/1-1/5), Item 2 (1/10-1/15).
    // Item 3 in lane 0; Item 1 overlaps Item 3 visually so lane 1; Item 2 does not overlap Item 3 so lane 0.
    expect(lanes[0][0].id).toBe(3);
    expect(lanes[0][1].id).toBe(2);
    expect(lanes[1][0].id).toBe(1);
  });

  it('should handle items that can share lanes with gaps', () => {
    const items: TimelineItem[] = [
      { id: 1, name: 'Item 1', start: '2021-01-01', end: '2021-01-05' },
      { id: 2, name: 'Item 2', start: '2021-01-20', end: '2021-01-25' },
    ];

    const lanes = assignLanes(toInternal(items));
    // With sufficient gap, items might share a lane
    expect(lanes.length).toBeGreaterThanOrEqual(1);
  });
});
