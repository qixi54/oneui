<script setup lang="ts">
import { computed, type CSSProperties, type Component } from "vue";
import type { TableColumn, ColorMap, Density } from "../../types";
import {
  DEFAULT_PRIORITY_MAP,
  DEFAULT_STATUS_MAP,
  resolveBadge,
  mergeColorMap,
} from "../../composables/useBadge";

type TableRow = Record<string, unknown> & { id: string };

export interface RowActionItem {
  key: string;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  icon?: string | Component;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    row: TableRow;
    rowKey?: string;
    selected?: boolean;
    selectable?: boolean;
    columns: TableColumn[];
    density?: Density;
    /**
     * 优先级颜色映射，与内置默认映射合并（传入优先）
     */
    priorityColorMap?: ColorMap;
    /**
     * 状态颜色映射，与内置默认映射合并（传入优先）
     */
    statusColorMap?: ColorMap;
    showRowActions?: boolean;
    rowActionItems?: RowActionItem[];
  }>(),
  {
    rowKey: "id",
    selected: false,
    selectable: true,
    density: "standard",
    priorityColorMap: undefined,
    statusColorMap: undefined,
    showRowActions: true,
    rowActionItems: () => [],
  },
);

const emit = defineEmits<{
  select: [id: string];
  click: [row: TableRow];
}>();

const DENSITY_LAYOUT: Record<
  Density,
  {
    rowHeight: number;
    cellPaddingX: number;
    cellPaddingY: number;
    fillMinWidth: number;
  }
> = {
  compact: {
    rowHeight: 36,
    cellPaddingX: 10,
    cellPaddingY: 6,
    fillMinWidth: 180,
  },
  standard: {
    rowHeight: 44,
    cellPaddingX: 12,
    cellPaddingY: 8,
    fillMinWidth: 220,
  },
  comfortable: {
    rowHeight: 52,
    cellPaddingX: 14,
    cellPaddingY: 10,
    fillMinWidth: 240,
  },
};

const densityMetrics = computed(() => DENSITY_LAYOUT[props.density]);
const rowStyle = computed<CSSProperties>(() => ({
  minHeight: `${densityMetrics.value.rowHeight}px`,
}));
const cellStyle = computed<CSSProperties>(() => ({
  padding: `${densityMetrics.value.cellPaddingY}px ${densityMetrics.value.cellPaddingX}px`,
}));

function colStyle(col: TableColumn) {
  const padding = cellStyle.value;
  if (col.width === "fill") {
    const minWidth = `${col.minWidth ?? densityMetrics.value.fillMinWidth}px`;
    return { ...padding, flex: `1 1 ${minWidth}`, minWidth };
  }
  return { ...padding, width: `${col.width}px`, flexShrink: "0", flexGrow: "0" };
}

const mergedPriorityMap = computed(() =>
  mergeColorMap(DEFAULT_PRIORITY_MAP, props.priorityColorMap),
);
const mergedStatusMap = computed(() => mergeColorMap(DEFAULT_STATUS_MAP, props.statusColorMap));

function getPriorityBadge(priority: string) {
  return resolveBadge(priority, mergedPriorityMap.value);
}

