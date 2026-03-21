<script setup lang="ts" generic="T extends { id: string } & Record<string, unknown>">
import {
  ref,
  computed,
  toRef,
  watch,
  defineAsyncComponent,
  type ComponentPublicInstance,
  type CSSProperties,
} from "vue";
import TableHeaderRow from "./TableHeaderRow.vue";
import TableDataRow from "./TableDataRow.vue";
import TableGroupRow from "./TableGroupRow.vue";
import NewRowBtn from "./NewRowBtn.vue";
import MobileListView from "./MobileListView.vue";
import FieldCell, {
  type FieldDef as CellFieldDef,
  type CellValue,
} from "./FieldCell.vue";
import { useInlineEdit } from "@/composables/useInlineEdit";
import { useVirtualList } from "@/composables/useVirtualList";
import { useTable } from "@/composables/useTable";
import { useTableGroup, type GroupHeaderItem } from "@/composables/useTableGroup";
import { useTableData } from "@/composables/useTableData";
import { useTableColumns } from "@/composables/useTableColumns";
import { useColumnResize } from "@/composables/useColumnResize";
import { useKeyboardNavigation } from "@/composables/useKeyboardNavigation";
import { useBreakpoint } from "@/composables/useBreakpoint";
import { useFixedColumns } from "@/composables/useFixedColumns";
import { useRowDrag } from "@/composables/useRowDrag";
import { useDraftRows } from "@/composables/useDraftRows";
import type {
  Density,
  Task,
  TableColumn,
  ColorMap,
  DataRecord,
  TableSchema,
  ViewConfig,
  ActiveCell,
  AggregationConfig,
  GroupConfig,
  FieldType,
} from "../../types";

// ── Props ──────────────────────────────────────────────────────────────────

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
    priorityColorMap?: ColorMap;
    statusColorMap?: ColorMap;
    groupBy?: string;
    groupColorMap?: ColorMap;
    virtual?: boolean;
    virtualThreshold?: number;
    readonly?: boolean;
    // ── New v2 props (all optional, backwards-compatible) ──
    /** Column keys to fix on the left side */
    fixedColumns?: string[];
    /** Enable column resize handles */
    enableResize?: boolean;
    /** Enable keyboard navigation (Arrow/Enter/Esc/Tab) */
    enableKeyboard?: boolean;
    /** Enable row drag-and-drop */
    enableRowDrag?: boolean;
    /** Enable cross-group drag */
    enableCrossGroupDrag?: boolean;
    /** Multi-level group configs (takes priority over groupBy) */
    groups?: GroupConfig[];
    /** Aggregation configs shown in group headers */
    aggregations?: AggregationConfig[];
    /** 启用字段管理交互（列头菜单、添加字段） */
    enableFieldManagement?: boolean;
    /** Density preset used for table, list, and detail affordances */
    density?: Density;
  }>(),
  {
    tasks: () => [],
    records: () => [],
    schema: undefined,
    view: undefined,
    columns: () => [],
    fieldDefs: () => [],
    selectable: true,
    addable: true,
    rowKey: "id",
    priorityColorMap: undefined,
    statusColorMap: undefined,
    groupBy: undefined,
    groupColorMap: undefined,
    virtual: undefined,
    virtualThreshold: 100,
    readonly: false,
    fixedColumns: () => [],
    enableResize: false,
    enableKeyboard: false,
    enableRowDrag: false,
    enableCrossGroupDrag: false,
    groups: () => [],
    aggregations: () => [],
    enableFieldManagement: false,
    density: "standard",
  },
);

// ── Events ─────────────────────────────────────────────────────────────────

const emit = defineEmits<{
  "row-click": [row: T | DataRecord];
  "row-click-record": [record: DataRecord];
  "add-row": [];
  "selection-change": [ids: (string | number)[]];
  "cell-edit": [payload: { rowId: string; fieldId: string; value: unknown }];
  // v2 events
  "column-resize": [payload: { colKey: string; width: number }];
  "active-cell-change": [cell: ActiveCell | null];
  "row-reorder": [payload: { rowId: string; beforeRowId: string | null }];
  "row-group-change": [payload: { rowId: string; groupFieldId: string; newValue: unknown }];
  "draft-commit": [payload: { draftId: string; record: DataRecord }];
  "draft-discard": [payload: { draftId: string }];
  "drafts-commit-all": [payload: { records: DataRecord[] }];
  paste: [payload: { startRowId: string; startColKey: string; data: string[][] }];
  "row-delete": [rowId: string];
  // schema 变更事件
  "schema-add-field": [fieldType: string];
  "schema-rename-field": [payload: { fieldId: string; newName: string }];
  "schema-change-field-type": [payload: { fieldId: string; newType: string }];
  "schema-hide-field": [fieldId: string];
  "schema-delete-field": [fieldId: string];
  "schema-duplicate-field": [fieldId: string];
}>();
const ColumnHeaderMenu = defineAsyncComponent(() => import("./ColumnHeaderMenu.vue"));
const FieldTypePicker = defineAsyncComponent(() => import("./FieldTypePicker.vue"));
const DetailSheet = defineAsyncComponent(() => import("./DetailSheet.vue"));

const TABLE_DENSITY_METRICS: Record<
  Density,
  {
    headerHeight: number;
    rowHeight: number;
    groupRowHeight: number;
    mobileCardPaddingX: number;
    mobileCardPaddingY: number;
    fillMinWidth: number;
  }
> = {
  compact: {
    headerHeight: 32,
    rowHeight: 36,
    groupRowHeight: 32,
    mobileCardPaddingX: 12,
    mobileCardPaddingY: 10,
    fillMinWidth: 180,
  },
  standard: {
    headerHeight: 36,
    rowHeight: 44,
    groupRowHeight: 36,
    mobileCardPaddingX: 16,
    mobileCardPaddingY: 12,
    fillMinWidth: 220,
  },
  comfortable: {
    headerHeight: 40,
    rowHeight: 52,
    groupRowHeight: 40,
    mobileCardPaddingX: 18,
    mobileCardPaddingY: 14,
    fillMinWidth: 240,
  },
};

