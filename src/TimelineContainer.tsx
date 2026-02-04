import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import assignLanes from "./assignLanes";
import { getDaysBetween, formatDate, getDateRange, isValidItem, parseDate } from "./utils/dateUtils";
import { getItemWidth, dateToPosition } from "./utils/timelineUtils";
import { TIMELINE_CONFIG, COLOR_PALETTE, MS_PER_DAY } from "./constants";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useItemEditing } from "./hooks/useItemEditing";
import { useTooltip } from "./hooks/useTooltip";
import { TimelineHandlersProvider } from "./context/TimelineHandlersContext";
import { timelineStore } from "./store/TimelineStateStore";
import { TimelineView, type ItemLayout } from "./TimelineView";
import type { TimelineItem as TimelineItemType, TimelineItemInternal, ItemUpdateCallback, DateLabel } from "./types";

interface TimelineContainerProps {
  items: TimelineItemType[];
  onItemUpdate?: ItemUpdateCallback;
}

function TimelineGuard({ items, onItemUpdate }: TimelineContainerProps) {
  if (!items || !Array.isArray(items)) {
    return <div>No items to display</div>;
  }
  return <TimelineContainerInner items={items} onItemUpdate={onItemUpdate} />;
}

function TimelineContainerInner({ items, onItemUpdate }: TimelineContainerProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const timelineRef = useRef<HTMLDivElement>(null);

  const validItems = useMemo(() => items.filter(isValidItem), [items]);

  const itemCacheRef = useRef(new Map<number, TimelineItemInternal>());
  
  const internalItems = useMemo((): TimelineItemInternal[] => {
    const cache = itemCacheRef.current;
    const next = new Map<number, TimelineItemInternal>();
    
    for (const item of validItems) {
      const id = item.id;
      const cached = cache.get(id);
      const start = parseDate(item.start);
      const end = parseDate(item.end);

      if (
        cached &&
        cached.id === id &&
        cached.name === item.name &&
        cached.start.getTime() === start.getTime() &&
        cached.end.getTime() === end.getTime()
      ) {
        next.set(id, cached);
      } else {
        next.set(id, { ...item, start, end });
      }
    }

    itemCacheRef.current = next;
    
    return Array.from(next.values());
  }, [validItems]);
  const dateRange = useMemo(() => getDateRange(internalItems), [internalItems]);
  const { start: viewStartDate, end: viewEndDate } = dateRange;

  const totalDays = useMemo(() => {
    if (!viewStartDate || !viewEndDate) return 1;
    return Math.ceil((viewEndDate.getTime() - viewStartDate.getTime()) / MS_PER_DAY) + 1;
  }, [viewStartDate, viewEndDate]);

  const pixelsPerDay = useMemo(() => TIMELINE_CONFIG.BASE_PIXELS_PER_DAY * zoomLevel, [zoomLevel]);
  const timelineWidth = useMemo(() => totalDays * pixelsPerDay, [totalDays, pixelsPerDay]);

  const { handleMouseDown: handleDragMouseDown } = useDragAndDrop(pixelsPerDay, onItemUpdate);
  const {
    handleItemDoubleClick: handleItemDoubleClickOriginal,
    handleNameChange: handleNameChangeOriginal,
    handleNameSubmit: handleNameSubmitOriginal,
    handleNameKeyDown: handleNameKeyDownOriginal,
  } = useItemEditing(onItemUpdate, validItems);

  const { tooltipItem, tooltipPosition, handleItemNameMouseEnter, handleItemNameMouseLeave } = useTooltip(timelineRef);

  const lanes = useMemo(
    () => assignLanes(internalItems, pixelsPerDay, TIMELINE_CONFIG.MIN_ITEM_WIDTH),
    [internalItems, pixelsPerDay]
  );

  const itemDaysMap = useMemo(() => {
    const map = new Map<number, number>();
    internalItems.forEach((item) => map.set(item.id, getDaysBetween(item.start, item.end)));
    return map;
  }, [internalItems]);

  const itemMapRef = useRef<Map<number, TimelineItemInternal>>(new Map());
  useEffect(() => {
    itemMapRef.current = new Map(internalItems.map((i) => [i.id, i]));
  }, [internalItems]);

  const toApiItem = useCallback(
    (internal: TimelineItemInternal): TimelineItemType => ({
      id: internal.id,
      name: internal.name,
      start: formatDate(internal.start),
      end: formatDate(internal.end),
    }),
    []
  );

  const handleMouseEnter = useCallback((itemId: number) => {
    const { dragState } = timelineStore.getState();
    if (dragState.item !== null) return;
    timelineStore.setHovered(itemId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timelineStore.setHovered(null);
  }, []);

  const handleFocus = useCallback((itemId: number) => {
    const { dragState } = timelineStore.getState();
    if (dragState.item !== null) return;
    timelineStore.setHovered(itemId);
  }, []);

  const handleBlur = useCallback(() => {
    timelineStore.setHovered(null);
  }, []);

  const handleItemDoubleClick = useCallback(
    (item: TimelineItemInternal) => handleItemDoubleClickOriginal(toApiItem(item)),
    [handleItemDoubleClickOriginal, toApiItem]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, itemId: number, type: "move" | "resize-start" | "resize-end") => {
      const item = itemMapRef.current.get(itemId);
      if (!item) return;
      const state = timelineStore.getState();
      if (state.editingId === itemId) return;
      if (type === "move" && (e.target as HTMLElement).closest(".item-resize-handle")) return;
      handleDragMouseDown(e, item, type);
    },
    [handleDragMouseDown]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, itemId: number) => {
      handleMouseDown(e, itemId, "resize-start");
    },
    [handleMouseDown]
  );

  const handleResizeEnd = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, itemId: number) => {
      handleMouseDown(e, itemId, "resize-end");
    },
    [handleMouseDown]
  );

  const handleKeyDown = useCallback(
    (itemId: number) => {
      const item = itemMapRef.current.get(itemId);
      if (item) {
        handleItemDoubleClick(item);
      }
    },
    [handleItemDoubleClick]
  );

  const handleItemNameMouseEnterWrapper = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>, item: TimelineItemInternal) => {
      handleItemNameMouseEnter(e, toApiItem(item));
    },
    [handleItemNameMouseEnter, toApiItem]
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key === "=") {
        e.preventDefault();
        setZoomLevel((prev) => Math.min(prev + TIMELINE_CONFIG.ZOOM_STEP, TIMELINE_CONFIG.MAX_ZOOM));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setZoomLevel((prev) => Math.max(prev - TIMELINE_CONFIG.ZOOM_STEP, TIMELINE_CONFIG.MIN_ZOOM));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setZoomLevel(1);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + TIMELINE_CONFIG.ZOOM_STEP, TIMELINE_CONFIG.MAX_ZOOM));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - TIMELINE_CONFIG.ZOOM_STEP, TIMELINE_CONFIG.MIN_ZOOM));
  const resetZoom = () => setZoomLevel(1);

  const dateLabels = useMemo((): DateLabel[] => {
    if (!viewStartDate || !viewEndDate) return [];
    const dateLabelStep = Math.max(1, Math.floor(totalDays / TIMELINE_CONFIG.DATE_LABEL_STEP_DIVISOR));
    const labels: DateLabel[] = [];
    const current = new Date(viewStartDate);
    const end = new Date(viewEndDate);
    let dayCount = 0;
    while (current <= end && dayCount < TIMELINE_CONFIG.MAX_DATE_LABELS) {
      labels.push({
        date: new Date(current),
        position: dateToPosition(current, viewStartDate, pixelsPerDay),
      });
      current.setTime(current.getTime() + dateLabelStep * MS_PER_DAY);
      dayCount++;
    }
    return labels;
  }, [viewStartDate, viewEndDate, totalDays, pixelsPerDay]);

  const getItemColor = (itemId: number): string =>
    COLOR_PALETTE[Math.max(0, itemId - 1) % COLOR_PALETTE.length];

  const itemLayoutMap = useMemo((): Map<number, ItemLayout> => {
    const map = new Map<number, ItemLayout>();
    internalItems.forEach((item) => {
      map.set(item.id, {
        left: dateToPosition(item.start, viewStartDate, pixelsPerDay),
        width: getItemWidth(item, pixelsPerDay),
        days: itemDaysMap.get(item.id) ?? getDaysBetween(item.start, item.end),
        itemColor: getItemColor(item.id),
      });
    });
    return map;
  }, [internalItems, viewStartDate, pixelsPerDay, itemDaysMap]);

  const handlersContextValue = useMemo(
    () => ({
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onItemDoubleClick: handleItemDoubleClick,
      onNameChange: handleNameChangeOriginal,
      onNameSubmit: handleNameSubmitOriginal,
      onNameKeyDown: handleNameKeyDownOriginal,
      onMouseDown: handleMouseDown,
      onResizeStart: handleResizeStart,
      onResizeEnd: handleResizeEnd,
      onKeyDown: handleKeyDown,
      onItemNameMouseEnter: handleItemNameMouseEnterWrapper,
      onItemNameMouseLeave: handleItemNameMouseLeave,
    }),
    [
      handleMouseEnter,
      handleMouseLeave,
      handleFocus,
      handleBlur,
      handleItemDoubleClick,
      handleNameChangeOriginal,
      handleNameSubmitOriginal,
      handleNameKeyDownOriginal,
      handleMouseDown,
      handleResizeStart,
      handleResizeEnd,
      handleKeyDown,
      handleItemNameMouseEnterWrapper,
      handleItemNameMouseLeave,
    ]
  );

  return (
    <TimelineHandlersProvider value={handlersContextValue}>
      <div className="timeline-container" role="region" aria-label="Timeline visualization">
        <div className="timeline-controls" role="toolbar" aria-label="Timeline controls">
          <div className="zoom-controls">
            <button onClick={zoomOut} className="zoom-btn" aria-label="Zoom out" aria-keyshortcuts="Control+-">
              <span aria-hidden="true">−</span>
            </button>
            <span className="zoom-level" aria-live="polite" aria-atomic="true">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button onClick={zoomIn} className="zoom-btn" aria-label="Zoom in" aria-keyshortcuts="Control++">
              <span aria-hidden="true">+</span>
            </button>
            <button onClick={resetZoom} className="reset-zoom-btn" aria-label="Reset zoom to 100%">
              Reset
            </button>
          </div>
          <div className="date-range" aria-label="Date range">
            {viewStartDate && viewEndDate && (
              <time dateTime={`${formatDate(viewStartDate)}/${formatDate(viewEndDate)}`}>
                {viewStartDate.toLocaleDateString()} - {viewEndDate.toLocaleDateString()}
              </time>
            )}
          </div>
        </div>

        <div className="timeline-wrapper" ref={timelineRef} role="application" aria-label="Interactive timeline">
          <TimelineView
            timelineWidth={timelineWidth}
            dateLabels={dateLabels}
            lanes={lanes}
            itemLayoutMap={itemLayoutMap}
            tooltipItem={tooltipItem}
            tooltipPosition={tooltipPosition}
          />
        </div>
      </div>
    </TimelineHandlersProvider>
  );
}

export function TimelineContainer(props: TimelineContainerProps) {
  return <TimelineGuard {...props} />;
}
