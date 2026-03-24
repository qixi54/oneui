<script setup lang="ts" generic="T extends { id: string } & Record<string, unknown>">
import { computed, type CSSProperties } from "vue";
import DataTableDesktopFixedRegion from "./DataTableDesktopFixedRegion.vue";
import DataTableDesktopScrollRegion from "./DataTableDesktopScrollRegion.vue";
import DataTableDesktopStandardRegion from "./DataTableDesktopStandardRegion.vue";
import DataTableSelectionBar from "./DataTableSelectionBar.vue";
import type { ResolvedBulkActionItem } from "../../types/data-table";
import type { TableColumn } from "../../types";

type DesktopBranch = "fixed" | "standard";

type DataTableDesktopFrameStyleSource = CSSProperties | undefined | (() => CSSProperties | undefined);

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
        <DataTableDesktopFixedRegion
          :fixed-width="fixedWidth"
          :show-fixed-shadow="showFixedShadow"
          :region-class="resolveFixedRegionClassValue()"
          :region-style="resolvedFixedRegionStyle"
          :columns="fixedColumns"
          :all-columns="columns"
          :selectable="selectable"
          :show-row-actions="showRowActions"
          :use-virtual="useVirtual"
          :total-height="totalHeight"
          :offset-y="offsetY"
          :resolve-row-id="resolveRowId"
          :set-region-ref="setFixedRegionRef"
          @scroll="handleFixedScroll"
        >
          <template #header>
            <slot name="fixed-header" v-bind="slotPayload('fixed')" />
          </template>
          <template #body>
            <slot name="fixed-body" v-bind="slotPayload('fixed')" />
          </template>
        </DataTableDesktopFixedRegion>

        <DataTableDesktopScrollRegion
          :fixed-width="fixedWidth"
          :region-class="[resolveBranchClassValue('fixed'), resolveScrollRegionClassValue()]"
          :region-style="resolvedScrollRegionStyle"
          :columns="scrollableColumns"
          :all-columns="columns"
          :selectable="selectable"
          :show-row-actions="showRowActions"
          :use-virtual="useVirtual"
          :total-height="totalHeight"
          :offset-y="offsetY"
          :resolve-row-id="resolveRowId"
          :set-region-ref="setScrollRegionRef"
          @scroll="handleScroll"
        >
          <template #header>
            <slot name="scroll-header" v-bind="slotPayload('fixed')" />
          </template>
          <template #body>
            <slot name="scroll-body" v-bind="slotPayload('fixed')" />
          </template>
        </DataTableDesktopScrollRegion>
      </div>
    </template>

    <template v-else>
      <DataTableDesktopStandardRegion
        :container-class="[resolveBranchClassValue('standard'), resolveBodyClassValue('standard')]"
        :container-style="resolvedBodyStyle"
        :columns="scrollableColumns"
        :all-columns="columns"
        :selectable="selectable"
        :show-row-actions="showRowActions"
        :use-virtual="useVirtual"
        :total-height="totalHeight"
        :offset-y="offsetY"
        :resolve-row-id="resolveRowId"
        :set-container-ref="setStandardScrollRef"
        @scroll="handleScroll"
      >
        <template #header>
          <slot name="standard-header" v-bind="slotPayload('standard')" />
        </template>
        <template #body>
          <slot name="standard-body" v-bind="slotPayload('standard')" />
        </template>
      </DataTableDesktopStandardRegion>
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

.of-checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-1_5);
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
  gap: var(--of-spacing-1_5);
  margin-left: auto;
  min-width: 116px;
  padding: 0 var(--of-spacing-2_5) 0 var(--of-spacing-2);
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
  gap: var(--of-spacing-1);
  padding: var(--of-spacing-1_25) var(--of-spacing-2_5);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  border-radius: var(--of-radius-full);
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  color: var(--of-text-secondary, var(--of-color-gray-600));
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-medium);
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

</style>