const density = computed<Density>(() => props.density ?? "standard");
const densityMetrics = computed(() => TABLE_DENSITY_METRICS[density.value]);
const densityClass = computed(() => `of-data-table--${density.value}`);
const densityStyle = computed(() => ({
  "--of-data-table-group-row-height": `${densityMetrics.value.groupRowHeight}px`,
  "--of-data-table-mobile-card-padding-x": `${densityMetrics.value.mobileCardPaddingX}px`,
  "--of-data-table-mobile-card-padding-y": `${densityMetrics.value.mobileCardPaddingY}px`,
  "--of-data-table-new-row-padding-x": `${densityMetrics.value.mobileCardPaddingX}px`,
  "--of-data-table-new-row-padding-y": `${densityMetrics.value.mobileCardPaddingY}px`,
  "--of-data-table-fill-min-width": `${densityMetrics.value.fillMinWidth}px`,
}));

// ── Breakpoint ─────────────────────────────────────────────────────────────

const { isMobile } = useBreakpoint();
const detailSheetVisible = ref(false);
type RowWithRecord = T & { __record?: DataRecord };
const detailSheetRow = ref<RowWithRecord | null>(null);
const detailSheetTableRow = computed(() =>
  detailSheetRow.value as (Record<string, unknown> & { id: string }) | null,
);
type TableRowRecord = Record<string, unknown> & { id: string };

// ── Inline Edit ────────────────────────────────────────────────────────────

const inlineEdit = useInlineEdit();
const { commit: commitInlineEdit, editingCell } = inlineEdit;

// ── Normalize Data ─────────────────────────────────────────────────────────

const { rows: normalizedData } = useTableData<T>({
  tasks: toRef(props, "tasks"),
  records: toRef(props, "records"),
});

// ── Column Logic ───────────────────────────────────────────────────────────

const { columns: resolvedColumns } = useTableColumns({
  columns: toRef(props, "columns"),
  schema: toRef(props, "schema"),
  view: toRef(props, "view"),
});

// ── Column Resize ──────────────────────────────────────────────────────────

const {
  startResize,
  columnWidthOverrides,
  showResizeIndicator,
  resizeIndicatorX,
  autoFitColumn,
  resolvedWidth,
} = useColumnResize({
    columns: resolvedColumns,
    rows: normalizedData,
    density,
    onResize: (colKey, width) => emit("column-resize", { colKey, width }),
  });

// Apply resize overrides to columns
const effectiveColumns = computed<TableColumn[]>(() => {
  const overrides = columnWidthOverrides.value;
  return resolvedColumns.value.map((col) => {
    const overrideWidth = overrides.get(col.key);
    if (overrideWidth !== undefined) {
      return { ...col, width: overrideWidth };
    }
    if (col.width === "fill") {
      return {
        ...col,
        minWidth: col.minWidth ?? densityMetrics.value.fillMinWidth,
      };
    }
    if (typeof col.width === "number") {
      return col;
    }
    return { ...col, width: resolvedWidth(col.key) };
  });
});

// ── Brain 1: Table Management ──────────────────────────────────────────────

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
  pageSize: 999999,
});

watch(normalizedData, (newRows) => setData(newRows), { deep: false });

// ── Brain 2: Grouping ──────────────────────────────────────────────────────

const { groupedItems, collapsedGroups, toggleGroup, isGroupHeader } = useTableGroup<T>({
  data: sortedData,
  groupBy: toRef(props, "groupBy"),
  groups: toRef(props, "groups"),
  aggregations: toRef(props, "aggregations"),
});

// ── Virtual List ───────────────────────────────────────────────────────────

const scrollContainerRef = ref<HTMLElement | null>(null);
const tableContainerRef = ref<HTMLElement | null>(null);
const fixedContainerRef = ref<HTMLElement | null>(null);

const hasFixedColumns = computed(() => (props.fixedColumns?.length ?? 0) > 0);
const scrollLeft = ref(0);
const showFixedShadow = computed(() => scrollLeft.value > 0);

const {
  fixedColumns: fixedCols,
  scrollableColumns: scrollableCols,
  fixedWidth,
  handleScroll: handleFixedAreaScroll,
  handleFixedScroll,
  syncHover,
  isRowHovered,
} = useFixedColumns({
  columns: effectiveColumns,
  fixedColumnKeys: computed(() => props.fixedColumns ?? []),
  scrollContainerRef,
  fixedContainerRef,
});

const useVirtual = computed(() => {
  if (props.virtual !== undefined) return props.virtual;
  return groupedItems.value.length >= props.virtualThreshold;
});

const { visibleItems, totalHeight, offsetY, scrollToIndex, observeRow } = useVirtualList({
  items: groupedItems,
  itemHeight: (index: number) => {
    const item = groupedItems.value[index];
    return isGroupHeader(item)
      ? densityMetrics.value.groupRowHeight
      : densityMetrics.value.rowHeight;
  },
  overscan: 5,
  containerRef: scrollContainerRef,
  invalidateKey: density,
  measureRow: true,
});

// ── Keyboard Navigation ────────────────────────────────────────────────────

const dataRows = computed(() => groupedItems.value.filter((item) => !isGroupHeader(item)) as T[]);

