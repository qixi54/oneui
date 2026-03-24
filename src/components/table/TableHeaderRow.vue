<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import { ChevronUp, ChevronDown, Plus } from "lucide-vue-next";
import type { Density, TableColumn } from "../../types";

const props = withDefaults(
  defineProps<{
    columns: TableColumn[];
    selectable?: boolean;
    sortKey?: string;
    sortOrder?: "asc" | "desc";
    allSelected?: boolean;
    indeterminate?: boolean;
    enableResize?: boolean;
    enableFieldMenu?: boolean;
    enableAddField?: boolean;
    density?: Density;
  }>(),
  {
    selectable: true,
    sortKey: "",
    sortOrder: "asc",
    allSelected: false,
    indeterminate: false,
    enableResize: false,
    enableFieldMenu: false,
    enableAddField: false,
    density: "standard",
  },
);

const emit = defineEmits<{
  sort: [key: string];
  "select-all": [];
  "resize-start": [event: MouseEvent, colKey: string];
  "resize-dblclick": [colKey: string];
  "header-contextmenu": [event: MouseEvent, colKey: string];
  "header-dblclick": [colKey: string];
  "add-field": [];
}>();

const DENSITY_LAYOUT: Record<
  Density,
  {
    headerHeight: number;
    cellPaddingX: number;
    cellPaddingY: number;
    addColumnWidth: number;
    fillMinWidth: number;
  }
> = {
  compact: {
    headerHeight: 32,
    cellPaddingX: 10,
    cellPaddingY: 6,
    addColumnWidth: 32,
    fillMinWidth: 180,
  },
  standard: {
    headerHeight: 36,
    cellPaddingX: 12,
    cellPaddingY: 8,
    addColumnWidth: 36,
    fillMinWidth: 220,
  },
  comfortable: {
    headerHeight: 40,
    cellPaddingX: 14,
    cellPaddingY: 10,
    addColumnWidth: 40,
    fillMinWidth: 240,
  },
};

const densityMetrics = computed(() => DENSITY_LAYOUT[props.density]);
const headerStyle = computed<CSSProperties>(() => ({
  minHeight: `${densityMetrics.value.headerHeight}px`,
}));

const cellStyle = computed<CSSProperties>(() => ({
  padding: `${densityMetrics.value.cellPaddingY}px ${densityMetrics.value.cellPaddingX}px`,
}));

const addButtonStyle = computed<CSSProperties>(() => ({
  ...cellStyle.value,
  width: `${densityMetrics.value.addColumnWidth}px`,
  flexShrink: "0",
  flexGrow: "0",
}));

function colStyle(col: TableColumn) {
  const padding = cellStyle.value;
  if (col.width === "fill") {
    const minWidth = `${col.minWidth ?? densityMetrics.value.fillMinWidth}px`;
    return { ...padding, flex: `1 1 ${minWidth}`, minWidth };
  }
  return { ...padding, width: `${col.width}px`, flexShrink: "0", flexGrow: "0" };
}

function handleSort(key: string) {
  emit("sort", key);
}

function handleHeaderKeyDown(event: KeyboardEvent, key: string) {
  if (event.target !== event.currentTarget) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  emit("sort", key);
}

function onResizeStart(e: MouseEvent, colKey: string) {
  e.stopPropagation();
  emit("resize-start", e, colKey);
}
</script>

