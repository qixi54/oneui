<script setup lang="ts" generic="T extends { id: string } & Record<string, unknown>">
import { computed, type ComponentPublicInstance, type CSSProperties } from "vue";
import DataTableSelectionBar from "./DataTableSelectionBar.vue";
import type { ResolvedBulkActionItem } from "../../types/data-table";
import type { TableColumn } from "../../types";

type DesktopBranch = "fixed" | "standard";

type DataTableDesktopFrameStyleSource = CSSProperties | undefined | (() => CSSProperties | undefined);
type DataTableDesktopFrameElementRef = Element | ComponentPublicInstance | null;

const props = withDefaults(
  defineProps<{
    hasFixedColumns?: boolean;
    showSelectionBar?: boolean;
    selectionCount?: number;
    selectionItems?: ResolvedBulkActionItem[];
    fixedWidth?: number;
    showFixedShadow?: boolean;
    columns?: TableColumn[];
    fixedColumns?: TableColumn[];
    scrollableColumns?: TableColumn[];
    selectable?: boolean;
    showRowActions?: boolean;
    useVirtual?: boolean;
    totalHeight?: number;
    offsetY?: number;
    shellStyle?: DataTableDesktopFrameStyleSource;
    bodyStyle?: DataTableDesktopFrameStyleSource;
    fixedRegionStyle?: DataTableDesktopFrameStyleSource;
    scrollRegionStyle?: DataTableDesktopFrameStyleSource;
    selectionBarStyle?: DataTableDesktopFrameStyleSource;
    resolveRowId?: (item: T) => string;
    resolveBranchClass?: (branch: DesktopBranch) => string | string[] | Record<string, boolean>;
    resolveBodyClass?: (branch: DesktopBranch) => string | string[] | Record<string, boolean>;
    resolveFixedRegionClass?: () => string | string[] | Record<string, boolean>;
    resolveScrollRegionClass?: () => string | string[] | Record<string, boolean>;
    resolveSelectionBarClass?: () => string | string[] | Record<string, boolean>;
    resolveBodyStyle?: () => CSSProperties | undefined;
    resolveFixedRegionStyle?: () => CSSProperties | undefined;
    resolveScrollRegionStyle?: () => CSSProperties | undefined;
    resolveSelectionBarStyle?: () => CSSProperties | undefined;
    onSelectionAction?: (action: ResolvedBulkActionItem) => void;
    onFixedScroll?: (event: Event) => void;
    onScroll?: (event: Event) => void;
    setFixedRegionRef?: (element: HTMLElement | null) => void;
    setScrollRegionRef?: (element: HTMLElement | null) => void;
    setStandardScrollRef?: (element: HTMLElement | null) => void;
  }>(),
  {
    hasFixedColumns: false,
    showSelectionBar: true,
    selectionCount: 0,
    selectionItems: () => [],
    fixedWidth: 0,
    showFixedShadow: false,
    columns: () => [],
    fixedColumns: () => [],
    scrollableColumns: () => [],
    selectable: true,
    showRowActions: true,
    useVirtual: false,
    totalHeight: 0,
    offsetY: 0,
    shellStyle: undefined,
    bodyStyle: undefined,
    fixedRegionStyle: undefined,
    scrollRegionStyle: undefined,
    selectionBarStyle: undefined,
    resolveRowId: undefined,
    resolveBranchClass: undefined,
    resolveBodyClass: undefined,
    resolveFixedRegionClass: undefined,
    resolveScrollRegionClass: undefined,
    resolveSelectionBarClass: undefined,
    resolveBodyStyle: undefined,
    resolveFixedRegionStyle: undefined,
    resolveScrollRegionStyle: undefined,
    resolveSelectionBarStyle: undefined,
    onSelectionAction: undefined,
    onFixedScroll: undefined,
    onScroll: undefined,
    setFixedRegionRef: undefined,
    setScrollRegionRef: undefined,
    setStandardScrollRef: undefined,
  },
);

const emit = defineEmits<{
  "selection-action": [action: ResolvedBulkActionItem];
  scroll: [event: Event];
  "fixed-scroll": [event: Event];
}>();

defineOptions({ name: "DataTableDesktopFrame", inheritAttrs: false });

function resolveStyleSource(source: DataTableDesktopFrameStyleSource): CSSProperties {
  if (typeof source === "function") {
    return source() ?? {};
  }
  return source ?? {};
}

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

const resolvedShellStyle = computed<CSSProperties>(() => resolveStyleSource(props.shellStyle));
const resolvedBodyStyle = computed<CSSProperties>(() => resolveStyleSource(props.resolveBodyStyle ?? props.bodyStyle));
const resolvedFixedRegionStyle = computed<CSSProperties>(
  () => resolveStyleSource(props.resolveFixedRegionStyle ?? props.fixedRegionStyle),
);
const resolvedScrollRegionStyle = computed<CSSProperties>(
  () => resolveStyleSource(props.resolveScrollRegionStyle ?? props.scrollRegionStyle),
);
const resolvedSelectionBarStyle = computed<CSSProperties>(
  () => resolveStyleSource(props.resolveSelectionBarStyle ?? props.selectionBarStyle),
);

function resolveBranchClassValue(branch: DesktopBranch) {
  return props.resolveBranchClass?.(branch);
}

function resolveBodyClassValue(branch: DesktopBranch) {
  return props.resolveBodyClass?.(branch);
}

function resolveFixedRegionClassValue() {
  return props.resolveFixedRegionClass?.();
}

function resolveScrollRegionClassValue() {
  return props.resolveScrollRegionClass?.();
}

function resolveSelectionBarClassValue() {
  return props.resolveSelectionBarClass?.();
}

function handleSelectionAction(action: ResolvedBulkActionItem) {
  emit("selection-action", action);
  props.onSelectionAction?.(action);
}