const { activeCell, selectedRange, setActiveCell, handleKeyDown } = useKeyboardNavigation({
  columns: effectiveColumns,
  rows: dataRows,
  containerRef: tableContainerRef,
  editingCell,
  enabled: computed(() => props.enableKeyboard),
  onActivateEdit: (rowId, colKey) => inlineEdit.activate(rowId, colKey),
  onCancelEdit: () => inlineEdit.cancel(),
  onScrollToRow: (idx) => scrollToIndex(idx),
  getCellValue: (rowId, colKey) => {
    const row = dataRows.value.find((r) => r.id === rowId);
    if (!row) return "";
    const val = row[colKey];
    return val != null ? String(val) : "";
  },
  onPaste: (startRowId, startColKey, data) => {
    emit("paste", { startRowId, startColKey, data });
  },
});

watch(activeCell, (cell) => emit("active-cell-change", cell ?? null));

// ── Row Drag ───────────────────────────────────────────────────────────────

const {
  isDragging,
  draggedRowId,
  dropTargetId,
  dropPosition,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
} = useRowDrag<T>({
  processedItems: groupedItems,
  enableCrossGroupDrag: computed(() => props.enableCrossGroupDrag),
  groupFieldId: toRef(props, "groupBy"),
});

function onDragStart(e: DragEvent, item: T | GroupHeaderItem) {
  if (!props.enableRowDrag) return;
  handleDragStart(e, item);
}

function onDragOver(e: DragEvent, item: T | GroupHeaderItem) {
  if (!props.enableRowDrag) return;
  handleDragOver(e, item);
}

function onDrop(e: DragEvent, item: T | GroupHeaderItem) {
  if (!props.enableRowDrag) return;
  handleDrop(e, item, {
    onReorder: (payload) => emit("row-reorder", payload),
    onGroupChange: (payload) => emit("row-group-change", payload),
  });
}

// ── Draft Rows ─────────────────────────────────────────────────────────────

const {
  drafts,
  addDraft,
  commitAll: commitAllDrafts,
  discardAll: discardAllDrafts,
} = useDraftRows({
  schema: toRef(props, "schema"),
  groupFieldId: toRef(props, "groupBy"),
});

const hasDrafts = computed(() => drafts.value.size > 0);

function handleAddRow() {
  if (props.schema) {
    addDraft();
  } else {
    emit("add-row");
  }
}

function handleCommitAll() {
  const records = commitAllDrafts();
  if (records.length > 0) {
    emit("drafts-commit-all", { records });
  }
}

function handleDiscardAll() {
  discardAllDrafts();
}

// ── Schema / Field Management ─────────────────────────────────────────

const headerMenuState = ref<{
  visible: boolean;
  colKey: string;
  colLabel: string;
  fieldType?: FieldType;
  x: number;
  y: number;
}>({ visible: false, colKey: "", colLabel: "", x: 0, y: 0 });

const showAddFieldPicker = ref(false);

function normalizeFieldType(type?: CellFieldDef["type"]): FieldType | undefined {
  if (type === "multiselect") return "multi_select";
  return type;
}

function onHeaderContextMenu(event: MouseEvent, colKey: string) {
  const col = effectiveColumns.value.find((c) => c.key === colKey);
  const fieldDef = props.fieldDefs?.find((f) => f.id === colKey);
  headerMenuState.value = {
    visible: true,
    colKey,
    colLabel: col?.label ?? colKey,
    fieldType: normalizeFieldType(fieldDef?.type),
    x: event.clientX,
    y: event.clientY,
  };
}

function onHeaderDblClick(colKey: string) {
  const col = effectiveColumns.value.find((c) => c.key === colKey);
  headerMenuState.value = {
    visible: true,
    colKey,
    colLabel: col?.label ?? colKey,
    fieldType: normalizeFieldType(props.fieldDefs?.find((f) => f.id === colKey)?.type),
    x: 200,
    y: 100,
  };
}

function onSchemaRename(colKey: string, newName: string) {
  emit("schema-rename-field", { fieldId: colKey, newName });
}

function onSchemaChangeType(colKey: string, newType: string) {
  emit("schema-change-field-type", { fieldId: colKey, newType });
}

function onSchemaHide(colKey: string) {
  emit("schema-hide-field", colKey);
}

function onSchemaDelete(colKey: string) {
  emit("schema-delete-field", colKey);
}

function onSchemaDuplicate(colKey: string) {
  emit("schema-duplicate-field", colKey);
}

function onAddField() {
  showAddFieldPicker.value = true;
}

function onAddFieldSelect(type: string) {
  emit("schema-add-field", type);
  showAddFieldPicker.value = false;
}

// ── Readonly Overrides ─────────────────────────────────────────────────────

const effectiveSelectable = computed(() => (props.readonly ? false : props.selectable));
const effectiveAddable = computed(() => (props.readonly ? false : props.addable));

// ── Selection ──────────────────────────────────────────────────────────────

const selectedIdsArray = computed(() => Array.from(selectedRows.value));
const indeterminate = computed(() => selectedRows.value.size > 0 && !isAllSelected.value);

function handleSelectAll() {
  toggleSelectAll(sortedData.value);
}

function handleSelect(id: string | number) {
  const row = sortedData.value.find((r) => r[props.rowKey] === id);
  if (row) toggleRowSelection(row, 0);
}

watch(selectedIdsArray, (ids) => emit("selection-change", ids), { immediate: false });

// ── Event Handlers ─────────────────────────────────────────────────────────

function getRowId(row: T): string {
  const value = row[props.rowKey];
  return value != null ? String(value) : "";
}

function getFieldDef(colKey: string): CellFieldDef {
  return (
    props.fieldDefs?.find((f) => f.id === colKey) ?? {
      id: colKey,
      type: "text",
      label: colKey,
    }
  );
}

function onCellCommit(rowId: string, fieldId: string, value: unknown) {
  commitInlineEdit(rowId, fieldId, value);
  emit("cell-edit", { rowId, fieldId, value });
}

