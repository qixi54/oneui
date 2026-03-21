import {
  computed,
  getCurrentScope,
  onScopeDispose,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from "vue";

export interface UseVirtualListOptions<T> {
  items: Ref<T[]>;
  itemHeight: number | ((index: number) => number);
  overscan?: number;
  containerRef: Ref<HTMLElement | null>;
  invalidateKey?: Ref<unknown>;
  /** Optional callback to measure actual row height after render. When provided, measured heights override itemHeight. */
  measureRow?: boolean;
}

export type VirtualItem<T> = {
  data: T;
  index: number;
};

type VisibleRange = {
  start: number;
  end: number;
};

export function useVirtualList<T>(options: UseVirtualListOptions<T>): {
  visibleItems: ComputedRef<VirtualItem<T>[]>;
  totalHeight: ComputedRef<number>;
  offsetY: ComputedRef<number>;
  scrollToIndex: (index: number) => void;
  scrollToBottom: () => void;
  observeRow: (el: HTMLElement | null, index: number) => void;
} {
  const { items, itemHeight, overscan = 5, containerRef } = options;
  const scrollTop = ref(0);
  const containerHeight = ref(0);
  const isFixedHeight = typeof itemHeight === "number";
  const normalizedOverscan = Math.max(0, overscan);
  const measuredHeights = new Map<number, number>();
  const measureTrigger = ref(0);

  let resizeObserver: ResizeObserver | null = null;
  let rowResizeObserver: ResizeObserver | null = null;
  let currentContainer: HTMLElement | null = null;

  function getEffectiveHeight(index: number): number {
    if (measuredHeights.has(index)) return measuredHeights.get(index)!;
    if (isFixedHeight) return itemHeight as number;
    return (itemHeight as (index: number) => number)(index);
  }

  function setupRowMeasurement() {
    if (!options.measureRow || typeof ResizeObserver === "undefined") return;

    rowResizeObserver = new ResizeObserver((entries) => {
      let changed = false;
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        const indexStr = el.dataset.virtualIndex;
        if (indexStr == null) continue;
        const index = parseInt(indexStr, 10);
        const height = entry.contentRect.height;
        if (measuredHeights.get(index) !== height) {
          measuredHeights.set(index, height);
          changed = true;
        }
      }
      if (changed) {
        // Trigger recalculation by updating a reactive trigger
        measureTrigger.value++;
      }
    });
  }

  setupRowMeasurement();

  function resetMeasurements() {
    if (measuredHeights.size === 0) return;
    measuredHeights.clear();
    measureTrigger.value++;
    if (currentContainer) {
      syncContainerMetrics(currentContainer);
    }
  }

  function observeRow(el: HTMLElement | null, index: number) {
    if (!el || !rowResizeObserver) return;
    el.dataset.virtualIndex = String(index);
    rowResizeObserver.observe(el);
  }

  const cumulativeHeights = computed<number[]>(() => {
    // Access trigger to establish dependency for measured height updates
    void measureTrigger.value;

    if (isFixedHeight && measuredHeights.size === 0) return [];

    const heights = new Array(items.value.length + 1).fill(0);

    for (let index = 0; index < items.value.length; index += 1) {
      heights[index + 1] = heights[index] + Math.max(0, getEffectiveHeight(index));
    }

    return heights;
  });

  const totalHeight = computed(() => {
    if (isFixedHeight && measuredHeights.size === 0) {
      return items.value.length * (itemHeight as number);
    }

    return cumulativeHeights.value[items.value.length] ?? 0;
  });

  function getOffsetForIndex(index: number): number {
    const safeIndex = Math.max(0, Math.min(index, items.value.length));

    if (isFixedHeight && measuredHeights.size === 0) {
      return safeIndex * (itemHeight as number);
    }

    return cumulativeHeights.value[safeIndex] ?? 0;
  }

  function findIndexForOffset(offset: number): number {
    if (items.value.length === 0) return 0;

    if (isFixedHeight && measuredHeights.size === 0) {
      const height = itemHeight as number;
      return Math.max(
        0,
        Math.min(items.value.length - 1, Math.floor(Math.max(0, offset) / height)),
      );
    }

    const heights = cumulativeHeights.value;
    let low = 0;
    let high = items.value.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (heights[mid + 1] <= offset) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    return Math.max(0, Math.min(low, items.value.length - 1));
  }

  const visibleRange = computed<VisibleRange>(() => {
    const itemCount = items.value.length;

    if (itemCount === 0) {
      return { start: 0, end: 0 };
    }

    if (containerHeight.value <= 0) {
      const initialEnd = Math.min(itemCount, normalizedOverscan * 2 + 1);
      return { start: 0, end: initialEnd };
    }

    if (isFixedHeight && measuredHeights.size === 0) {
      const height = itemHeight as number;
      const rawStart = Math.floor(scrollTop.value / height);
      const visibleCount = Math.ceil(containerHeight.value / height);
      const start = Math.max(0, rawStart - normalizedOverscan);
      const end = Math.min(itemCount, rawStart + visibleCount + normalizedOverscan);

      return { start, end };
    }

    const viewportTop = Math.max(0, scrollTop.value);
    const viewportBottom = viewportTop + containerHeight.value;
    const firstVisible = findIndexForOffset(viewportTop);
    const lastVisible = Math.min(itemCount - 1, findIndexForOffset(viewportBottom));

    return {
      start: Math.max(0, firstVisible - normalizedOverscan),
      end: Math.min(itemCount, lastVisible + normalizedOverscan + 1),
    };
  });

  const offsetY = computed(() => getOffsetForIndex(visibleRange.value.start));

  const visibleItems = computed<VirtualItem<T>[]>(() => {
    const { start, end } = visibleRange.value;
    return items.value.slice(start, end).map((data, offset) => ({
      data,
      index: start + offset,
    }));
  });

  function syncContainerMetrics(container: HTMLElement | null) {
    if (!container) {
      scrollTop.value = 0;
      containerHeight.value = 0;
      return;
    }

    scrollTop.value = container.scrollTop;
    containerHeight.value = container.clientHeight;
  }

  function handleScroll() {
    if (!currentContainer) return;
    scrollTop.value = currentContainer.scrollTop;
  }

  function cleanupObserver() {
    resizeObserver?.disconnect();
    resizeObserver = null;
  }

  function cleanupContainer(container: HTMLElement | null | undefined) {
    if (!container) return;
    container.removeEventListener("scroll", handleScroll);
  }

  function bindContainer(container: HTMLElement | null) {
    if (!container) {
      currentContainer = null;
      syncContainerMetrics(null);
      return;
    }

    currentContainer = container;
    container.addEventListener("scroll", handleScroll, { passive: true });
    syncContainerMetrics(container);

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        syncContainerMetrics(container);
      });
      resizeObserver.observe(container);
    }
  }

  watch(
    containerRef,
    (nextContainer, previousContainer) => {
      cleanupContainer(previousContainer);
      cleanupObserver();
      bindContainer(nextContainer);
    },
    { immediate: true },
  );

  watch(
    () => options.invalidateKey?.value,
    () => {
      resetMeasurements();
    },
    { immediate: true },
  );

  let prevItemCount = items.value.length;
  let prevFirstId: unknown =
    items.value.length > 0 ? (items.value[0] as Record<string, unknown>)?.id : undefined;

  watch(items, (newItems) => {
    const newCount = newItems.length;
    const newFirstId = newCount > 0 ? (newItems[0] as Record<string, unknown>)?.id : undefined;

    // Heuristic: same length + same first id → in-place update, preserve scroll
    const isInPlaceUpdate = newCount === prevItemCount && newFirstId === prevFirstId;

    prevItemCount = newCount;
    prevFirstId = newFirstId;

    if (isInPlaceUpdate) {
      // Data update (e.g. patchRow) — do NOT touch scrollTop
      return;
    }

    // Data replacement — clear measured heights cache
    resetMeasurements();

    // Data replacement — clamp scrollTop if beyond new total height
    const maxScrollTop = Math.max(0, totalHeight.value - containerHeight.value);
    if (scrollTop.value > maxScrollTop) {
      scrollTop.value = maxScrollTop;
      if (currentContainer) {
        currentContainer.scrollTop = maxScrollTop;
      }
    }
  });

  function scrollToIndex(index: number) {
    if (!currentContainer || items.value.length === 0) return;

    const safeIndex = Math.max(0, Math.min(index, items.value.length - 1));
    const top = getOffsetForIndex(safeIndex);
    currentContainer.scrollTop = top;
    scrollTop.value = top;
  }

  function scrollToBottom() {
    if (!currentContainer) return;

    const target = Math.max(0, totalHeight.value - currentContainer.clientHeight);
    currentContainer.scrollTop = target;
    scrollTop.value = target;
  }

  const dispose = () => {
    cleanupContainer(currentContainer);
    cleanupObserver();
    rowResizeObserver?.disconnect();
    rowResizeObserver = null;
    currentContainer = null;
  };

  if (getCurrentScope()) {
    onScopeDispose(dispose);
  }

  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollToIndex,
    scrollToBottom,
    observeRow,
  };
}