<template>
  <div class="of-table-header" role="row" :style="headerStyle">
    <!-- Checkbox 列 -->
    <div
      v-if="selectable"
      class="of-th of-th-checkbox"
      role="columnheader"
      aria-label="选择全部行"
      :style="cellStyle"
    >
      <label class="of-th-checkbox__label" for="of-table-select-all-checkbox">
        <input
          id="of-table-select-all-checkbox"
          type="checkbox"
          class="of-checkbox"
          :checked="allSelected"
          :indeterminate="indeterminate"
          @change="emit('select-all')"
        />
        <span class="of-sr-only">选择全部行</span>
      </label>
    </div>

    <!-- 数据列 -->
    <div
      v-for="col in columns"
      :key="col.key"
      role="columnheader"
      tabindex="0"
      class="of-th"
      :style="colStyle(col)"
      :class="{ 'of-th--sortable': true, 'of-th--active': sortKey === col.key }"
      :aria-sort="sortKey === col.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'"
      @click="handleSort(col.key)"
      @keydown="handleHeaderKeyDown($event, col.key)"
      @contextmenu.prevent="enableFieldMenu && emit('header-contextmenu', $event, col.key)"
      @dblclick.stop="enableFieldMenu && emit('header-dblclick', col.key)"
    >
      <span class="of-th-label">{{ col.label }}</span>
      <span class="of-th-sort-icon">
        <ChevronUp
          v-if="sortKey === col.key && sortOrder === 'asc'"
          :size="12"
          class="of-sort-icon-active"
        />
        <ChevronDown
          v-else-if="sortKey === col.key && sortOrder === 'desc'"
          :size="12"
          class="of-sort-icon-active"
        />
        <ChevronDown v-else :size="12" class="of-sort-icon-idle" />
      </span>

      <!-- Column resize handle -->
      <button
        v-if="enableResize"
        type="button"
        class="of-th-resizer"
        aria-label="调整列宽"
        @click.stop
        @mousedown="onResizeStart($event, col.key)"
        @dblclick.stop="emit('resize-dblclick', col.key)"
      />
    </div>

    <!-- 添加字段按钮 -->
    <button
      v-if="enableAddField"
      type="button"
      class="of-th of-th-add"
      tabindex="0"
      aria-label="添加字段"
      :style="addButtonStyle"
      @click.stop="emit('add-field')"
    >
      <Plus :size="14" />
    </button>
  </div>
</template>

<style scoped>
.of-table-header {
  display: flex;
  align-items: center;
  background: var(--of-surface-panel, var(--of-color-bg-hover, var(--of-color-gray-50)));
  border-bottom: 1px solid var(--of-border-divider, var(--of-border-subtle, var(--of-color-gray-200)));
  padding: 0;
  user-select: none;
}

.of-th {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--of-spacing-1);
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-text-secondary, var(--of-color-text-secondary, var(--of-color-gray-500)));
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  transition: var(--of-transition-fast);
}

.of-th--active {
  color: var(--of-text-primary, var(--of-color-text-primary, var(--of-color-gray-700)));
}

.of-th:hover {
  color: var(--of-text-primary, var(--of-color-text-primary, var(--of-color-gray-700)));
}

.of-th:focus-visible,
.of-th-add:focus-visible {
  outline: 2px solid var(--of-border-active, var(--of-border-strong, var(--of-color-gray-300)));
  outline-offset: -2px;
}

.of-th-checkbox {
  width: 20px;
  flex-shrink: 0;
  flex-grow: 0;
  cursor: default;
}

.of-th-checkbox__label {
  display: inline-flex;
  align-items: center;
}

.of-th-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.of-th-sort-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.of-sort-icon-active {
  color: var(--of-text-secondary, var(--of-color-text-secondary, var(--of-color-gray-500)));
}

.of-sort-icon-idle {
  color: var(--of-text-tertiary, var(--of-color-text-tertiary, var(--of-color-gray-300)));
  opacity: 0;
}

.of-th:hover .of-sort-icon-idle {
  opacity: 1;
}

.of-checkbox {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: var(--of-text-secondary, var(--of-color-text-secondary, var(--of-color-gray-500)));
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

/* Column resize handle */
.of-th-resizer {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  z-index: var(--of-z-base);
}

.of-th-resizer:hover {
  background: var(--of-border-active, var(--of-border-strong, var(--of-color-gray-300)));
}

.of-th-add {
  flex-shrink: 0;
  flex-grow: 0;
  justify-content: center;
  color: var(--of-text-tertiary, var(--of-color-text-tertiary, var(--of-color-gray-400)));
  cursor: pointer;
  border-left: 1px solid var(--of-border-divider, var(--of-border-subtle, var(--of-color-gray-200)));
}

.of-th-add:hover {
  color: var(--of-text-primary, var(--of-color-text-primary, var(--of-color-gray-700)));
  background: var(--of-surface-muted, var(--of-color-bg-hover, var(--of-color-gray-100)));
}
</style>
