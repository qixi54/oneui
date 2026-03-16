<script setup lang="ts" generic="T extends { id: string } & Record<string, any>">
import { ref, computed, toRef, watchEffect } from "vue";
import TableHeaderRow from "./TableHeaderRow.vue";
import TableDataRow from "./TableDataRow.vue";
import TableGroupRow from "./TableGroupRow.vue";
import NewRowBtn from "./NewRowBtn.vue";
import FieldCell, { type FieldDef as CellFieldDef, type CellValue } from "./FieldCell.vue";
import { useInlineEdit } from "@/composables/useInlineEdit";
import { useVirtualList } from "@/composables/useVirtualList";
import { useTable } from "@/composables/useTable";
import { useTableGroup } from "@/composables/useTableGroup";
import { useTableData } from "@/composables/useTableData";
import { useTableColumns } from "@/composables/useTableColumns";
import type {
  Task,
  TableColumn,
  ColorMap,
  DataRecord,
  TableSchema,
  ViewConfig,
} from "../../types";

const props = withDefaults(
  defineProps<{
    tasks?: Task[];
    records?: DataRecord[];
    schema?: TableSchema;
    view?: ViewConfig;
    columns?: TableColumn[];
    fieldDefs?: CellFieldDef[];
    rowKey?: string;
    selectable?: boolean;
    addable?: boolean;
    /** 优先级颜色映射 */
    priorityColorMap?: ColorMap;
    /** 状态颜色映射 */
    statusColorMap?: ColorMap;
    /** 分组字段名，如 "status" */
    groupBy?: string;
    /** 分组标题的 Badge 颜色映射 */
    groupColorMap?: ColorMap;
    /**
     * 手动控制虚拟滚动开关。
     * - `true`：强制启用虚拟滚动
     * - `false`：强制关闭虚拟滚动
     * - `undefined`（默认）：自动判断，行数 > VIRTUAL_SCROLL_THRESHOLD 时启用
     */
    virtual?: boolean;
  }>(),
  {
    selectable: true,
    addable: true,
    rowKey: "id",
  },
);

const emit = defineEmits<{
  "row-click": [row: any];
  "add-row": [];
  "selection-change": [ids: (string | number)[]];
  "cell-edit": [payload: { rowId: string; fieldId: string; value: unknown }];
}>();

const { commit: commitInlineEdit } = useInlineEdit();

// ── Normalize Data ──
const { rows: normalizedData } = useTableData<T>({
  tasks: toRef(props, "tasks"),
  records: toRef(props, "records"),
});

// ── Column Logic ──
const { columns: resolvedColumns } = useTableColumns({
  columns: toRef(props, "columns"),
  schema: toRef(props, "schema"),
  view: toRef(props, "view"),
});

// ── Brain 1: Table Management (Sort/Select/Pagination) ──
const {
  data: sortedData,
  sort,
  toggleSort,
  selectedRows,
  toggleSelectAll,
  toggleRowSelection,
  isAllSelected,
  setData,
} = useTable<T>({
  data: normalizedData.value,
  pageSize: 999999, // Disable pagination inside DataTable for now or manage it externally
});

// Sync input data with useTable
watchEffect(() => {
  setData(normalizedData.value);
});

// ── Brain 2: Grouping ──
const {
  groupedItems,
  collapsedGroups,
  toggleGroup,
  isGroupHeader,
} = useTableGroup<T>({
  data: sortedData, // Consumes sorted data from Brain 1
  groupBy: toRef(props, "groupBy"),
});

// ── Virtual List ──
const VIRTUAL_SCROLL_THRESHOLD = 100;
const GROUP_HEADER_HEIGHT = 36;
const DATA_ROW_HEIGHT = 44;
const scrollContainerRef = ref<HTMLElement | null>(null);

/**
 * 是否启用虚拟滚动：
 * - props.virtual 明确传 true/false 时，以 prop 为准（手动覆盖）
 * - 未传 prop 时自动判断：行数 > VIRTUAL_SCROLL_THRESHOLD 则启用
 */
const useVirtual = computed(() => {
  if (props.virtual !== undefined) return props.virtual;
  return groupedItems.value.length > VIRTUAL_SCROLL_THRESHOLD;
});

const { visibleItems, totalHeight, offsetY } = useVirtualList({
  items: groupedItems,
  itemHeight: (index: number) => {
    const item = groupedItems.value[index];
    return isGroupHeader(item) ? GROUP_HEADER_HEIGHT : DATA_ROW_HEIGHT;
  },
  overscan: 5,
  containerRef: scrollContainerRef,
});

// ── Selection Proxies ──
const selectedIdsArray = computed(() => Array.from(selectedRows.value));
const indeterminate = computed(() => selectedRows.value.size > 0 && !isAllSelected.value);

