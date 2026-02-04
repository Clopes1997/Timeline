import { useState, useCallback, useEffect, RefObject } from "react";
import { timelineStore, useTimelineSelector } from "../store/TimelineStateStore";
import type { TimelineItem } from "../types";

export function useTooltip(timelineRef: RefObject<HTMLDivElement>) {
  const [tooltipItem, setTooltipItem] = useState<TimelineItem | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const checkTruncation = useCallback((element: HTMLElement | null): boolean => {
    if (!element) return false;
    return element.scrollWidth > element.clientWidth;
  }, []);

  const handleItemNameMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLElement>, item: TimelineItem) => {
      const state = timelineStore.getState();
      if (state.editingId === item.id) return;
      const nameElement = e.currentTarget;
      if (checkTruncation(nameElement)) {
        const rect = nameElement.getBoundingClientRect();
        const timelineRect = timelineRef.current?.getBoundingClientRect();
        if (timelineRect) {
          setTooltipPosition({
            top: rect.top - timelineRect.top - 8,
            left: rect.left - timelineRect.left + rect.width / 2,
          });
          setTooltipItem(item);
        }
      }
    },
    [checkTruncation, timelineRef]
  );

  const handleItemNameMouseLeave = useCallback(() => {
    setTooltipItem(null);
  }, []);

  const editingId = useTimelineSelector((s) => s.editingId);

  useEffect(() => {
    if (editingId !== null) {
      setTooltipItem(null);
    }
  }, [editingId]);

  return {
    tooltipItem,
    tooltipPosition,
    handleItemNameMouseEnter,
    handleItemNameMouseLeave,
  };
}
