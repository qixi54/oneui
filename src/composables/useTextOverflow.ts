import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from "vue";
import { measureTextBlock, type MeasureTextBlockOptions } from "./useTextLayout";

export interface UseTextOverflowOptions {
  text: MaybeRefOrGetter<string>;
  font: MaybeRefOrGetter<string>;
  lineHeight: MaybeRefOrGetter<number>;
  maxLines?: MaybeRefOrGetter<number>;
  whiteSpace?: MaybeRefOrGetter<MeasureTextBlockOptions["whiteSpace"]>;
}

export interface UseTextOverflowReturn {
  targetRef: Ref<HTMLElement | null>;
  isOverflowing: Ref<boolean>;
  predictedHeight: Ref<number>;
  clampHeight: Ref<number>;
  refresh: () => void;
}

function normalizeLineClamp(maxLines: number | undefined): number {
  if (!Number.isFinite(maxLines) || (maxLines ?? 0) <= 0) return 1;
  return Math.max(1, Math.floor(maxLines ?? 1));
}

export function useTextOverflow(options: UseTextOverflowOptions): UseTextOverflowReturn {
  const targetRef = ref<HTMLElement | null>(null);
  const isOverflowing = ref(false);
  const predictedHeight = ref(0);
  const clampHeight = ref(0);

  let resizeObserver: ResizeObserver | null = null;

  function refresh() {
    const el = targetRef.value;
    const text = toValue(options.text) ?? "";
    const lineHeight = Number(toValue(options.lineHeight) ?? 0);
    const maxLines = normalizeLineClamp(toValue(options.maxLines));

    if (!el || !text || !Number.isFinite(lineHeight) || lineHeight <= 0) {
      predictedHeight.value = 0;
      clampHeight.value = Math.max(lineHeight || 0, maxLines * Math.max(lineHeight || 0, 0));
      isOverflowing.value = false;
      return;
    }

    clampHeight.value = lineHeight * maxLines;

    if (maxLines <= 1) {
      predictedHeight.value = lineHeight;
      isOverflowing.value =
        el.scrollWidth > el.clientWidth + 1 ||
        el.scrollHeight > el.clientHeight + 1;
      return;
    }

    const width = Math.max(el.clientWidth, 0);
    if (width <= 0) {
      predictedHeight.value = lineHeight;
      isOverflowing.value = false;
      return;
    }

    const measurement = measureTextBlock({
      text,
      font: toValue(options.font),
      maxWidth: width,
      lineHeight,
      whiteSpace: toValue(options.whiteSpace) ?? "normal",
      minHeight: lineHeight,
    });

    predictedHeight.value = measurement.contentHeight;
    isOverflowing.value =
      measurement.contentHeight > clampHeight.value + 0.5 ||
      el.scrollHeight > clampHeight.value + 1;
  }

  async function scheduleRefresh() {
    await nextTick();
    refresh();
  }

  onMounted(() => {
    scheduleRefresh();
    if (typeof ResizeObserver === "undefined") return;

    resizeObserver = new ResizeObserver(() => {
      refresh();
    });

    watch(
      () => targetRef.value,
      (el, prev) => {
        if (prev) resizeObserver?.unobserve(prev);
        if (el) resizeObserver?.observe(el);
      },
      { immediate: true },
    );
  });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;
  });

  watch(
    [
      computed(() => toValue(options.text)),
      computed(() => toValue(options.font)),
      computed(() => toValue(options.lineHeight)),
      computed(() => toValue(options.maxLines)),
      computed(() => toValue(options.whiteSpace)),
    ],
    () => {
      scheduleRefresh();
    },
  );

  return {
    targetRef,
    isOverflowing,
    predictedHeight,
    clampHeight,
    refresh,
  };
}
