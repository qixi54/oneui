<script setup lang="ts" generic="T extends { id: string } & Record<string, unknown>">
import type { ComponentPublicInstance, CSSProperties, HTMLAttributes } from "vue";
import type { TableColumn } from "../../types";

type DataTableDesktopFrameElementRef = Element | ComponentPublicInstance | null;

const props = withDefaults(
  defineProps<{
    containerClass?: HTMLAttributes["class"];
    containerStyle?: CSSProperties;
    columns?: TableColumn[];
    allColumns?: TableColumn[];
    selectable?: boolean;
    showRowActions?: boolean;
    useVirtual?: boolean;
    totalHeight?: number;
    offsetY?: number;
    resolveRowId?: (item: T) => string;
    setContainerRef?: (element: HTMLElement | null) => void;
  }>(),
  {
    containerClass: undefined,
    containerStyle: undefined,
    columns: () => [],
    allColumns: () => [],
    selectable: true,
    showRowActions: true,
    useVirtual: false,
    totalHeight: 0,
    offsetY: 0,
    resolveRowId: undefined,
    setContainerRef: undefined,
  },
);

const emit = defineEmits<{
  scroll: [event: Event];
}>();

defineOptions({ name: "DataTableDesktopStandardRegion" });

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

function bindContainerRef(element: DataTableDesktopFrameElementRef) {
  props.setContainerRef?.(resolveElementRef(element));
}

function handleScroll(event: Event) {
  emit("scroll", event);
}

function slotPayload() {
  return {
    branch: "standard" as const,
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
    :ref="bindContainerRef"
    class="of-data-table-scroll-container of-data-table-desktop-frame__standard"
    :class="containerClass"
    :style="[containerStyle]"
    @scroll="handleScroll"
  >
    <slot name="header" v-bind="slotPayload()" />
    <div class="of-data-table-desktop-frame__standard-body">
      <slot name="body" v-bind="slotPayload()" />
    </div>
  </div>
</template>

<style scoped>
.of-data-table-desktop-frame__standard {
  min-width: 0;
  max-height: 600px;
  overflow-y: auto;
}

.of-data-table-desktop-frame__standard-body {
  min-width: 0;
}

@media (max-width: 768px) {
  .of-data-table-desktop-frame__standard {
    max-height: 100dvh;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
