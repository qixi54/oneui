<script setup lang="ts" generic="T extends { id: string } & Record<string, unknown>">
import type { ComponentPublicInstance, CSSProperties, HTMLAttributes } from "vue";
import type { TableColumn } from "../../types";

type DataTableDesktopFrameElementRef = Element | ComponentPublicInstance | null;

const props = withDefaults(
  defineProps<{
    fixedWidth?: number;
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

defineOptions({ name: "DataTableDesktopScrollRegion" });

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
    class="of-data-table-scroll-region of-data-table-desktop-frame__scroll-region"
    :class="regionClass"
    :style="[regionStyle, { marginLeft: `${fixedWidth}px` }]"
    @scroll="handleScroll"
  >
    <slot name="header" v-bind="slotPayload()" />
    <div class="of-data-table-scroll-body">
      <slot name="body" v-bind="slotPayload()" />
    </div>
  </div>
</template>

<style scoped>
.of-data-table-desktop-frame__scroll-region {
  min-width: 0;
  flex: 1;
  overflow: auto;
}
</style>