function handleSelectAll() {
  toggleSelectAll(sortedData.value);
}

function handleSelect(id: string | number) {
  const row = sortedData.value.find(r => r[props.rowKey] === id);
  if (row) toggleRowSelection(row, 0); // index doesn't matter for id-based selection
}

watchEffect(() => {
  emit("selection-change", selectedIdsArray.value);
});

// ── Event Handlers ──
function getRowId(row: T): string {
  const value = row[props.rowKey];
  return value != null ? String(value) : "";
}

function getFieldDef(colKey: string): CellFieldDef {
  return props.fieldDefs?.find((f) => f.id === colKey) ?? {
    id: colKey,
    type: "text",
    label: colKey,
  };
}

function onCellCommit(rowId: string, fieldId: string, value: unknown) {
  commitInlineEdit(rowId, fieldId, value);
  emit("cell-edit", { rowId, fieldId, value });
}

function handleRowClick(row: T) {
  const anyRow = row as any;
  if (anyRow.__record) {
    emit("row-click", anyRow.__record);
    return;
  }
  emit("row-click", row);
}
</script>

<template>
  <div class="of-data-table">
    <TableHeaderRow
      :columns="resolvedColumns"
      :selectable="selectable"
      :sort-key="sort.field ?? ''"
      :sort-order="sort.order ?? 'asc'"
      :all-selected="isAllSelected"
      :indeterminate="indeterminate"
      @sort="toggleSort"
      @select-all="handleSelectAll"
    />

    <div ref="scrollContainerRef" class="of-data-table-scroll-container">
      <!-- 虚拟滚动模式：行数 > 100 或手动 virtual=true -->
      <template v-if="useVirtual">
        <div :style="{ height: totalHeight + 'px', position: 'relative' }">
          <div :style="{ transform: `translateY(${offsetY}px)` }">
            <template v-for="{ data: item } in visibleItems" :key="item.id">
              <TableGroupRow
                v-if="isGroupHeader(item)"
                :group-key="item.__groupKey"
                :count="item.__groupCount"
                :collapsed="collapsedGroups.has(item.__groupKey)"
                :color-map="groupColorMap"
                :selectable="selectable"
                @toggle="toggleGroup(item.__groupKey)"
              />
              <TableDataRow
                v-else
                :row="(item as T)"
                :row-key="rowKey"
                :selected="selectedRows.has(getRowId(item as T))"
                :selectable="selectable"
                :columns="resolvedColumns"
                :priority-color-map="priorityColorMap"
                :status-color-map="statusColorMap"
                @select="handleSelect"
                @click="handleRowClick(item as T)"
              >
                <template v-if="fieldDefs?.length" #cell="{ row: slotRow, col }">
                  <FieldCell
                    :row-id="getRowId(slotRow as T)"
                    :field="getFieldDef(col.key)"
                    :value="(slotRow[col.key] as CellValue)"
                    @commit="onCellCommit"
                  />
                </template>
              </TableDataRow>
            </template>
          </div>
        </div>
      </template>

      <!-- 普通渲染模式：行数 ≤ 100，支持 Ctrl+F 全文搜索 -->
      <template v-else>
        <template v-for="item in groupedItems" :key="item.id">
          <TableGroupRow
            v-if="isGroupHeader(item)"
            :group-key="item.__groupKey"
            :count="item.__groupCount"
            :collapsed="collapsedGroups.has(item.__groupKey)"
            :color-map="groupColorMap"
            :selectable="selectable"
            @toggle="toggleGroup(item.__groupKey)"
          />
          <TableDataRow
            v-else
            :row="(item as T)"
            :row-key="rowKey"
            :selected="selectedRows.has(getRowId(item as T))"
            :selectable="selectable"
            :columns="resolvedColumns"
            :priority-color-map="priorityColorMap"
            :status-color-map="statusColorMap"
            @select="handleSelect"
            @click="handleRowClick(item as T)"
          >
            <template v-if="fieldDefs?.length" #cell="{ row: slotRow, col }">
              <FieldCell
                :row-id="getRowId(slotRow as T)"
                :field="getFieldDef(col.key)"
                :value="(slotRow[col.key] as CellValue)"
                @commit="onCellCommit"
              />
            </template>
          </TableDataRow>
        </template>
      </template>
    </div>

    <NewRowBtn v-if="addable" @click="emit('add-row')" />
  </div>
</template>

<style scoped>
.of-data-table {
  width: 100%;
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-lg);
  overflow: hidden;
  background: var(--of-color-bg-elevated);
  font-family: var(--of-font-sans);
}

.of-data-table-scroll-container {
  max-height: 600px;
  overflow-y: auto;
}
</style>
