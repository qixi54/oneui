<script setup lang="ts" generic="T extends { id: string } & Record<string, any>">
import { ref, computed, toRef, watch } from "vue";
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
     * - `undefined`（默认）：自动判断，行数 >= virtualThreshold 时启用
     */
    virtual?: boolean;
    /**
     * 自动启用虚拟滚动的行数阈值（默认 100）。
     * 仅在 `virtual` prop 未传时生效。
     */
    virtualThreshold?: number;
    /**
     * 只读模式。为 true 时，selectable 和 addable 自动降为 false，
     * 即使调用方显式传了 true 也会被覆盖。
     */
    readonly?: boolean;
  }>(),
  {
    selectable: true,
    addable: true,
    rowKey: "id",
    virtualThreshold: 100,
    readonly: false,
  },
);

const emit = defineEmits<{
  "row-click": [row: any];
  "row-click-record": [record: DataRecord];
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

// Sync input data with useTable — watch only fires on change, not on setup
watch(normalizedData, (newRows) => {
  setData(newRows);
}, { deep: false });

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
const GROUP_HEADER_HEIGHT = 36;
const DATA_ROW_HEIGHT = 44;
const scrollContainerRef = ref<HTMLElement | null>(null);

/**
 * 是否启用虚拟滚动：
 * - props.virtual 明确传 true/false 时，以 prop 为准（手动覆盖）
 * - 未传 prop 时自动判断：行数 >= props.virtualThreshold 则启用
 */
const useVirtual = computed(() => {
  if (props.virtual !== undefined) return props.virtual;
  return groupedItems.value.length >= props.virtualThreshold;
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

// ── Readonly Overrides ──
const effectiveSelectable = computed(() => props.readonly ? false : props.selectable);
const effectiveAddable = computed(() => props.readonly ? false : props.addable);

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

watch(selectedIdsArray, (ids) => {
  emit("selection-change", ids);
}, { immediate: false });

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
    emit("row-click-record", anyRow.__record);
    emit("row-click", anyRow.__record);
    return;
  }
  emit("row-click", row);
}

// ── Shared Row Prop Builders (FE-00056 去重) ──
function groupRowProps(item: any) {
  return {
    groupKey: item.__groupKey,
    count: item.__groupCount,
    collapsed: collapsedGroups.value.has(item.__groupKey),
    colorMap: props.groupColorMap,
    selectable: effectiveSelectable.value,
  };
}

function dataRowProps(item: T) {
  return {
    row: item,
    rowKey: props.rowKey,
    selected: selectedRows.value.has(getRowId(item)),
    selectable: effectiveSelectable.value,
    columns: resolvedColumns.value,
    priorityColorMap: props.priorityColorMap,
    statusColorMap: props.statusColorMap,
  };
}
</script>

<template>
  <div class="of-data-table" role="grid">
    <TableHeaderRow
      :columns="resolvedColumns"
      :selectable="effectiveSelectable"
      :sort-key="sort.field ?? ''"
      :sort-order="sort.order ?? 'asc'"
      :all-selected="isAllSelected"
      :indeterminate="indeterminate"
      @sort="toggleSort"
      @select-all="handleSelectAll"
    />

    <div ref="scrollContainerRef" class="of-data-table-scroll-container">
      <!-- 虚拟滚动模式：行数 >= virtualThreshold 或手动 virtual=true -->
      <template v-if="useVirtual">
        <div :style="{ height: totalHeight + 'px', position: 'relative' }">
          <div :style="{ transform: `translateY(${offsetY}px)` }">
            <template v-for="{ data: item } in visibleItems" :key="item.id">
              <TableGroupRow
                v-if="isGroupHeader(item)"
                v-bind="groupRowProps(item)"
                @toggle="toggleGroup(item.__groupKey)"
              />
              <TableDataRow
                v-else
                v-bind="dataRowProps(item as T)"
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

      <!-- 普通渲染模式：行数 < virtualThreshold，支持 Ctrl+F 全文搜索 -->
      <template v-else>
        <template v-for="item in groupedItems" :key="item.id">
          <TableGroupRow
            v-if="isGroupHeader(item)"
            v-bind="groupRowProps(item)"
            @toggle="toggleGroup(item.__groupKey)"
          />
          <TableDataRow
            v-else
            v-bind="dataRowProps(item as T)"
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

    <NewRowBtn v-if="effectiveAddable" @click="emit('add-row')" />
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

@media (max-width: 768px) {
  .of-data-table-scroll-container {
    max-height: 100dvh;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