function handleRowClick(row: T) {
  if (isMobile.value) {
    detailSheetRow.value = row;
    detailSheetVisible.value = true;
    return;
  }
  const record = (row as RowWithRecord).__record;
  if (record) {
    emit("row-click-record", record);
    emit("row-click", record);
    return;
  }
  emit("row-click", row);
}

function handleRowKeyDown(event: KeyboardEvent, row: T) {
  if (event.target !== event.currentTarget) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  handleRowClick(row);
}

function getRowValue(row: Record<string, unknown>, colKey: string): CellValue {
  return row[colKey] as CellValue;
}

function resolveObservedElement(el: Element | ComponentPublicInstance | null): HTMLElement | null {
  if (!el) return null;
  if (el instanceof HTMLElement) return el;
  const componentEl = (el as ComponentPublicInstance & { $el?: unknown }).$el;
  return componentEl instanceof HTMLElement ? componentEl : null;
}

function trackObservedRow(el: Element | ComponentPublicInstance | null, index: number) {
  observeRow(resolveObservedElement(el), index);
}

function onResizeStart(event: MouseEvent, colKey: string) {
  startResize(event, colKey);
}

function onAutoFitColumn(colKey: string) {
  autoFitColumn(colKey, tableContainerRef.value);
}

function densityCellPadding(): { x: number; y: number } {
  if (density.value === "compact") return { x: 10, y: 6 };
  if (density.value === "comfortable") return { x: 14, y: 10 };
  return { x: 12, y: 8 };
}

function dataRowStyle(): CSSProperties {
  return {
    minHeight: `${densityMetrics.value.rowHeight}px`,
  };
}

function bodyCellStyle(col: TableColumn): CSSProperties {
  const { x, y } = densityCellPadding();
  const padding = {
    padding: `${y}px ${x}px`,
  };
  if (col.width === "fill") {
    const minWidth = `${col.minWidth ?? densityMetrics.value.fillMinWidth}px`;
    return { ...padding, flex: `1 1 ${minWidth}`, minWidth };
  }
  if (typeof col.width === "number") {
    return { ...padding, width: `${col.width}px`, flexShrink: "0", flexGrow: "0" };
  }
  return {
    ...padding,
    width: `${resolvedWidth(col.key)}px`,
    flexShrink: "0",
    flexGrow: "0",
  };
}

function groupSpacerStyle(): CSSProperties {
  return {
    height: `${densityMetrics.value.groupRowHeight}px`,
  };
}

function onScrollRegionScroll(e: Event) {
  handleFixedAreaScroll(e);
  const target = e.target as HTMLElement;
  scrollLeft.value = target.scrollLeft;
}

// ── Row Prop Builders ──────────────────────────────────────────────────────

function groupRowProps(item: GroupHeaderItem) {
  return {
    groupKey: item.__groupKey,
    count: item.__groupCount,
    collapsed: collapsedGroups.value.has(
      item.__groupPath ? item.__groupPath.join("/") : item.__groupKey,
    ),
    colorMap: props.groupColorMap,
    selectable: effectiveSelectable.value,
    level: item.__groupLevel ?? 0,
    aggregations: item.__aggregations,
  };
}

function groupToggleKey(item: GroupHeaderItem): string {
  return item.__groupPath ? item.__groupPath.join("/") : item.__groupKey;
}

function dataRowProps(item: T) {
  return {
    row: item,
    rowKey: props.rowKey,
    selected: selectedRows.value.has(getRowId(item)),
    selectable: effectiveSelectable.value,
    columns: effectiveColumns.value,
    priorityColorMap: props.priorityColorMap,
    statusColorMap: props.statusColorMap,
  };
}

function isActiveCell(rowId: string, colKey: string): boolean {
  const cell = activeCell.value;
  return cell !== null && cell.rowId === rowId && cell.colKey === colKey;
}

function isCellSelected(rowId: string, colKey: string): boolean {
  return selectedRange.value.some((c) => c.rowId === rowId && c.colKey === colKey);
}

function dragRowClasses(item: T): Record<string, boolean> {
  const id = getRowId(item);
  return {
    "of-row-dragging": isDragging.value && draggedRowId.value === id,
    "of-row-drop-target": dropTargetId.value === id,
    "of-row-drop-before": dropTargetId.value === id && dropPosition.value === "before",
    "of-row-drop-after": dropTargetId.value === id && dropPosition.value === "after",
  };
}

// ── Mobile handlers ────────────────────────────────────────────────────────

function handleMobileRowClick(row: T) {
  detailSheetRow.value = row;
  detailSheetVisible.value = true;
}

function handleDetailSave(payload: { rowId: string; fields: Record<string, unknown> }) {
  for (const [fieldId, value] of Object.entries(payload.fields)) {
    emit("cell-edit", { rowId: payload.rowId, fieldId, value });
  }
}
</script>

