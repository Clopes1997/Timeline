import { getDaysBetween, formatDate, getDateRange, isValidItem } from '../dateUtils';
import type { TimelineItem } from '../../types';

describe('dateUtils', () => {
  describe('getDaysBetween', () => {
    it('should calculate days between two dates (inclusive)', () => {
      expect(getDaysBetween('2021-01-01', '2021-01-01')).toBe(1);
      expect(getDaysBetween('2021-01-01', '2021-01-02')).toBe(2);
      expect(getDaysBetween('2021-01-01', '2021-01-31')).toBe(31);
    });

    it('should return 0 for invalid dates', () => {
      expect(getDaysBetween('invalid', '2021-01-01')).toBe(0);
      expect(getDaysBetween('2021-01-01', 'invalid')).toBe(0);
    });

    it('should work with Date objects', () => {
      const start = new Date('2021-01-01');
      const end = new Date('2021-01-03');
      expect(getDaysBetween(start, end)).toBe(3);
    });
  });

  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      expect(formatDate('2021-01-15')).toBe('2021-01-15');
      expect(formatDate(new Date(2021, 11, 25))).toBe('2021-12-25'); // local Dec 25
    });

    it('should pad months and days with zeros', () => {
      expect(formatDate('2021-1-5')).toBe('2021-01-05');
    });

    it('should return empty string for invalid dates', () => {
      expect(formatDate('invalid')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('getDateRange', () => {
    it('should return earliest start and latest end dates', () => {
      const items: TimelineItem[] = [
        { id: 1, name: 'Item 1', start: '2021-01-15', end: '2021-01-20' },
        { id: 2, name: 'Item 2', start: '2021-01-10', end: '2021-01-25' },
        { id: 3, name: 'Item 3', start: '2021-01-20', end: '2021-01-30' },
      ];

      const range = getDateRange(items);
      expect(range.start).toEqual(new Date('2021-01-10'));
      expect(range.end).toEqual(new Date('2021-01-30'));
    });

    it('should return null for empty array', () => {
      const range = getDateRange([]);
      expect(range.start).toBeNull();
      expect(range.end).toBeNull();
    });

    it('should filter out items with invalid dates', () => {
      const items: TimelineItem[] = [
        { id: 1, name: 'Item 1', start: 'invalid', end: '2021-01-20' },
        { id: 2, name: 'Item 2', start: '2021-01-10', end: '2021-01-25' },
      ];

      const range = getDateRange(items);
      expect(range.start).toEqual(new Date('2021-01-10'));
      expect(range.end).toEqual(new Date('2021-01-25'));
    });
  });

  describe('isValidItem', () => {
    it('should return true for valid timeline item', () => {
      const item: TimelineItem = {
        id: 1,
        name: 'Test Item',
        start: '2021-01-01',
        end: '2021-01-10',
      };
      expect(isValidItem(item)).toBe(true);
    });

    it('should return false for item with missing properties', () => {
      expect(isValidItem({})).toBe(false);
      expect(isValidItem({ id: 1 })).toBe(false);
      expect(isValidItem({ id: 1, name: 'Test' })).toBe(false);
    });

    it('should return false for item with invalid dates', () => {
      const item = {
        id: 1,
        name: 'Test Item',
        start: 'invalid',
        end: '2021-01-10',
      };
      expect(isValidItem(item)).toBe(false);
    });

    it('should return false for item where start > end', () => {
      const item: TimelineItem = {
        id: 1,
        name: 'Test Item',
        start: '2021-01-10',
        end: '2021-01-01',
      };
      expect(isValidItem(item)).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(isValidItem(null)).toBe(false);
      expect(isValidItem(undefined)).toBe(false);
      expect(isValidItem('string')).toBe(false);
      expect(isValidItem(123)).toBe(false);
    });
  });
});
