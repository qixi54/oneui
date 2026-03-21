import { ref, readonly, onUnmounted, type Ref } from "vue";
import type { Density, TableColumn } from "../types";
import type { ColumnResizeState } from "../types/table-internal";

export interface UseColumnResizeOptions {
  columns: Ref<TableColumn[]>;
  rows?: Ref<ReadonlyArray<Record<string, unknown>>>;
  density?: Ref<Density>;
  sampleSize?: number;
  /** Minimum column width in px (default 60) */
  minWidth?: number;
  /** Called on every mousemove during resize */
  onResize?: (colKey: string, newWidth: number) => void;
}

const DENSITY_WIDTH_CONFIG: Record<
  Density,
  {
    fillMinWidth: number;
    basePadding: number;
    labelPadding: number;
    autoFitPadding: number;
    clampMax: number;
  }
> = {
  compact: {
    fillMinWidth: 180,
    basePadding: 18,
    labelPadding: 22,
    autoFitPadding: 18,
    clampMax: 360,
  },
  standard: {
    fillMinWidth: 220,
    basePadding: 24,
    labelPadding: 26,
    autoFitPadding: 24,
    clampMax: 420,
  },
  comfortable: {
    fillMinWidth: 240,
    basePadding: 28,
    labelPadding: 30,
    autoFitPadding: 30,
    clampMax: 480,
  },
};

const COLUMN_TYPE_WIDTH: Record<NonNullable<TableColumn["type"]>, number> = {
  string: 180,
  number: 110,
  date: 140,
  status: 124,
  priority: 124,
};

function getDensityKey(density?: Density): Density {
  return density ?? "standard";
}

function normalizeCellText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((item) => normalizeCellText(item)).join(", ");
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function estimateTextWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    width += char.charCodeAt(0) <= 0x7f ? 7 : 14;
  }
  return width;
}

function inferColumnWidth(
  col: TableColumn,
  rows: ReadonlyArray<Record<string, unknown>>,
  density: Density,
  sampleSize: number,
): number {
  const densityConfig = DENSITY_WIDTH_CONFIG[density];
  const typeBase = col.type ? COLUMN_TYPE_WIDTH[col.type as NonNullable<TableColumn["type"]>] : 168;
  const titleWidth = estimateTextWidth(col.label) + densityConfig.labelPadding;
  const samples = rows.slice(0, Math.max(1, sampleSize));

  let sampleWidth = 0;
  for (const row of samples) {
    const text = normalizeCellText(row[col.key]);
    if (!text) continue;
    sampleWidth = Math.max(sampleWidth, estimateTextWidth(text) + densityConfig.basePadding);
  }

  const keyFallback =
    col.key === "id"
      ? 120
      : col.key === "title"
        ? 220
        : col.key === "description"
          ? 260
          : 0;

  const fallback = Math.max(typeBase, titleWidth, sampleWidth, keyFallback, densityConfig.fillMinWidth);
  return Math.min(Math.max(fallback, densityConfig.fillMinWidth), densityConfig.clampMax);
}

export function useColumnResize(options: UseColumnResizeOptions) {
  const minWidth = options.minWidth ?? 60;
  const isResizing = ref(false);
  const resizingColumn = ref<string | null>(null);
  const columnWidthOverrides = ref(new Map<string, number>());

  /** Visual resize indicator line element */
  const resizeIndicatorX = ref(0);
  const showResizeIndicator = ref(false);

  let state: ColumnResizeState | null = null;
  let savedCursor = "";
  let savedUserSelect = "";

  function getColumnWidth(colKey: string): number {
    if (columnWidthOverrides.value.has(colKey)) {
      return columnWidthOverrides.value.get(colKey)!;
    }
    const col = options.columns.value.find((c) => c.key === colKey);
    const density = getDensityKey(options.density?.value);
    const densityConfig = DENSITY_WIDTH_CONFIG[density];
    if (!col) return densityConfig.fillMinWidth;
    if (col.width === "fill") return col.minWidth ?? densityConfig.fillMinWidth;
    if (typeof col.width === "number") return col.width;
    return inferColumnWidth(
      col,
      options.rows?.value ?? [],
      density,
      options.sampleSize ?? 8,
    );
  }

  function handleMouseMove(e: MouseEvent) {
    if (!state) return;
    const deltaX = e.clientX - state.startX;
    const newWidth = Math.max(minWidth, state.initialWidth + deltaX);
    const next = new Map(columnWidthOverrides.value);
    next.set(state.colKey, newWidth);
    columnWidthOverrides.value = next;
    resizeIndicatorX.value = e.clientX;
    options.onResize?.(state.colKey, newWidth);
  }

  function handleMouseUp() {
    if (!state) return;
    document.body.style.cursor = savedCursor;
    document.body.style.userSelect = savedUserSelect;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    isResizing.value = false;
    resizingColumn.value = null;
    showResizeIndicator.value = false;
    state = null;
  }

  function startResize(event: MouseEvent, colKey: string) {
    event.preventDefault();
    event.stopPropagation();

    state = {
      colKey,
      startX: event.clientX,
      initialWidth: getColumnWidth(colKey),
    };

    isResizing.value = true;
    resizingColumn.value = colKey;
    resizeIndicatorX.value = event.clientX;
    showResizeIndicator.value = true;

    savedCursor = document.body.style.cursor;
    savedUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  /**
   * Returns the effective width for a column, accounting for resize overrides.
   */
  function resolvedWidth(colKey: string): number {
    return getColumnWidth(colKey);
  }

  /**
   * Double-click auto-fit: measure all visible cells in a column and set width to max content.
   * Pass the table container element to scan cells.
   */
  function autoFitColumn(colKey: string, containerEl: HTMLElement | null) {
    if (!containerEl) return;
    const density = getDensityKey(options.density?.value);
    const padding = DENSITY_WIDTH_CONFIG[density].autoFitPadding;
    const cells = containerEl.querySelectorAll(`[data-col-key="${colKey}"]`);
    let maxWidth = minWidth;
    cells.forEach((cell) => {
      const child = cell.firstElementChild as HTMLElement | null;
      if (child) {
        maxWidth = Math.max(maxWidth, child.scrollWidth + padding);
      }
    });
    if (maxWidth > minWidth) {
      const next = new Map(columnWidthOverrides.value);
      next.set(colKey, maxWidth);
      columnWidthOverrides.value = next;
      options.onResize?.(colKey, maxWidth);
    }
  }

  onUnmounted(() => {
    if (state) handleMouseUp();
  });

  return {
    startResize,
    isResizing: readonly(isResizing),
    resizingColumn: readonly(resizingColumn),
    columnWidthOverrides: readonly(columnWidthOverrides),
    resolvedWidth,
    autoFitColumn,
    resizeIndicatorX: readonly(resizeIndicatorX),
    showResizeIndicator: readonly(showResizeIndicator),
  };
}