function getStatusBadge(status: string) {
  return resolveBadge(status, mergedStatusMap.value);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getCellRawValue(col: TableColumn): unknown {
  return props.row[col.key];
}

function getCellValue(col: TableColumn): string {
  const val = getCellRawValue(col);
  return val != null ? String(val) : "-";
}

function getCellString(col: TableColumn): string {
  const val = getCellRawValue(col);
  return typeof val === "string" ? val : "";
}

function getRowId(): string {
  const value = props.row[props.rowKey];
  return value != null ? String(value) : "";
}

function handleRowKeyDown(event: KeyboardEvent) {
  if (event.target !== event.currentTarget) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  emit("click", props.row);
}

function handleActionClick(action: RowActionItem, event: MouseEvent) {
  event.stopPropagation();
  if (action.disabled) return;
  action.onClick();
}

function handleActionKeydown(action: RowActionItem, event: KeyboardEvent) {
  event.stopPropagation();
  if (action.disabled) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  action.onClick();
}
</script>

<template>
  <div
    class="of-table-row"
    :class="{ 'of-table-row--selected': selected }"
    role="row"
    tabindex="0"
    :aria-selected="selected || undefined"
    :style="rowStyle"
    @click="emit('click', row)"
    @keydown="handleRowKeyDown"
  >
    <!-- Checkbox 列 -->
    <div
      v-if="selectable"
      class="of-td of-td-checkbox"
      role="gridcell"
      :style="cellStyle"
      @click.stop
    >
      <label class="of-checkbox-label" :for="`of-table-row-checkbox-${getRowId()}`">
        <input
          :id="`of-table-row-checkbox-${getRowId()}`"
          type="checkbox"
          class="of-checkbox"
          :checked="selected"
          @change="emit('select', getRowId())"
        />
        <span class="of-sr-only">选择当前行</span>
      </label>
    </div>

    <!-- 数据列 -->
    <div v-for="col in columns" :key="col.key" class="of-td" role="gridcell" :style="colStyle(col)">
      <slot name="cell" :row="row" :col="col">
        <!-- 状态列 -->
        <template v-if="col.key === 'status'">
          <span class="of-badge" :style="getStatusBadge(getCellString(col)).style">
            {{ getStatusBadge(getCellString(col)).label }}
          </span>
        </template>

        <!-- 优先级列 -->
        <template v-else-if="col.key === 'priority'">
          <span class="of-badge" :style="getPriorityBadge(getCellString(col)).style">
            {{ getPriorityBadge(getCellString(col)).label }}
          </span>
        </template>

        <!-- 角色列 -->
        <template v-else-if="col.key === 'role'">
          <span v-if="getCellString(col)" class="of-badge of-badge--role">
            {{ getCellString(col) }}
          </span>
          <span v-else class="of-td-empty">-</span>
        </template>

        <!-- 更新时间列 -->
        <template v-else-if="col.key === 'updatedAt'">
          <span class="of-td-text">{{ formatDate(getCellString(col)) }}</span>
        </template>

        <!-- 任务ID列 -->
        <template v-else-if="col.key === 'id'">
          <span class="of-td-id">{{ getRowId() }}</span>
        </template>

        <!-- 标题列 -->
        <template v-else-if="col.key === 'title'">
          <span class="of-td-title">{{ getCellValue(col) }}</span>
        </template>

        <!-- 通用列 -->
        <template v-else>
          <span class="of-td-text">{{ getCellValue(col) }}</span>
        </template>
      </slot>
    </div>

    <div
      v-if="showRowActions && rowActionItems.length"
      class="of-table-row__actions"
      aria-label="行快捷操作"
      @click.stop
    >
      <slot
        name="row-actions"
        :row="row"
        :row-id="getRowId()"
        :items="rowActionItems"
        :open-detail="() => emit('click', row)"
      >
        <button
          v-for="action in rowActionItems"
          :key="action.key"
          type="button"
          class="of-table-row__action-btn"
          :class="{ 'of-table-row__action-btn--danger': action.variant === 'danger' }"
          :disabled="action.disabled"
          @click.stop="handleActionClick(action, $event)"
          @keydown="handleActionKeydown(action, $event)"
        >
          <component :is="action.icon" v-if="action.icon" class="of-table-row__action-icon" />
          <span>{{ action.label }}</span>
        </button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.of-table-row {
  --of-table-row-surface: transparent;
  --of-table-row-hover-surface: var(--of-surface-muted, var(--of-color-gray-50));
  --of-table-row-selected-surface: var(--of-surface-selected, var(--of-color-gray-100));
  --of-table-row-border: var(--of-border-subtle, var(--of-color-gray-100));
  --of-table-row-focus-ring: var(--of-border-strong, var(--of-color-gray-300));
  --of-table-row-text-primary: var(--of-text-primary, var(--of-color-gray-700));
  --of-table-row-text-secondary: var(--of-text-secondary, var(--of-color-gray-500));
  --of-table-row-text-tertiary: var(--of-text-tertiary, var(--of-color-gray-300));
  --of-table-row-action-surface: var(--of-surface-elevated, var(--of-color-bg-elevated));
  --of-table-row-action-hover-surface: var(--of-surface-selected, var(--of-color-gray-100));
  --of-table-row-action-border: var(--of-border-subtle, var(--of-color-gray-200));
  --of-table-row-action-border-hover: var(--of-border-strong, var(--of-color-gray-300));
  --of-table-row-action-text: var(--of-text-secondary, var(--of-color-gray-600));
  --of-table-row-action-text-hover: var(--of-text-primary, var(--of-color-gray-800));
  --of-table-row-action-danger-text: var(--of-error-text, var(--of-color-error-600));
  --of-table-row-action-danger-hover-surface: var(--of-surface-muted, var(--of-color-gray-50));
  display: flex;
  align-items: center;
  position: relative;
  background: var(--of-table-row-surface);
  border-bottom: 1px solid var(--of-table-row-border);
  cursor: pointer;
  transition: var(--of-transition-fast);
}

.of-table-row:hover {
  background: var(--of-table-row-hover-surface);
}

.of-table-row:focus-visible {
  outline: 2px solid var(--of-table-row-focus-ring);
  outline-offset: -2px;
}

.of-table-row--selected {
  background: var(--of-table-row-selected-surface);
}

.of-td {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--of-table-row-text-primary);
  overflow: hidden;
  box-sizing: border-box;
}

.of-td-checkbox {
  width: 20px;
  flex-shrink: 0;
  flex-grow: 0;
}

.of-checkbox {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: var(--of-table-row-text-secondary);
  flex-shrink: 0;
}

.of-checkbox-label {
  display: inline-flex;
  align-items: center;
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

.of-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1.4;
}

.of-badge--role {
  background: var(--of-surface-muted, var(--of-color-gray-100));
  color: var(--of-table-row-text-secondary);
}

.of-td-id {
  font-size: 12px;
  color: var(--of-table-row-text-secondary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.of-td-title {
  font-size: 13px;
  color: var(--of-table-row-text-primary);
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.of-td-text {
  font-size: 13px;
  color: var(--of-table-row-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.of-td-empty {
  color: var(--of-table-row-text-tertiary);
  font-size: 13px;
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
.of-table-row--selected .of-table-row__actions {
  opacity: 1;
  pointer-events: auto;
}

.of-table-row__action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1px solid var(--of-table-row-action-border);
  border-radius: 999px;
  background: var(--of-table-row-action-surface);
  color: var(--of-table-row-action-text);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: var(--of-transition-fast);
}

.of-table-row__action-btn:hover:not(:disabled),
.of-table-row__action-btn:focus-visible:not(:disabled) {
  background: var(--of-table-row-action-hover-surface);
  color: var(--of-table-row-action-text-hover);
  border-color: var(--of-table-row-action-border-hover);
}

.of-table-row__action-btn--danger {
  color: var(--of-table-row-action-danger-text);
}

.of-table-row__action-btn--danger:hover:not(:disabled),
.of-table-row__action-btn--danger:focus-visible:not(:disabled) {
  background: var(--of-table-row-action-danger-hover-surface);
  border-color: var(--of-table-row-action-border);
}

.of-table-row__action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.of-table-row__action-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
</style>
