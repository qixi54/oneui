import { ref, readonly, type Ref } from "vue";
import type { ActiveCell, TableColumn } from "../types";
import type { EditingCell } from "./useInlineEdit";

export interface UseKeyboardNavigationOptions {
  columns: Ref<TableColumn[]>;
  rows: Ref<Array<{ id: string } & Record<string, unknown>>>;
  containerRef: Ref<HTMLElement | null>;
  editingCell: Ref<EditingCell | null>;
  enabled: Ref<boolean>;
  /** Callback to activate inline edit on a cell */
  onActivateEdit?: (rowId: string, colKey: string) => void;
  /** Callback to cancel inline edit */
  onCancelEdit?: () => void;
  /** Callback to scroll a row into view */
  onScrollToRow?: (rowIndex: number) => void;
  /** Callback to get cell text value for copy (optional, enables Ctrl+C) */
  getCellValue?: (rowId: string, colKey: string) => string;
  /** Callback when paste data is received (optional, enables Ctrl+V) */
  onPaste?: (startRowId: string, startColKey: string, data: string[][]) => void;
}

export interface SelectedCell {
  rowId: string;
  colKey: string;
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions) {
  const activeCell = ref<ActiveCell | null>(null);
  const selectionAnchor = ref<SelectedCell | null>(null);
  const selectedRange = ref<SelectedCell[]>([]);

  function setActiveCell(rowId: string, colKey: string) {
    activeCell.value = { rowId, colKey };
    // Clear selection when clicking a cell directly
    selectionAnchor.value = null;
    selectedRange.value = [];
  }

  function clearActiveCell() {
    activeCell.value = null;
    selectionAnchor.value = null;
    selectedRange.value = [];
  }

  function getVisibleColumns(): TableColumn[] {
    return options.columns.value.filter((c) => !c.hidden);
  }

  /** Compute rectangular selection between anchor and current cell */
  function computeRectSelection(anchor: SelectedCell, current: SelectedCell): SelectedCell[] {
    const rows = options.rows.value;
    const cols = getVisibleColumns();

    const anchorRowIdx = rows.findIndex((r) => r.id === anchor.rowId);
    const anchorColIdx = cols.findIndex((c) => c.key === anchor.colKey);
    const currentRowIdx = rows.findIndex((r) => r.id === current.rowId);
    const currentColIdx = cols.findIndex((c) => c.key === current.colKey);

    if (
      anchorRowIdx === -1 ||
      anchorColIdx === -1 ||
      currentRowIdx === -1 ||
      currentColIdx === -1
    ) {
      return [];
    }

    const minRow = Math.min(anchorRowIdx, currentRowIdx);
    const maxRow = Math.max(anchorRowIdx, currentRowIdx);
    const minCol = Math.min(anchorColIdx, currentColIdx);
    const maxCol = Math.max(anchorColIdx, currentColIdx);

    const cells: SelectedCell[] = [];
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        cells.push({ rowId: rows[r].id, colKey: cols[c].key });
      }
    }
    return cells;
  }

  /** Copy selected cells (or active cell) to clipboard as TSV */
  async function copySelection() {
    if (!options.getCellValue) return;

    const cells =
      selectedRange.value.length > 0
        ? selectedRange.value
        : activeCell.value
          ? [activeCell.value]
          : [];
    if (cells.length === 0) return;

    const rows = options.rows.value;
    const cols = getVisibleColumns();

    // Determine bounding box
    const rowIds = [...new Set(cells.map((c) => c.rowId))];
    const colKeys = [...new Set(cells.map((c) => c.colKey))];

    // Sort by original order
    const sortedRowIds = rowIds.sort((a, b) => {
      return rows.findIndex((r) => r.id === a) - rows.findIndex((r) => r.id === b);
    });
    const sortedColKeys = colKeys.sort((a, b) => {
      return cols.findIndex((c) => c.key === a) - cols.findIndex((c) => c.key === b);
    });

    const cellSet = new Set(cells.map((c) => `${c.rowId}:${c.colKey}`));
    const tsvLines: string[] = [];

    for (const rowId of sortedRowIds) {
      const rowValues: string[] = [];
      for (const colKey of sortedColKeys) {
        if (cellSet.has(`${rowId}:${colKey}`)) {
          rowValues.push(options.getCellValue(rowId, colKey));
        } else {
          rowValues.push("");
        }
      }
      tsvLines.push(rowValues.join("\t"));
    }

    const text = tsvLines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API may fail in non-secure contexts; silently ignore
    }
  }

  /** Paste TSV data from clipboard starting at activeCell */
  async function pasteSelection() {
    if (!options.onPaste || !activeCell.value) return;

    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      return;
    }

    if (!text) return;

    // Parse TSV: split by newlines, then by tabs
    const data = text
      .split(/\r?\n/)
      .filter((line) => line.length > 0)
      .map((line) => line.split("\t"));

    if (data.length === 0) return;

    options.onPaste(activeCell.value.rowId, activeCell.value.colKey, data);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!options.enabled.value) return;

    const isEditing = options.editingCell.value !== null;

    // When editing, only handle Escape and Tab
    if (isEditing) {
      if (e.key === "Escape") {
        e.preventDefault();
        options.onCancelEdit?.();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        options.onCancelEdit?.();
        moveToNextCell(e.shiftKey);
        return;
      }
      return; // Let other keys pass through to the editor
    }

    // Handle Ctrl+C / Cmd+C
    if ((e.ctrlKey || e.metaKey) && e.key === "c") {
      e.preventDefault();
      copySelection();
      return;
    }

    // Handle Ctrl+V / Cmd+V
    if ((e.ctrlKey || e.metaKey) && e.key === "v") {
      e.preventDefault();
      pasteSelection();
      return;
    }

    // When not editing
    if (!activeCell.value) {
      // Set initial focus to first cell on any arrow key
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const rows = options.rows.value;
        const cols = getVisibleColumns();
        if (rows.length > 0 && cols.length > 0) {
          setActiveCell(rows[0].id, cols[0].key);
        }
      }
      return;
    }

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        moveVertical(-1, e.shiftKey);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveVertical(1, e.shiftKey);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveHorizontal(-1, e.shiftKey);
        break;
      case "ArrowRight":
        e.preventDefault();
        moveHorizontal(1, e.shiftKey);
        break;
      case "Enter":
        e.preventDefault();
        if (activeCell.value) {
          options.onActivateEdit?.(activeCell.value.rowId, activeCell.value.colKey);
        }
        break;
      case "Escape":
        e.preventDefault();
        clearActiveCell();
        break;
      case "Tab":
        e.preventDefault();
        moveToNextCell(e.shiftKey);
        break;
    }
  }

  function moveVertical(delta: number, withShift = false) {
    if (!activeCell.value) return;
    const rows = options.rows.value;
    const currentRowIndex = rows.findIndex((r) => r.id === activeCell.value!.rowId);
    if (currentRowIndex === -1) return;

    const newIndex = currentRowIndex + delta;
    if (newIndex < 0 || newIndex >= rows.length) return;

    if (withShift) {
      // Initialize anchor on first shift-move
      if (!selectionAnchor.value) {
        selectionAnchor.value = { rowId: activeCell.value.rowId, colKey: activeCell.value.colKey };
      }
      activeCell.value = { rowId: rows[newIndex].id, colKey: activeCell.value.colKey };
      selectedRange.value = computeRectSelection(selectionAnchor.value, activeCell.value);
    } else {
      selectionAnchor.value = null;
      selectedRange.value = [];
      activeCell.value = { rowId: rows[newIndex].id, colKey: activeCell.value.colKey };
    }
    options.onScrollToRow?.(newIndex);
  }

  function moveHorizontal(delta: number, withShift = false) {
    if (!activeCell.value) return;
    const cols = getVisibleColumns();
    const currentColIndex = cols.findIndex((c) => c.key === activeCell.value!.colKey);
    if (currentColIndex === -1) return;

    const newIndex = currentColIndex + delta;
    if (newIndex < 0 || newIndex >= cols.length) return;

    if (withShift) {
      if (!selectionAnchor.value) {
        selectionAnchor.value = { rowId: activeCell.value.rowId, colKey: activeCell.value.colKey };
      }
      activeCell.value = { rowId: activeCell.value.rowId, colKey: cols[newIndex].key };
      selectedRange.value = computeRectSelection(selectionAnchor.value, activeCell.value);
    } else {
      selectionAnchor.value = null;
      selectedRange.value = [];
      activeCell.value = { rowId: activeCell.value.rowId, colKey: cols[newIndex].key };
    }
  }

  function moveToNextCell(backwards: boolean) {
    if (!activeCell.value) return;

    const rows = options.rows.value;
    const cols = getVisibleColumns();
    const rowIdx = rows.findIndex((r) => r.id === activeCell.value!.rowId);
    const colIdx = cols.findIndex((c) => c.key === activeCell.value!.colKey);

    if (rowIdx === -1 || colIdx === -1) return;

    let newColIdx = colIdx + (backwards ? -1 : 1);
    let newRowIdx = rowIdx;

    if (newColIdx >= cols.length) {
      newColIdx = 0;
      newRowIdx++;
    } else if (newColIdx < 0) {
      newColIdx = cols.length - 1;
      newRowIdx--;
    }

    if (newRowIdx < 0 || newRowIdx >= rows.length) return;

    activeCell.value = { rowId: rows[newRowIdx].id, colKey: cols[newColIdx].key };
    selectionAnchor.value = null;
    selectedRange.value = [];
    options.onScrollToRow?.(newRowIdx);
  }

  return {
    activeCell: readonly(activeCell),
    selectedRange: readonly(selectedRange),
    setActiveCell,
    clearActiveCell,
    handleKeyDown,
  };
}
