import { computed, onUnmounted, ref, watch, type ComputedRef, type Ref } from "vue";

export interface UseVirtualListOptions<T> {
  items: Ref<T[]>;
  itemHeight: number | ((index: number) => number);
  overscan?: number;
  containerRef: Ref<HTMLElement | null>;
}

export type VirtualItem<T> = {
  data: T;
  index: number;
};

type VisibleRange = {
  start: number;
  end: number;
};

export function useVirtualList<T>({
  items,
  itemHeight,
  overscan = 5,
  containerRef,
}: UseVirtualListOptions<T>): {
  visibleItems: ComputedRef<VirtualItem<T>[]>;
  totalHeight: ComputedRef<number>;
  offsetY: ComputedRef<number>;
  scrollToIndex: (index: number) => void;
  scrollToBottom: () => void;
} {
  const scrollTop = ref(0);
  const containerHeight = ref(0);
  const isFixedHeight = typeof itemHeight === "number";
  const normalizedOverscan = Math.max(0, overscan);

  let resizeObserver: ResizeObserver | null = null;
  let currentContainer: HTMLElement | null = null;

  const cumulativeHeights = computed<number[]>(() => {
    if (isFixedHeight) return [];

    const heights = new Array(items.value.length + 1).fill(0);
    const getItemHeight = itemHeight as (index: number) => number;

    for (let index = 0; index < items.value.length; index += 1) {
      heights[index + 1] = heights[index] + Math.max(0, getItemHeight(index));
    }

    return heights;
  });

  const totalHeight = computed(() => {
    if (isFixedHeight) {
      return items.value.length * (itemHeight as number);
    }

    return cumulativeHeights.value[items.value.length] ?? 0;
  });

  function getOffsetForIndex(index: number): number {
    const safeIndex = Math.max(0, Math.min(index, items.value.length));

    if (isFixedHeight) {
      return safeIndex * (itemHeight as number);
    }

    return cumulativeHeights.value[safeIndex] ?? 0;
  }

  function findIndexForOffset(offset: number): number {
    if (items.value.length === 0) return 0;

    if (isFixedHeight) {
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

    if (isFixedHeight) {
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

  watch(items, () => {
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

  onUnmounted(() => {
    cleanupContainer(currentContainer);
    cleanupObserver();
    currentContainer = null;
  });

  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollToIndex,
    scrollToBottom,
  };
}
