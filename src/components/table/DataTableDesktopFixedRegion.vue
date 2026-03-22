<script setup lang="ts" generic="T extends { id: string } & Record<string, unknown>">
import type { ComponentPublicInstance, CSSProperties, HTMLAttributes } from "vue";
import type { TableColumn } from "../../types";

type DataTableDesktopFrameElementRef = Element | ComponentPublicInstance | null;

const props = withDefaults(
  defineProps<{
    fixedWidth?: number;
    showFixedShadow?: boolean;
    regionClass?: HTMLAttributes["class"];
    regionStyle?: CSSProperties;
    columns?: TableColumn[];
    allColumns?: TableColumn[];
    selectable?: boolean;
    showRowActions?: boolean;
    useVirtual?: boolean;
    totalHeight?: number;
    offsetY?: number;
    resolveRowId?: (item: T) => string;
    setRegionRef?: (element: HTMLElement | null) => void;
  }>(),
  {
    fixedWidth: 0,
    showFixedShadow: false,
    regionClass: undefined,
    regionStyle: undefined,
    columns: () => [],
    allColumns: () => [],
    selectable: true,
    showRowActions: true,
    useVirtual: false,
    totalHeight: 0,
    offsetY: 0,
    resolveRowId: undefined,
    setRegionRef: undefined,
  },
);

const emit = defineEmits<{
  scroll: [event: Event];
}>();

defineOptions({ name: "DataTableDesktopFixedRegion" });

function resolveElementRef(source: DataTableDesktopFrameElementRef): HTMLElement | null {
  if (source instanceof HTMLElement) {
    return source;
  }
  if (source && "$el" in source) {
    const element = source.$el;
    return element instanceof HTMLElement ? element : null;
  }
  return null;
}

function bindRegionRef(element: DataTableDesktopFrameElementRef) {
  props.setRegionRef?.(resolveElementRef(element));
}

function handleScroll(event: Event) {
  emit("scroll", event);
}

function slotPayload() {
  return {
    branch: "fixed" as const,
    columns: props.columns,
    allColumns: props.allColumns,
    selectable: props.selectable,
    showRowActions: props.showRowActions,
    useVirtual: props.useVirtual,
    totalHeight: props.totalHeight,
    offsetY: props.offsetY,
    resolveRowId: props.resolveRowId,
  };
}
</script>

<template>
  <div
    :ref="bindRegionRef"
    class="of-data-table-fixed-region of-data-table-desktop-frame__fixed-region"
    :class="[{ 'of-fixed-shadow': showFixedShadow }, regionClass]"
    :style="[regionStyle, { width: `${fixedWidth}px` }]"
    @scroll="handleScroll"
  >
    <slot name="header" v-bind="slotPayload()" />
    <div class="of-data-table-fixed-body">
      <slot name="body" v-bind="slotPayload()" />
    </div>
  </div>
</template>

<style scoped>
.of-data-table-desktop-frame__fixed-region {
  min-width: 0;
  position: sticky;
  left: 0;
  z-index: 10;
  overflow-y: auto;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  border-right: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  scrollbar-width: none;
}

.of-data-table-desktop-frame__fixed-region::-webkit-scrollbar {
  display: none;
}

.of-data-table-fixed-region.of-fixed-shadow {
  box-shadow: var(--of-shadow-fixed-col);
  clip-path: inset(0 -12px 0 0);
}
</style>
