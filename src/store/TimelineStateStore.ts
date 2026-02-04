import { useSyncExternalStore } from "react";
import type { DragState } from "../types";

/**
 * Timeline state that changes frequently per item.
 * Moved out of Context to prevent global re-renders.
 */
export interface TimelineState {
  hoveredId: number | null;
  editingId: number | null;
  editName: string;
  dragState: DragState;
}

type Listener = () => void;
type Selector<T> = (state: TimelineState) => T;

class TimelineStateStore {
  private state: TimelineState = {
    hoveredId: null,
    editingId: null,
    editName: "",
    dragState: {
      item: null,
      type: null,
      startX: 0,
      original: null,
    },
  };

  private listeners = new Set<Listener>();

  getState(): TimelineState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  setHovered(id: number | null): void {
    if (this.state.hoveredId === id) return;
    this.state = { ...this.state, hoveredId: id };
    this.notify();
  }

  setEditing(id: number | null, name: string = ""): void {
    if (this.state.editingId === id && this.state.editName === name) return;
    this.state = { ...this.state, editingId: id, editName: name };
    this.notify();
  }

  setDragState(dragState: DragState): void {
    const currentItemId = this.state.dragState.item?.id ?? null;
    const newItemId = dragState.item?.id ?? null;
    
    if (
      currentItemId === newItemId &&
      this.state.dragState.type === dragState.type &&
      this.state.dragState.original?.id === dragState.original?.id
    ) {
      return;
    }
    this.state = { ...this.state, dragState };
    this.notify();
  }
}

const store = new TimelineStateStore();

/**
 * Hook to subscribe to a specific slice of timeline state.
 * Only re-renders when the selected value changes.
 *
 * @example
 * const isHovered = useTimelineSelector(s => s.hoveredId === item.id)
 * const isEditing = useTimelineSelector(s => s.editingId === item.id)
 */
export function useTimelineSelector<T>(selector: Selector<T>): T {
  return useSyncExternalStore(
    store.subscribe.bind(store),
    () => selector(store.getState()),
    () => selector(store.getState()) // SSR fallback
  );
}

export const timelineStore = {
  setHovered: store.setHovered.bind(store),
  setEditing: store.setEditing.bind(store),
  setDragState: store.setDragState.bind(store),
  getState: store.getState.bind(store),
  subscribe: store.subscribe.bind(store),
};
