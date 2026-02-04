import type { TimelineConfig } from './types';

export const TIMELINE_CONFIG: TimelineConfig = {
  BASE_PIXELS_PER_DAY: 10,
  MIN_ITEM_WIDTH: 88,
  ZOOM_STEP: 0.2,
  MAX_ZOOM: 3,
  MIN_ZOOM: 0.5,
  // Divide total days by this to determine step between date labels (aims for ~20 labels)
  DATE_LABEL_STEP_DIVISOR: 20,
  MAX_DATE_LABELS: 50,
  // Minimum gap in pixels between items before they can share a lane
  GAP_THRESHOLD_PX: 20,
  // Minimum width in pixels for each date marker label
  MIN_DATE_MARKER_WIDTH: 60,
};

// Milliseconds per day constant for date arithmetic
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Tooltip hover delay in milliseconds
export const TOOLTIP_HOVER_DELAY_MS = 100;

export const COLOR_PALETTE: readonly string[] = [
  "#ffd700",
  "#ffb14e",
  "#fa8775",
  "#ea5f94",
  "#cd34b5",
  "#9d02d7",
  "#0000ff",
  "#24e42d"
] as const;
