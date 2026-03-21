import { ref, computed, readonly, onUnmounted, type Ref, type ComputedRef } from "vue";
import type { TableColumn } from "../types";
import type { HoverState } from "../types/table-internal";

export interface UseFixedColumnsOptions {
  columns: Ref<TableColumn[]>;
  fixedColumnKeys: Ref<string[]>;
  scrollContainerRef: Ref<HTMLElement | null>;
  fixedContainerRef: Ref<HTMLElement | null>;
  /** Width of the selector checkbox column (default 40) */
  selectorWidth?: number;
}

export function useFixedColumns(options: UseFixedColumnsOptions) {
  const selectorWidth = options.selectorWidth ?? 40;
  const scrollLeft = ref(0);
  const hoverState = ref<HoverState>({ rowId: null });

  let scrollRafId: number | null = null;
  let fixedRafId: number | null = null;
  let scrollSyncSource: "scroll" | "fixed" | null = null;

  // ── Column Partitioning ─────────────────────────────────────────────────

  const fixedColumns: ComputedRef<TableColumn[]> = computed(() => {
    const keys = new Set(options.fixedColumnKeys.value);
    return options.columns.value.filter((c) => keys.has(c.key));
  });

  const scrollableColumns: ComputedRef<TableColumn[]> = computed(() => {
    const keys = new Set(options.fixedColumnKeys.value);
    return options.columns.value.filter((c) => !keys.has(c.key));
  });

  const fixedWidth: ComputedRef<number> = computed(() => {
    let total = selectorWidth;
    for (const col of fixedColumns.value) {
      total += typeof col.width === "number" ? col.width : (col.minWidth ?? 200);
    }
    return total;
  });

  // ── Scroll Synchronization (rAF-wrapped, bidirectional) ─────────────────

  function handleScroll(e: Event) {
    if (scrollSyncSource === "fixed") {
      scrollSyncSource = null;
      return;
    }

    const target = e.target as HTMLElement;
    scrollLeft.value = target.scrollLeft;

    if (scrollRafId !== null) cancelAnimationFrame(scrollRafId);
    scrollRafId = requestAnimationFrame(() => {
      const fixed = options.fixedContainerRef.value;
      if (fixed && fixed !== target) {
        scrollSyncSource = "scroll";
        fixed.scrollTop = target.scrollTop;
      }
      scrollRafId = null;
    });
  }

  function handleFixedScroll(e: Event) {
    if (scrollSyncSource === "scroll") {
      scrollSyncSource = null;
      return;
    }

    const target = e.target as HTMLElement;

    if (fixedRafId !== null) cancelAnimationFrame(fixedRafId);
    fixedRafId = requestAnimationFrame(() => {
      const scroll = options.scrollContainerRef.value;
      if (scroll && scroll !== target) {
        scrollSyncSource = "fixed";
        scroll.scrollTop = target.scrollTop;
      }
      fixedRafId = null;
    });
  }

  // ── Hover Sync ──────────────────────────────────────────────────────────

  function syncHover(rowId: string | null) {
    hoverState.value = { rowId };
  }

  function isRowHovered(rowId: string): boolean {
    return hoverState.value.rowId === rowId;
  }

  // ── Cleanup ─────────────────────────────────────────────────────────────

  onUnmounted(() => {
    if (scrollRafId !== null) cancelAnimationFrame(scrollRafId);
    if (fixedRafId !== null) cancelAnimationFrame(fixedRafId);
  });

  return {
    fixedColumns,
    scrollableColumns,
    fixedWidth,
    handleScroll,
    handleFixedScroll,
    scrollLeft: readonly(scrollLeft),
    syncHover,
    isRowHovered,
    hoverState: readonly(hoverState),
  };
}