function handleFixedScroll(event: Event) {
  emit("fixed-scroll", event);
  props.onFixedScroll?.(event);
}

function handleScroll(event: Event) {
  emit("scroll", event);
  props.onScroll?.(event);
}

function bindFixedRegionRef(element: DataTableDesktopFrameElementRef) {
  props.setFixedRegionRef?.(resolveElementRef(element));
}

function bindScrollRegionRef(element: DataTableDesktopFrameElementRef) {
  props.setScrollRegionRef?.(resolveElementRef(element));
}

function bindStandardScrollRef(element: DataTableDesktopFrameElementRef) {
  props.setStandardScrollRef?.(resolveElementRef(element));
}

function slotPayload(branch: DesktopBranch) {
  return {
    branch,
    columns: branch === "fixed" ? props.fixedColumns : props.scrollableColumns,
    allColumns: props.columns,
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
  <section class="of-data-table-desktop-frame" v-bind="$attrs" :style="resolvedShellStyle">
    <DataTableSelectionBar
      v-if="showSelectionBar && selectionCount > 0"
      class="of-data-table-desktop-frame__selection-bar"
      :class="resolveSelectionBarClassValue()"
      :style="resolvedSelectionBarStyle"
      :selection-count="selectionCount"
      :items="selectionItems"
      @action="handleSelectionAction"
    />

    <template v-if="hasFixedColumns">
      <div
        class="of-data-table-body of-data-table-desktop-frame__body"
        :class="[resolveBranchClassValue('fixed'), resolveBodyClassValue('fixed')]"
        :style="[resolvedBodyStyle]"
      >
        <div
          :ref="bindFixedRegionRef"
          class="of-data-table-fixed-region of-data-table-desktop-frame__fixed-region"
          :class="[{ 'of-fixed-shadow': showFixedShadow }, resolveFixedRegionClassValue()]"
          :style="[resolvedFixedRegionStyle, { width: `${fixedWidth}px` }]"
          @scroll="handleFixedScroll"
        >
          <slot name="fixed-header" v-bind="slotPayload('fixed')" />
          <div class="of-data-table-fixed-body">
            <slot name="fixed-body" v-bind="slotPayload('fixed')" />
          </div>
        </div>

        <div
          :ref="bindScrollRegionRef"
          class="of-data-table-scroll-region of-data-table-desktop-frame__scroll-region"
          :class="[resolveBranchClassValue('fixed'), resolveScrollRegionClassValue()]"
          :style="[resolvedScrollRegionStyle, { marginLeft: `${fixedWidth}px` }]"
          @scroll="handleScroll"
        >
          <slot name="scroll-header" v-bind="slotPayload('fixed')" />
          <div class="of-data-table-scroll-body">
            <slot name="scroll-body" v-bind="slotPayload('fixed')" />
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div
        :ref="bindStandardScrollRef"
        class="of-data-table-scroll-container of-data-table-desktop-frame__standard"
        :class="[resolveBranchClassValue('standard'), resolveBodyClassValue('standard')]"
        :style="[resolvedBodyStyle]"
        @scroll="handleScroll"
      >
        <slot name="standard-header" v-bind="slotPayload('standard')" />
        <div class="of-data-table-desktop-frame__standard-body">
          <slot name="standard-body" v-bind="slotPayload('standard')" />
        </div>
      </div>
    </template>

    <slot name="footer" />
    <slot name="overlay" />
  </section>
</template>

<style scoped>
.of-data-table-desktop-frame {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.of-data-table-desktop-frame__selection-bar {
  flex: 0 0 auto;
}

.of-data-table-desktop-frame__body {
  position: relative;
  min-width: 0;
  display: flex;
  overflow: hidden;
}

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

.of-data-table-desktop-frame__scroll-region {
  min-width: 0;
  flex: 1;
  overflow: auto;
}

.of-data-table-desktop-frame__standard {
  min-width: 0;
  max-height: 600px;
  overflow-y: auto;
}

.of-data-table-desktop-frame__standard-body {
  min-width: 0;
}

.of-checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.of-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.of-table-row {
  position: relative;
}

.of-table-row--hover {
  background: var(--of-surface-muted, var(--of-color-gray-50));
}

.of-table-row__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-left: auto;
  min-width: 116px;
  padding: 0 10px 0 8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.of-table-row:hover .of-table-row__actions,
.of-table-row:focus-within .of-table-row__actions,
.of-table-row--selected .of-table-row__actions,
.of-table-row--hover .of-table-row__actions {
  opacity: 1;
  pointer-events: auto;
}

.of-table-row__action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  border-radius: 999px;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  color: var(--of-text-secondary, var(--of-color-gray-600));
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: var(--of-transition-fast);
}

.of-table-row__action-btn:hover:not(:disabled),
.of-table-row__action-btn:focus-visible:not(:disabled) {
  background: var(--of-surface-selected, var(--of-color-gray-100));
  color: var(--of-text-primary, var(--of-color-gray-800));
  border-color: var(--of-border-strong, var(--of-color-gray-300));
}

.of-table-row__action-btn--danger {
  color: var(--of-error-text, var(--of-color-error-600));
}

.of-table-row__action-btn--danger:hover:not(:disabled),
.of-table-row__action-btn--danger:focus-visible:not(:disabled) {
  background: var(--of-surface-muted, var(--of-color-gray-50));
  border-color: var(--of-border-subtle, var(--of-color-gray-200));
}

.of-table-row__action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.of-data-table-fixed-region.of-fixed-shadow {
  box-shadow: var(--of-shadow-fixed-col);
  clip-path: inset(0 -12px 0 0);
}

@media (max-width: 768px) {
  .of-data-table-desktop-frame__standard {
    max-height: 100dvh;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
