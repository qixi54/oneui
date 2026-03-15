<script setup lang="ts">
import { ref, computed, watch } from "vue";
import TableHeaderRow from "./TableHeaderRow.vue";
import TableDataRow from "./TableDataRow.vue";
import TableGroupRow from "./TableGroupRow.vue";
import NewRowBtn from "./NewRowBtn.vue";
import FieldCell, { type FieldDef as CellFieldDef, type CellValue } from "./FieldCell.vue";
import { useInlineEdit } from "@/composables/useInlineEdit";
import { useVirtualList } from "@/composables/useVirtualList";
import type {
  Task,
  TableColumn,
  ColorMap,
  DataRecord,
  TableSchema,
  ViewConfig,
  FieldDef as SchemaFieldDef,
} from "../../types";

type DataTableRow = Record<string, unknown> & { id: string; __record?: DataRecord };

type GroupHeaderItem = {
  __type: 'group-header';
  __groupKey: string;
  __groupCount: number;
  id: string;
};

type GroupedListItem =
  | (DataTableRow & { __type: 'data-row' })
  | GroupHeaderItem;

const GROUP_HEADER_HEIGHT = 36;
const DATA_ROW_HEIGHT = 44;

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
    /** 优先级颜色映射，透传给每一行 */
    priorityColorMap?: ColorMap;
    /** 状态颜色映射，透传给每一行 */
    statusColorMap?: ColorMap;
    /** 分组字段名，如 "status" */
    groupBy?: string;
    /** 分组标题的 Badge 颜色映射 */
    groupColorMap?: ColorMap;
  }>(),
  {
    selectable: true,
    addable: true,
    rowKey: "id",
  },
);

const emit = defineEmits<{
  "row-click": [row: Task | DataRecord];
  "row-click-record": [record: DataRecord];
  "add-row": [];
  "selection-change": [ids: string[]];
  "cell-edit": [payload: { rowId: string; fieldId: string; value: unknown }];
}>();

const { commit: commitInlineEdit } = useInlineEdit();

function fieldTypeToColumnType(field: SchemaFieldDef): TableColumn["type"] {
  if (field.type === "number" || field.type === "date") return field.type;
  if (field.type === "select") return "status";
  return "string";
}

function fieldToColumn(field: SchemaFieldDef): TableColumn {
  return {
    key: field.id,
    label: field.name,
    width: field.width,
    type: fieldTypeToColumnType(field),
  };
}

const defaultColumns: TableColumn[] = [
  { key: "id", label: "任务ID", width: 100, align: "left" },
  { key: "title", label: "标题", width: "fill", align: "left" },
  { key: "status", label: "状态", width: 90, align: "left" },
  { key: "role", label: "负责角色", width: 90, align: "left" },
  { key: "priority", label: "优先级", width: 70, align: "left" },
  { key: "updatedAt", label: "更新时间", width: 100, align: "left" },
];

const resolvedColumns = computed<TableColumn[]>(() => {
  if (props.columns?.length) return props.columns;
  if (props.schema?.fields?.length) {
    const visibleFields = props.view?.visibleFields?.length
      ? props.schema.fields.filter((f) => props.view?.visibleFields.includes(f.id))
      : props.schema.fields;
    return visibleFields.filter((f) => !f.hidden).map(fieldToColumn);
  }
  return defaultColumns;
});

const tableRows = computed<DataTableRow[]>(() => {
  if (props.records?.length) {
    return props.records.map((record) => ({
      id: record.id,
      ...record.fields,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      __record: record,
    }));
  }
  return (props.tasks ?? []) as unknown as DataTableRow[];
});

// ── 排序状态 ──────────────────────────────────────────────────────────────────
const sortKey = ref("");
const sortOrder = ref<"asc" | "desc">("asc");

function handleSort(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
}

const sortedRows = computed(() => {
  if (!sortKey.value) return tableRows.value;
  return [...tableRows.value].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sortKey.value];
    const bv = (b as Record<string, unknown>)[sortKey.value];
    const as = av != null ? String(av) : "";
    const bs = bv != null ? String(bv) : "";
    const cmp = as.localeCompare(bs, "zh-CN");
    return sortOrder.value === "asc" ? cmp : -cmp;
  });
});

// ── 分组状态 ──
const collapsedGroups = ref(new Set<string>());

