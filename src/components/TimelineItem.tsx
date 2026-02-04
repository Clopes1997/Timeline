import { memo, useMemo, useCallback } from "react";
import { useTimelineHandlers } from "../context/TimelineHandlersContext";
import { useTimelineSelector } from "../store/TimelineStateStore";
import { formatDate } from "../utils/dateUtils";
import type { TimelineItemInternal } from "../types";

export interface TimelineItemProps {
  item: TimelineItemInternal;
  left: number;
  width: number;
  days: number;
  itemColor: string;
}

/**
 * Properly typed CSS properties with custom property support
 */
type CSSVars = React.CSSProperties & {
  "--item-color": string;
};

function TimelineItemInner({ item, left, width, days, itemColor }: TimelineItemProps) {
  const handlers = useTimelineHandlers();
  // Subscribe only to this item's state slice - no re-render when other items change
  const isEditing = useTimelineSelector((s) => s.editingId === item.id);
  const isHovered = useTimelineSelector((s) => s.hoveredId === item.id);
  const isDragging = useTimelineSelector((s) => s.dragState.item?.id === item.id);
  const editName = useTimelineSelector((s) =>
    s.editingId === item.id ? s.editName : ""
  );

  // Stable callbacks using useMemo/useCallback to prevent memoization leaks
  const onDoubleClick = useMemo(
    () => () => handlers.onItemDoubleClick(item),
    [handlers, item]
  );

  const onMouseEnter = useMemo(
    () => () => handlers.onMouseEnter(item.id),
    [handlers, item.id]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => handlers.onMouseDown(e, item.id, "move"),
    [handlers, item.id]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handlers.onKeyDown(item.id);
      }
    },
    [handlers, item.id]
  );

  const onFocus = useMemo(
    () => () => handlers.onFocus(item.id),
    [handlers, item.id]
  );

  const onNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => handlers.onNameChange(e.target.value),
    [handlers]
  );

  const onNameBlur = useMemo(
    () => () => handlers.onNameSubmit(item.id),
    [handlers, item.id]
  );

  const onNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => handlers.onNameKeyDown(e, item.id),
    [handlers, item.id]
  );

  const onResizeStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => handlers.onResizeStart(e, item.id),
    [handlers, item.id]
  );

  const onResizeEnd = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => handlers.onResizeEnd(e, item.id),
    [handlers, item.id]
  );

  const onItemNameMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => handlers.onItemNameMouseEnter(e, item),
    [handlers, item]
  );

  return (
    <div
      className={`timeline-item ${isHovered ? "hovered" : ""} ${isDragging ? "dragging" : ""}`}
      style={
        {
          left: `${left}px`,
          width: `${width}px`,
          "--item-color": itemColor,
        } as CSSVars
      }
      data-item-color={itemColor}
      role="button"
      tabIndex={0}
      aria-label={`${item.name}, ${days} ${days === 1 ? "day" : "days"}, from ${formatDate(item.start)} to ${formatDate(item.end)}`}
      aria-describedby={`item-${item.id}-description`}
      onDoubleClick={onDoubleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handlers.onMouseLeave}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={handlers.onBlur}
    >
      <span id={`item-${item.id}-description`} className="sr-only">
        Double click to edit name, drag to move, drag edges to resize
      </span>
      {isEditing ? (
        <input
          id={`item-${item.id}-input`}
          type="text"
          value={editName}
          onChange={onNameChange}
          onBlur={onNameBlur}
          onKeyDown={onNameKeyDown}
          className="item-name-input"
          autoFocus
          onClick={(e) => e.stopPropagation()}
          aria-label="Edit item name"
        />
      ) : (
        <>
          <div
            className="item-resize-handle item-resize-start"
            onMouseDown={onResizeStart}
            role="button"
            aria-label="Resize start date"
            tabIndex={-1}
          />
          <div className="item-content">
            <div className="item-header">
              <span
                className="item-name"
                onMouseEnter={onItemNameMouseEnter}
                onMouseLeave={handlers.onItemNameMouseLeave}
              >
                {item.name}
              </span>
              <span className="item-color-badge" style={{ backgroundColor: itemColor }} aria-hidden="true" />
            </div>
            <span className="item-duration">
              {days} {days === 1 ? "day" : "days"}
            </span>
          </div>
          <div
            className="item-resize-handle item-resize-end"
            onMouseDown={onResizeEnd}
            role="button"
            aria-label="Resize end date"
            tabIndex={-1}
          />
        </>
      )}
    </div>
  );
}

const TimelineItem = memo(TimelineItemInner);
TimelineItem.displayName = "TimelineItem";

export default TimelineItem;
