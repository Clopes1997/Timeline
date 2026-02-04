import { useCallback } from "react";
import { timelineStore } from "../store/TimelineStateStore";
import type { TimelineItem, ItemUpdateCallback } from "../types";

/**
 * Custom hook for item editing functionality.
 * Writes directly to TimelineStateStore - no local state, no sync effects.
 */
export function useItemEditing(
  onItemUpdate: ItemUpdateCallback | undefined,
  validItems: TimelineItem[]
) {
  const handleItemDoubleClick = useCallback(
    (item: TimelineItem) => {
      timelineStore.setEditing(item.id, item.name);
    },
    []
  );

  const handleNameChange = useCallback((value: string) => {
    const state = timelineStore.getState();
    if (state.editingId !== null) {
      timelineStore.setEditing(state.editingId, value);
    }
  }, []);

  const handleNameSubmit = useCallback(
    (itemId: number) => {
      const state = timelineStore.getState();
      const editName = state.editName;

      if (!onItemUpdate || !editName.trim()) {
        timelineStore.setEditing(null, "");
        return;
      }

      // Use validItems instead of items to ensure data consistency
      const item = validItems.find((i) => i.id === itemId);
      if (!item) {
        timelineStore.setEditing(null, "");
        return;
      }

      onItemUpdate({
        ...item,
        name: editName.trim(),
      });
      timelineStore.setEditing(null, "");
    },
    [onItemUpdate, validItems]
  );

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, itemId: number) => {
      if (e.key === "Enter") {
        handleNameSubmit(itemId);
      } else if (e.key === "Escape") {
        timelineStore.setEditing(null, "");
      }
    },
    [handleNameSubmit]
  );

  return {
    handleItemDoubleClick,
    handleNameChange,
    handleNameSubmit,
    handleNameKeyDown,
  };
}