function toggleGroup(groupKey: string) {
  const next = new Set(collapsedGroups.value);
  if (next.has(groupKey)) next.delete(groupKey);
  else next.add(groupKey);
  collapsedGroups.value = next;
}

watch(() => props.groupBy, () => {
  collapsedGroups.value = new Set();
});

// ── 分组计算层 ──
const groupedItems = computed<GroupedListItem[]>(() => {
  const rows = sortedRows.value;
  const field = props.groupBy;

  if (!field) {
    return rows.map((r) => ({ ...r, __type: 'data-row' as const }));
  }

  const groupOrder: string[] = [];
  const groups = new Map<string, DataTableRow[]>();

  for (const row of rows) {
    const raw = (row as Record<string, unknown>)[field];
    const key = raw != null ? String(raw) : '';
    if (!groups.has(key)) {
      groupOrder.push(key);
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  }

  const result: GroupedListItem[] = [];
  const collapsed = collapsedGroups.value;

  for (const key of groupOrder) {
    const groupRows = groups.get(key)!;
    result.push({
      __type: 'group-header',
      __groupKey: key,
      __groupCount: groupRows.length,
      id: `__group__${key}`,
    });
    if (!collapsed.has(key)) {
      for (const row of groupRows) {
        result.push({ ...row, __type: 'data-row' });
      }
    }
  }

  return result;
});

function isGroupHeader(item: GroupedListItem): item is GroupHeaderItem {
  return item.__type === 'group-header';
}

const scrollContainerRef = ref<HTMLElement | null>(null);
const { visibleItems: visibleRows, totalHeight, offsetY } = useVirtualList({
  items: groupedItems,
  itemHeight: (index: number) => {
    const item = groupedItems.value[index];
    return item?.__type === 'group-header' ? GROUP_HEADER_HEIGHT : DATA_ROW_HEIGHT;
  },
  overscan: 5,
  containerRef: scrollContainerRef,
});

function getRowId(row: DataTableRow): string {
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

function getCellValue(row: DataTableRow, colKey: string): CellValue {
  return row[colKey] as CellValue;
}

// ── 选中状态 ──────────────────────────────────────────────────────────────────
const selectedIds = ref<string[]>([]);

const allSelected = computed(
  () => tableRows.value.length > 0 && selectedIds.value.length === tableRows.value.length,
);
const indeterminate = computed(
  () => selectedIds.value.length > 0 && selectedIds.value.length < tableRows.value.length,
);

function handleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = tableRows.value.map((t) => getRowId(t));
  }
}

function handleSelect(id: string) {
  const idx = selectedIds.value.indexOf(id);
  if (idx === -1) {
    selectedIds.value = [...selectedIds.value, id];
  } else {
    selectedIds.value = selectedIds.value.filter((i) => i !== id);
  }
}

watch(
  selectedIds,
  (val) => {
    emit("selection-change", val);
  },
  { deep: true },
);

function handleRowClick(row: DataTableRow) {
  if (row.__record) {
    emit("row-click-record", row.__record);
    emit("row-click", row.__record);
    return;
  }
  emit("row-click", row as unknown as Task);
}
</script>

<template>
  <div class="of-data-table">
    <TableHeaderRow
      :columns="resolvedColumns"
      :selectable="selectable"
      :sort-key="sortKey"
      :sort-order="sortOrder"
      :all-selected="allSelected"
      :indeterminate="indeterminate"
      @sort="handleSort"
      @select-all="handleSelectAll"
    />

    <div ref="scrollContainerRef" class="of-data-table-scroll-container">
      <div :style="{ height: totalHeight + 'px', position: 'relative' }">
        <div :style="{ transform: `translateY(${offsetY}px)` }">
          <template v-for="{ data: item } in visibleRows" :key="item.id">
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
              :row="item"
              :row-key="rowKey"
              :selected="selectedIds.includes(getRowId(item as DataTableRow))"
              :columns="resolvedColumns"
              :priority-color-map="priorityColorMap"
              :status-color-map="statusColorMap"
              @select="handleSelect"
              @click="handleRowClick(item as DataTableRow)"
            >
              <template v-if="fieldDefs?.length" #cell="{ row: slotRow, col }">
                <FieldCell
                  :row-id="String(slotRow[rowKey])"
                  :field="getFieldDef(col.key)"
                  :value="getCellValue(slotRow, col.key)"
                  @commit="onCellCommit"
                />
              </template>
            </TableDataRow>
          </template>
        </div>
      </div>
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
