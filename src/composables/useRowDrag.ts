import { ref, readonly, type Ref } from "vue";
import type { GroupedListItem, GroupHeaderItem } from "./useTableGroup";

export interface UseRowDragOptions<T> {
  /** The flattened items list (with group headers) */
  processedItems: Ref<GroupedListItem<T>[]>;
  /** Whether cross-group drag is allowed */
  enableCrossGroupDrag?: Ref<boolean>;
  /** The field id used for grouping (needed for cross-group value update) */
  groupFieldId?: Ref<string | undefined>;
}

export interface RowReorderPayload {
  rowId: string;
  beforeRowId: string | null;
}

export interface RowGroupChangePayload {
  rowId: string;
  groupFieldId: string;
  newValue: unknown;
}

type RowDragItem<T> = T | GroupedListItem<T>;

export function useRowDrag<T extends Record<string, unknown>>(options: UseRowDragOptions<T>) {
  const isDragging = ref(false);
  const draggedRowId = ref<string | null>(null);
  const dropTargetId = ref<string | null>(null);
  const dropPosition = ref<"before" | "after" | "into-group">("before");

  let draggedItem: T | null = null;

  function isGroupHeader(item: unknown): item is GroupHeaderItem {
    return (
      typeof item === "object" &&
      item !== null &&
      "__type" in item &&
      item.__type === "group-header"
    );
  }

  function getRowId(row: { id?: unknown }): string {
    return String((row as Record<string, unknown>).id ?? "");
  }

  function handleDragStart(e: DragEvent, item: RowDragItem<T>) {
    if (isGroupHeader(item)) {
      e.preventDefault();
      return;
    }

    draggedItem = item as T;
    draggedRowId.value = getRowId(item as T);
    isDragging.value = true;

    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", draggedRowId.value);
    }
  }

  function handleDragOver(e: DragEvent, targetItem: RowDragItem<T>) {
    e.preventDefault();

    if (!draggedItem) return;

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }

    if (isGroupHeader(targetItem)) {
      // Dragging over a group header → cross-group move
      if (options.enableCrossGroupDrag?.value) {
        dropTargetId.value = targetItem.id;
        dropPosition.value = "into-group";
      }
      return;
    }

    const target = e.currentTarget as HTMLElement;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const isTopHalf = relativeY < rect.height / 2;

    dropTargetId.value = getRowId(targetItem as T);
    dropPosition.value = isTopHalf ? "before" : "after";
  }

  function handleDrop(
    e: DragEvent,
    targetItem: RowDragItem<T>,
    callbacks: {
      onReorder?: (payload: RowReorderPayload) => void;
      onGroupChange?: (payload: RowGroupChangePayload) => void;
    },
  ) {
    e.preventDefault();

    if (!draggedItem || !draggedRowId.value) {
      cleanup();
      return;
    }

    const sourceId = draggedRowId.value;

    if (isGroupHeader(targetItem)) {
      // Cross-group drop
      const groupFieldId = options.groupFieldId?.value;
      if (groupFieldId && options.enableCrossGroupDrag?.value) {
        callbacks.onGroupChange?.({
          rowId: sourceId,
          groupFieldId,
          newValue: targetItem.__groupKey,
        });
      }
    } else {
      // Same-level reorder
      const targetId = getRowId(targetItem as T);
      if (sourceId !== targetId) {
        callbacks.onReorder?.({
          rowId: sourceId,
          beforeRowId: dropPosition.value === "before" ? targetId : getNextRowId(targetId),
        });
      }
    }

    cleanup();
  }

  function handleDragEnd() {
    cleanup();
  }

  function getNextRowId(currentId: string): string | null {
    const items = options.processedItems.value;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!isGroupHeader(item) && getRowId(item as T) === currentId) {
        // Find next data row
        for (let j = i + 1; j < items.length; j++) {
          if (!isGroupHeader(items[j])) {
            return getRowId(items[j] as T);
          }
        }
        return null;
      }
    }
    return null;
  }

  function cleanup() {
    isDragging.value = false;
    draggedRowId.value = null;
    dropTargetId.value = null;
    draggedItem = null;
  }

  return {
    isDragging: readonly(isDragging),
    draggedRowId: readonly(draggedRowId),
    dropTargetId: readonly(dropTargetId),
    dropPosition: readonly(dropPosition),
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
}
