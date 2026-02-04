import { useRef, useCallback, useEffect } from "react";
import { timelineStore } from "../store/TimelineStateStore";
import { formatDate } from "../utils/dateUtils";
import { MS_PER_DAY } from "../constants";
import type { TimelineItem, TimelineItemInternal, DragState, ItemUpdateCallback } from "../types";

export function useDragAndDrop(
  pixelsPerDay: number,
  onItemUpdate: ItemUpdateCallback | undefined
) {
  const pixelsPerDayRef = useRef(pixelsPerDay);
  const onItemUpdateRef = useRef(onItemUpdate);

  useEffect(() => {
    pixelsPerDayRef.current = pixelsPerDay;
    onItemUpdateRef.current = onItemUpdate;
  }, [pixelsPerDay, onItemUpdate]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const currentDragState = timelineStore.getState().dragState;
    if (!currentDragState.item || !currentDragState.type || !currentDragState.original) return;

    const deltaX = e.clientX - currentDragState.startX;
    const deltaDays = Math.round(deltaX / pixelsPerDayRef.current);

    if (deltaDays === 0) return;

    const currentStart = new Date(currentDragState.original.start);
    const currentEnd = new Date(currentDragState.original.end);

    let newStart = currentStart;
    let newEnd = currentEnd;

    if (currentDragState.type === "move") {
      newStart = new Date(currentStart.getTime() + deltaDays * MS_PER_DAY);
      newEnd = new Date(currentEnd.getTime() + deltaDays * MS_PER_DAY);
    } else if (currentDragState.type === "resize-start") {
      newStart = new Date(currentStart.getTime() + deltaDays * MS_PER_DAY);
      if (newStart > currentEnd) {
        newStart = currentEnd;
      }
    } else if (currentDragState.type === "resize-end") {
      newEnd = new Date(currentEnd.getTime() + deltaDays * MS_PER_DAY);
      if (newEnd < currentStart) {
        newEnd = currentStart;
      }
    }

    const updateCallback = onItemUpdateRef.current;
    if (updateCallback) {
      const original = currentDragState.original!;
      const updatedItem: TimelineItem = {
        id: original.id,
        name: original.name,
        start: formatDate(newStart),
        end: formatDate(newEnd),
      };
      updateCallback(updatedItem);

      const newDragState: DragState = { ...currentDragState, item: updatedItem };
      timelineStore.setDragState(newDragState);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    const emptyState: DragState = {
      item: null,
      type: null,
      startX: 0,
      original: null,
    };
    timelineStore.setDragState(emptyState);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, item: TimelineItem | TimelineItemInternal, type: "move" | "resize-start" | "resize-end") => {
      e.preventDefault();
      e.stopPropagation();
      const dragState: DragState = {
        item,
        type,
        startX: e.clientX,
        original: item,
      };
      timelineStore.setDragState(dragState);
    },
    []
  );

  const isListeningRef = useRef(false);

  useEffect(() => {
    const unsubscribe = timelineStore.subscribe(() => {
      const state = timelineStore.getState();
      const dragState = state.dragState;

      if (dragState.item === null && isListeningRef.current) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        isListeningRef.current = false;
      } else if (dragState.item !== null && !isListeningRef.current) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        isListeningRef.current = true;
      }
    });

    const state = timelineStore.getState();
    if (state.dragState.item !== null) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      isListeningRef.current = true;
    }

    return () => {
      unsubscribe();
      if (isListeningRef.current) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    handleMouseDown,
  };
}