<template>
  <!-- Mobile mode -->
  <template v-if="isMobile">
    <MobileListView
      :rows="sortedData as TableRowRecord[]"
      :columns="effectiveColumns"
      :selectable="effectiveSelectable"
      :addable="effectiveAddable"
      :status-color-map="statusColorMap"
      :readonly="readonly"
      :class="densityClass"
      :style="densityStyle"
      @row-click="(row) => handleMobileRowClick(row as T)"
      @add-row="emit('add-row')"
    >
      <template v-if="$slots.cell" #cell="cellProps">
        <slot name="cell" v-bind="cellProps" />
      </template>
    </MobileListView>
    <DetailSheet
      v-if="detailSheetTableRow"
      :row="detailSheetTableRow"
      :columns="effectiveColumns"
      :field-defs="fieldDefs"
      :visible="detailSheetVisible"
      @close="detailSheetVisible = false"
      @save="handleDetailSave"
      @delete="(id) => emit('row-delete', id)"
      @cell-edit="(p) => emit('cell-edit', p)"
    />
  </template>

  <!-- Desktop/Tablet mode -->
  <div
    v-else
    ref="tableContainerRef"
    class="of-data-table"
    :class="densityClass"
    :style="densityStyle"
    role="grid"
    tabindex="0"
    @keydown="enableKeyboard ? handleKeyDown($event) : undefined"
  >
    <!-- Fixed columns mode -->
    <template v-if="hasFixedColumns">
      <div class="of-data-table-body" style="position: relative">
        <!-- Fixed region -->
        <div
          ref="fixedContainerRef"
          class="of-data-table-fixed-region"
          :class="{ 'of-fixed-shadow': showFixedShadow }"
          :style="{ width: fixedWidth + 'px' }"
          @scroll="handleFixedScroll"
        >
          <!-- Fixed header -->
          <TableHeaderRow
            :columns="fixedCols"
            :selectable="effectiveSelectable"
            :sort-key="sort.field ?? ''"
            :sort-order="sort.order ?? 'asc'"
            :all-selected="isAllSelected"
            :indeterminate="indeterminate"
          :enable-resize="enableResize"
          :enable-field-menu="enableFieldManagement"
          :enable-add-field="enableFieldManagement"
          :density="density"
            @sort="toggleSort"
            @select-all="handleSelectAll"
            @resize-start="onResizeStart"
            @resize-dblclick="onAutoFitColumn"
            @header-contextmenu="onHeaderContextMenu"
            @header-dblclick="onHeaderDblClick"
            @add-field="onAddField"
          />
          <!-- Fixed rows -->
          <div class="of-data-table-fixed-body">
            <!-- Virtual scroll: use totalHeight placeholder + offsetY transform -->
            <template v-if="useVirtual">
              <div :style="{ height: totalHeight + 'px', position: 'relative' }">
                <div :style="{ transform: `translateY(${offsetY}px)` }">
                  <template v-for="{ data: item, index: vIdx } in visibleItems" :key="item.id">
                    <TableGroupRow
                      v-if="isGroupHeader(item)"
                      :ref="(el) => trackObservedRow(el as Element | ComponentPublicInstance | null, vIdx)"
                      v-bind="groupRowProps(item as GroupHeaderItem)"
                      @toggle="toggleGroup(groupToggleKey(item as GroupHeaderItem))"
                    />
                    <div
                      v-else
                      :ref="(el) => trackObservedRow(el as Element | ComponentPublicInstance | null, vIdx)"
                      class="of-table-row"
                      role="row"
                      tabindex="0"
                      :style="dataRowStyle()"
                      :class="{
                        'of-table-row--selected': selectedRows.has(getRowId(item as T)),
                        'of-table-row--hover': isRowHovered(getRowId(item as T)),
                      }"
                      @mouseenter="syncHover(getRowId(item as T))"
                      @mouseleave="syncHover(null)"
                      @focusin="syncHover(getRowId(item as T))"
                      @focusout="syncHover(null)"
                      @click="handleRowClick(item as T)"
                      @keydown="handleRowKeyDown($event, item as T)"
                      >
                      <div
                        v-if="effectiveSelectable"
                        class="of-td of-td-checkbox"
                        role="gridcell"
                        @click.stop
                      >
                        <label class="of-checkbox-label" :for="`fixed-row-select-${getRowId(item as T)}`">
                          <input
                            :id="`fixed-row-select-${getRowId(item as T)}`"
                            type="checkbox"
                            class="of-checkbox"
                            :checked="selectedRows.has(getRowId(item as T))"
                            @change="handleSelect(getRowId(item as T))"
                          />
                          <span class="of-sr-only">选择当前行</span>
                        </label>
                      </div>
                      <div
                        v-for="col in fixedCols"
                        :key="col.key"
                        class="of-td"
                        role="gridcell"
                        :style="bodyCellStyle(col)"
                      >
                        <slot name="cell" :row="item" :col="col">
                          <FieldCell
                            v-if="fieldDefs?.length"
                            :row-id="getRowId(item as T)"
                            :field="getFieldDef(col.key)"
                            :value="getRowValue(item as T, col.key)"
                            @commit="onCellCommit"
                          />
                          <span v-else class="of-td-text">{{ getRowValue(item as T, col.key) ?? "-" }}</span>
                        </slot>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </template>
            <!-- Normal render: full list -->
            <template v-else>
              <template v-for="item in groupedItems" :key="item.id">
                <TableGroupRow
                  v-if="isGroupHeader(item)"
                  v-bind="groupRowProps(item as GroupHeaderItem)"
                  @toggle="toggleGroup(groupToggleKey(item as GroupHeaderItem))"
                />
                <div
                  v-else
                  class="of-table-row"
                  role="row"
                  tabindex="0"
                  :style="dataRowStyle()"
                  :class="{
                    'of-table-row--selected': selectedRows.has(getRowId(item as T)),
                    'of-table-row--hover': isRowHovered(getRowId(item as T)),
                  }"
                  @mouseenter="syncHover(getRowId(item as T))"
                  @mouseleave="syncHover(null)"
                  @focusin="syncHover(getRowId(item as T))"
                  @focusout="syncHover(null)"
                  @click="handleRowClick(item as T)"
                  @keydown="handleRowKeyDown($event, item as T)"
                >
                  <div
                    v-if="effectiveSelectable"
                    class="of-td of-td-checkbox"
                    role="gridcell"
                    @click.stop
                  >
                    <label class="of-checkbox-label" :for="`row-select-${getRowId(item as T)}`">
                      <input
                        :id="`row-select-${getRowId(item as T)}`"
                        type="checkbox"
                        class="of-checkbox"
                        :checked="selectedRows.has(getRowId(item as T))"
                        @change="handleSelect(getRowId(item as T))"
                      />
                      <span class="of-sr-only">选择当前行</span>
                    </label>
                  </div>
                  <div
                    v-for="col in fixedCols"
                    :key="col.key"
                    class="of-td"
                    role="gridcell"
                    :style="bodyCellStyle(col)"
                  >
                    <slot name="cell" :row="item" :col="col">
                      <FieldCell
                        v-if="fieldDefs?.length"
                        :row-id="getRowId(item as T)"
                        :field="getFieldDef(col.key)"
                        :value="getRowValue(item as T, col.key)"
                        @commit="onCellCommit"
                      />
                      <span v-else class="of-td-text">{{ getRowValue(item as T, col.key) ?? "-" }}</span>
                    </slot>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </div>

        <!-- Scrollable region -->
        <div
          ref="scrollContainerRef"
          class="of-data-table-scroll-region"
          :style="{ marginLeft: fixedWidth + 'px' }"
          @scroll="onScrollRegionScroll"
        >
          <!-- Scrollable header -->
          <TableHeaderRow
            :columns="scrollableCols"
            :selectable="false"
            :sort-key="sort.field ?? ''"
            :sort-order="sort.order ?? 'asc'"
            :enable-resize="enableResize"
            :enable-field-menu="enableFieldManagement"
            :enable-add-field="enableFieldManagement"
            :density="density"
            @sort="toggleSort"
            @resize-start="onResizeStart"
            @resize-dblclick="onAutoFitColumn"
            @header-contextmenu="onHeaderContextMenu"
            @header-dblclick="onHeaderDblClick"
            @add-field="onAddField"
          />
          <!-- Scrollable rows -->
          <div class="of-data-table-scroll-body">
            <!-- Virtual scroll: use totalHeight placeholder + offsetY transform -->
            <template v-if="useVirtual">
              <div :style="{ height: totalHeight + 'px', position: 'relative' }">
                <div :style="{ transform: `translateY(${offsetY}px)` }">
                  <template v-for="{ data: item } in visibleItems" :key="item.id">
                    <div v-if="isGroupHeader(item)" :style="groupSpacerStyle()" />
                    <div
                      v-else
                      class="of-table-row"
                      role="row"
                      tabindex="0"
                      :class="{
                        'of-table-row--selected': selectedRows.has(getRowId(item as T)),
                        'of-table-row--hover': isRowHovered(getRowId(item as T)),
                      }"
                      @mouseenter="syncHover(getRowId(item as T))"
                      @mouseleave="syncHover(null)"
                      @focusin="syncHover(getRowId(item as T))"
                      @focusout="syncHover(null)"
                      @click="handleRowClick(item as T)"
                      @keydown="handleRowKeyDown($event, item as T)"
                    >
                      <div
                        v-for="col in scrollableCols"
                        :key="col.key"
                        class="of-td"
                        role="gridcell"
                        :style="bodyCellStyle(col)"
                      >
                        <slot name="cell" :row="item" :col="col">
                          <FieldCell
                            v-if="fieldDefs?.length"
                            :row-id="getRowId(item as T)"
                            :field="getFieldDef(col.key)"
                            :value="getRowValue(item as T, col.key)"
                            @commit="onCellCommit"
                          />
                          <span v-else class="of-td-text">{{ getRowValue(item as T, col.key) ?? "-" }}</span>
                        </slot>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </template>
            <!-- Normal render: full list -->
            <template v-else>
              <template v-for="item in groupedItems" :key="item.id">
                <div v-if="isGroupHeader(item)" :style="groupSpacerStyle()" />
                <div
                  v-else
                  class="of-table-row"
                  role="row"
                  tabindex="0"
                  :class="{
                    'of-table-row--selected': selectedRows.has(getRowId(item as T)),
                    'of-table-row--hover': isRowHovered(getRowId(item as T)),
                  }"
                  @mouseenter="syncHover(getRowId(item as T))"
                  @mouseleave="syncHover(null)"
                  @focusin="syncHover(getRowId(item as T))"
                  @focusout="syncHover(null)"
                  @click="handleRowClick(item as T)"
                  @keydown="handleRowKeyDown($event, item as T)"
                >
                  <div
                    v-for="col in scrollableCols"
                    :key="col.key"
                    class="of-td"
                    role="gridcell"
                    :style="bodyCellStyle(col)"
                  >
                    <slot name="cell" :row="item" :col="col">
                      <FieldCell
                        v-if="fieldDefs?.length"
                        :row-id="getRowId(item as T)"
                        :field="getFieldDef(col.key)"
                        :value="getRowValue(item as T, col.key)"
                        @commit="onCellCommit"
                      />
                      <span v-else class="of-td-text">{{ getRowValue(item as T, col.key) ?? "-" }}</span>
                    </slot>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </div>
      </div>
    </template>

    <!-- Standard mode (no fixed columns) -->
    <template v-else>
          <TableHeaderRow
            :columns="effectiveColumns"
            :selectable="effectiveSelectable"
            :sort-key="sort.field ?? ''"
            :sort-order="sort.order ?? 'asc'"
            :all-selected="isAllSelected"
            :indeterminate="indeterminate"
            :enable-resize="enableResize"
            :enable-field-menu="enableFieldManagement"
            :enable-add-field="enableFieldManagement"
            :density="density"
            @sort="toggleSort"
            @select-all="handleSelectAll"
            @resize-start="onResizeStart"
        @resize-dblclick="onAutoFitColumn"
        @header-contextmenu="onHeaderContextMenu"
        @header-dblclick="onHeaderDblClick"
        @add-field="onAddField"
      />

      <div ref="scrollContainerRef" class="of-data-table-scroll-container">
        <!-- Virtual scroll mode -->
        <template v-if="useVirtual">
          <div :style="{ height: totalHeight + 'px', position: 'relative' }">
            <div :style="{ transform: `translateY(${offsetY}px)` }">
                  <template v-for="{ data: item, index: vIdx } in visibleItems" :key="item.id">
                    <TableGroupRow
                      v-if="isGroupHeader(item)"
                      :ref="(el) => trackObservedRow(el as Element | ComponentPublicInstance | null, vIdx)"
                      v-bind="groupRowProps(item as GroupHeaderItem)"
                      @toggle="toggleGroup(groupToggleKey(item as GroupHeaderItem))"
                    />
                    <TableDataRow
                  v-else
                  :ref="(el) => trackObservedRow(el as Element | ComponentPublicInstance | null, vIdx)"
                  v-bind="dataRowProps(item as T)"
                  :density="density"
                  :draggable="enableRowDrag"
                  :class="dragRowClasses(item as T)"
                  @select="handleSelect"
                  @click="handleRowClick(item as T)"
                  @dragstart="onDragStart($event, item as T)"
                  @dragover="onDragOver($event, item as T)"
                  @drop="onDrop($event, item as T)"
                  @dragend="handleDragEnd"
                >
                  <template #cell="{ row: slotRow, col }">
                    <slot name="cell" :row="slotRow" :col="col">
                      <FieldCell
                        v-if="fieldDefs?.length"
                        :row-id="getRowId(slotRow as T)"
                        :field="getFieldDef(col.key)"
                        :value="slotRow[col.key] as CellValue"
                        :class="{
                          'of-cell--active': isActiveCell(getRowId(slotRow as T), col.key),
                          'of-cell--selected': isCellSelected(getRowId(slotRow as T), col.key),
                        }"
                        @commit="onCellCommit"
                        @click.stop="enableKeyboard && setActiveCell(getRowId(slotRow as T), col.key)"
                      />
                      <span v-else class="of-td-text">
                        {{ getRowValue(slotRow as Record<string, unknown>, col.key) ?? "-" }}
                      </span>
                    </slot>
                  </template>
                </TableDataRow>
              </template>
            </div>
          </div>
        </template>

        <!-- Normal render mode -->
        <template v-else>
          <template v-for="item in groupedItems" :key="item.id">
            <TableGroupRow
              v-if="isGroupHeader(item)"
              v-bind="groupRowProps(item as GroupHeaderItem)"
              @toggle="toggleGroup(groupToggleKey(item as GroupHeaderItem))"
            />
            <TableDataRow
              v-else
              v-bind="dataRowProps(item as T)"
              :density="density"
              :draggable="enableRowDrag"
              :class="dragRowClasses(item as T)"
              @select="handleSelect"
              @click="handleRowClick(item as T)"
              @dragstart="onDragStart($event, item as T)"
              @dragover="onDragOver($event, item as T)"
              @drop="onDrop($event, item as T)"
              @dragend="handleDragEnd"
            >
                  <template #cell="{ row: slotRow, col }">
                    <slot name="cell" :row="slotRow" :col="col">
                      <FieldCell
                        v-if="fieldDefs?.length"
                        :row-id="getRowId(slotRow as T)"
                        :field="getFieldDef(col.key)"
                        :value="slotRow[col.key] as CellValue"
                        :class="{
                          'of-cell--active': isActiveCell(getRowId(slotRow as T), col.key),
                          'of-cell--selected': isCellSelected(getRowId(slotRow as T), col.key),
                        }"
                        @commit="onCellCommit"
                        @click.stop="enableKeyboard && setActiveCell(getRowId(slotRow as T), col.key)"
                      />
                      <span v-else class="of-td-text">
                        {{ getRowValue(slotRow as Record<string, unknown>, col.key) ?? "-" }}
                      </span>
                    </slot>
                  </template>
                </TableDataRow>
          </template>
        </template>
      </div>
    </template>

    <!-- Column resize indicator line -->
    <div
      v-if="showResizeIndicator"
      class="of-resize-indicator"
      :style="{ left: resizeIndicatorX + 'px' }"
    />

    <!-- Draft rows batch toolbar -->
    <div v-if="hasDrafts" class="of-data-table-draft-toolbar">
      <span class="of-data-table-draft-count">{{ drafts.size }} 条草稿</span>
      <button
        class="of-data-table-draft-btn of-data-table-draft-btn--commit"
        @click="handleCommitAll"
      >
        全部提交
      </button>
      <button
        class="of-data-table-draft-btn of-data-table-draft-btn--discard"
        @click="handleDiscardAll"
      >
        全部放弃
      </button>
    </div>

    <NewRowBtn v-if="effectiveAddable" @click="handleAddRow" />

    <!-- 列头菜单 -->
    <ColumnHeaderMenu
      v-if="enableFieldManagement"
      :visible="headerMenuState.visible"
      :col-key="headerMenuState.colKey"
      :col-label="headerMenuState.colLabel"
      :field-type="headerMenuState.fieldType"
      :x="headerMenuState.x"
      :y="headerMenuState.y"
      @close="headerMenuState.visible = false"
      @rename="onSchemaRename"
      @change-type="onSchemaChangeType"
      @sort="(key: string, _dir: string) => toggleSort(key)"
      @hide="onSchemaHide"
      @delete="onSchemaDelete"
      @duplicate="onSchemaDuplicate"
    />

    <!-- 添加字段选择器 -->
    <Teleport to="body">
      <div v-if="showAddFieldPicker" class="of-add-field-overlay">
        <button
          type="button"
          class="of-add-field-overlay__backdrop"
          tabindex="-1"
          aria-hidden="true"
          @click="showAddFieldPicker = false"
        />
        <div class="of-add-field-popup">
          <FieldTypePicker @select="onAddFieldSelect" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.of-data-table {
  width: 100%;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  border-radius: var(--of-radius-lg);
  overflow: hidden;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  font-family: var(--of-font-sans);
  outline: none;
}

