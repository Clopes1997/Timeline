import { getItemWidth, dateToPosition } from '../timelineUtils';
import type { TimelineItem } from '../../types';

describe('timelineUtils', () => {
  describe('getItemWidth', () => {
    it('should calculate width based on days and pixels per day', () => {
      const item: TimelineItem = {
        id: 1,
        name: 'Test Item',
        start: '2021-01-01',
        end: '2021-01-10', // 10 days
      };

      expect(getItemWidth(item, 10)).toBe(100); // 10 days * 10 pixels
    });

    it('should return minimum width if calculated width is too small', () => {
      const item: TimelineItem = {
        id: 1,
        name: 'Test Item',
        start: '2021-01-01',
        end: '2021-01-01', // 1 day
      };

      const width = getItemWidth(item, 1); // 1 day * 1 pixel = 1px
      expect(width).toBeGreaterThanOrEqual(88); // MIN_ITEM_WIDTH
    });
  });

  describe('dateToPosition', () => {
    it('should calculate position relative to view start date', () => {
      const viewStart = new Date('2021-01-01');
      const date = new Date('2021-01-11'); // 10 days later
      const pixelsPerDay = 10;

      expect(dateToPosition(date, viewStart, pixelsPerDay)).toBe(100); // 10 days * 10 pixels
    });

    it('should return 0 for dates before view start', () => {
      const viewStart = new Date('2021-01-10');
      const date = new Date('2021-01-01'); // Before view start
      const pixelsPerDay = 10;

      expect(dateToPosition(date, viewStart, pixelsPerDay)).toBe(0);
    });

    it('should return 0 for invalid dates', () => {
      const viewStart = new Date('2021-01-01');
      expect(dateToPosition('invalid', viewStart, 10)).toBe(0);
      expect(dateToPosition(null, viewStart, 10)).toBe(0);
    });

    it('should return 0 if viewStartDate is null', () => {
      const date = new Date('2021-01-01');
      expect(dateToPosition(date, null, 10)).toBe(0);
    });
  });
});
