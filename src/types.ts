/**
 * Timeline item data structure (API boundary: strings)
 */
export interface TimelineItem {
  id: number;
  name: string;
  start: string; // YYYY-MM-DD format
  end: string; // YYYY-MM-DD format
}

/**
 * Internal timeline item with Date for calculations (convert at container boundary)
 */
export interface TimelineItemInternal {
  id: number;
  name: string;
  start: Date;
  end: Date;
}

/**
 * Date range for timeline view
 */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/**
 * Drag state for timeline items (item/original may be internal Date-based when dragging)
 */
export interface DragState {
  item: TimelineItem | TimelineItemInternal | null;
  type: 'move' | 'resize-start' | 'resize-end' | null;
  startX: number;
  original: TimelineItem | TimelineItemInternal | null;
}

/**
 * Date label for timeline header
 */
export interface DateLabel {
  date: Date;
  position: number;
}

/**
 * Timeline configuration
 */
export interface TimelineConfig {
  BASE_PIXELS_PER_DAY: number;
  MIN_ITEM_WIDTH: number;
  ZOOM_STEP: number;
  MAX_ZOOM: number;
  MIN_ZOOM: number;
  DATE_LABEL_STEP_DIVISOR: number;
  MAX_DATE_LABELS: number;
  GAP_THRESHOLD_PX: number;
  MIN_DATE_MARKER_WIDTH: number;
}

/**
 * Callback for item updates
 */
export type ItemUpdateCallback = (item: TimelineItem) => void;