.of-data-table:focus-visible {
  outline: 2px solid var(--of-border-strong, var(--of-color-gray-300));
  outline-offset: -2px;
}

.of-data-table-scroll-container {
  max-height: 600px;
  overflow-y: auto;
}

.of-data-table--compact :deep(.of-table-group-row) {
  height: var(--of-data-table-group-row-height);
}

.of-data-table--compact :deep(.of-table-group-row__cell) {
  padding: 0 10px;
  gap: 6px;
}

.of-data-table--standard :deep(.of-table-group-row) {
  height: var(--of-data-table-group-row-height);
}

.of-data-table--standard :deep(.of-table-group-row__cell) {
  padding: 0 12px;
  gap: 8px;
}

.of-data-table--comfortable :deep(.of-table-group-row) {
  height: var(--of-data-table-group-row-height);
}

.of-data-table--comfortable :deep(.of-table-group-row__cell) {
  padding: 0 14px;
  gap: 8px;
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

/* Active cell focus ring */
:deep(.of-cell--active) {
  outline: 2px solid var(--of-border-strong, var(--of-color-gray-300));
  outline-offset: -1px;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .of-data-table-scroll-container {
    max-height: 100dvh;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.of-data-table-body {
  display: flex;
  overflow: hidden;
}

.of-data-table-fixed-region {
  position: sticky;
  left: 0;
  z-index: 10;
  overflow-y: auto;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated));
  border-right: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  scrollbar-width: none;
}

.of-data-table-fixed-region::-webkit-scrollbar {
  display: none;
}

.of-data-table--compact :deep(.of-mobile-list) {
  padding: 6px;
  gap: 6px;
}

.of-data-table--standard :deep(.of-mobile-list) {
  padding: 8px;
  gap: 8px;
}

.of-data-table--comfortable :deep(.of-mobile-list) {
  padding: 10px;
  gap: 10px;
}

.of-data-table--compact :deep(.of-mobile-card) {
  padding: 10px 12px;
  gap: 6px;
}

.of-data-table--standard :deep(.of-mobile-card) {
  padding: 12px 16px;
  gap: 8px;
}

.of-data-table--comfortable :deep(.of-mobile-card) {
  padding: 14px 18px;
  gap: 10px;
}

.of-data-table--compact :deep(.of-mobile-add-btn) {
  padding: 8px 12px;
  min-height: 40px;
}

.of-data-table--standard :deep(.of-mobile-add-btn) {
  padding: 10px 12px;
  min-height: 44px;
}

.of-data-table--comfortable :deep(.of-mobile-add-btn) {
  padding: 12px 14px;
  min-height: 48px;
}

.of-data-table--compact :deep(.of-new-row-btn) {
  padding: 6px 10px;
}

.of-data-table--standard :deep(.of-new-row-btn) {
  padding: 8px 12px;
}

.of-data-table--comfortable :deep(.of-new-row-btn) {
  padding: 10px 14px;
}

.of-data-table-scroll-region {
  flex: 1;
  overflow: auto;
}

.of-table-row--hover {
  background: var(--of-surface-muted, var(--of-color-gray-50));
}

/* Draft toolbar */
.of-data-table-draft-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--of-surface-selected, var(--of-color-gray-100, #f3f4f6));
  border-top: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  font-size: 13px;
}

.of-data-table-draft-count {
  color: var(--of-text-secondary, var(--of-color-gray-600, #4b5563));
  font-weight: 500;
  flex: 1;
}

.of-data-table-draft-btn {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.of-data-table-draft-btn--commit {
  background: var(--of-surface-elevated, var(--of-color-bg-elevated, #fff));
  color: var(--of-text-primary, var(--of-color-gray-700, #374151));
}

.of-data-table-draft-btn--discard {
  background: var(--of-surface-muted, var(--of-color-gray-200, #e5e7eb));
  color: var(--of-text-primary, var(--of-color-gray-700, #374151));
}

/* Drag state */
:deep([draggable="true"]) {
  cursor: grab;
}

:deep([draggable="true"]:active) {
  cursor: grabbing;
}

/* Column resize indicator line */
.of-resize-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--of-border-strong, var(--of-color-gray-300, #d1d5db));
  z-index: 10;
  pointer-events: none;
}

/* Fixed column scroll shadow */
.of-data-table-fixed-region.of-fixed-shadow {
  box-shadow: var(--of-shadow-fixed-col);
  clip-path: inset(0 -12px 0 0);
}

/* Row drag visual feedback */
:deep(.of-row-dragging) {
  opacity: 0.5;
}

:deep(.of-row-drop-before) {
  box-shadow: 0 -2px 0 0 var(--of-border-strong, var(--of-color-gray-300, #d1d5db));
}

:deep(.of-row-drop-after) {
  box-shadow: 0 2px 0 0 var(--of-border-strong, var(--of-color-gray-300, #d1d5db));
}

/* Cell selection highlight */
:deep(.of-cell--selected) {
  background: var(--of-surface-selected, var(--of-color-gray-100, rgba(243, 244, 246, 0.8)));
  outline: 1px solid var(--of-border-subtle, var(--of-color-gray-200, rgba(229, 231, 235, 0.8)));
  outline-offset: -1px;
  border-radius: 2px;
}

/* Add field overlay & popup */
.of-add-field-overlay {
  position: fixed;
  inset: 0;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.of-add-field-overlay__backdrop {
  position: absolute;
  inset: 0;
  border: none;
  padding: 0;
  background: transparent;
  cursor: default;
}

.of-add-field-popup {
  position: relative;
  z-index: 1;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated, #fff));
  border-radius: var(--of-radius-lg, 8px);
  box-shadow: var(--of-shadow-overlay-lg);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
}
</style>
