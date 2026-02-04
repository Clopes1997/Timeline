import { createContext, useContext, type ReactNode } from "react";
import type { TimelineItemInternal } from "../types";

/**
 * Stable handlers context - these callbacks never change.
 * They update the store directly, avoiding context re-renders.
 */
export interface TimelineHandlersContextValue {
  // Item interaction handlers (accept explicit itemId)
  onMouseEnter: (itemId: number) => void;
  onMouseLeave: () => void;
  onFocus: (itemId: number) => void;
  onBlur: () => void;
  // Edit handlers
  onItemDoubleClick: (item: TimelineItemInternal) => void;
  onNameChange: (value: string) => void;
  onNameSubmit: (itemId: number) => void;
  onNameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, itemId: number) => void;
  // Drag handlers (accept explicit itemId, type, and event for clientX)
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>, itemId: number, type: "move" | "resize-start" | "resize-end") => void;
  onResizeStart: (e: React.MouseEvent<HTMLDivElement>, itemId: number) => void;
  onResizeEnd: (e: React.MouseEvent<HTMLDivElement>, itemId: number) => void;
  // Keyboard handler
  onKeyDown: (itemId: number) => void;
  // Tooltip handlers (need event for getBoundingClientRect)
  onItemNameMouseEnter: (e: React.MouseEvent<HTMLSpanElement>, item: TimelineItemInternal) => void;
  onItemNameMouseLeave: () => void;
}

const TimelineHandlersContext = createContext<TimelineHandlersContextValue | null>(null);

export function TimelineHandlersProvider({
  value,
  children,
}: {
  value: TimelineHandlersContextValue;
  children: ReactNode;
}) {
  return (
    <TimelineHandlersContext.Provider value={value}>{children}</TimelineHandlersContext.Provider>
  );
}

export function useTimelineHandlers(): TimelineHandlersContextValue {
  const ctx = useContext(TimelineHandlersContext);
  if (!ctx) throw new Error("useTimelineHandlers must be used within TimelineHandlersProvider");
  return ctx;
}
