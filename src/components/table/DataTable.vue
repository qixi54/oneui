<script lang="ts">
export type { BulkActionItem, BulkActionContext } from "../../types/data-table";
</script>

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
import DataTableDraftToolbar from "./DataTableDraftToolbar.vue";
import DataTableMobilePanel from "./DataTableMobilePanel.vue";
import DataTableDesktopFrame from "./DataTableDesktopFrame.vue";
import FieldCell, {
  type FieldDef as CellFieldDef,
  type CellValue,
} from "./FieldCell.vue";
import type {
  BulkActionItem,
  ResolvedTableColumn,
} from "../../types/data-table";
import {
  normalizeFieldType,
  resolveRowId,
  resolveFieldDef,
  resolveFirstEditableFieldKey,
  buildDataRowStyle,
  buildBodyCellStyle,
  buildGroupSpacerStyle,
} from "./dataTableUtils";
import type { RowActionItem } from "./TableDataRow.vue";
import { createVirtualListState, useVirtualList } from "@/composables/useVirtualList";
import { useTable } from "@/composables/useTable";
import { useTableGroup, type GroupHeaderItem } from "@/composables/useTableGroup";
import { useTableData } from "@/composables/useTableData";
import { useColumnResize } from "@/composables/useColumnResize";
import { useKeyboardNavigation } from "@/composables/useKeyboardNavigation";
import { useBreakpoint } from "@/composables/useBreakpoint";
import { useFixedColumns } from "@/composables/useFixedColumns";
import { useRowDrag } from "@/composables/useRowDrag";
import { useDraftRows } from "@/composables/useDraftRows";
import { useDataTableLayout } from "@/composables/useDataTableLayout";
import { useDataTableSelection } from "@/composables/useDataTableSelection";
import { useDataTableDetailSheet } from "@/composables/useDataTableDetailSheet";
import { useTableEditing } from "@/composables/useTableEditing";
import { useTableColumnSchema } from "@/composables/useTableColumnSchema";
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
    /** 显示默认行级快捷操作 */
    showRowActions?: boolean;
    /** 显示批量操作条 */
    showSelectionBar?: boolean;
    /** 批量操作定义，默认仅提供清空选择 */
    bulkActionItems?: BulkActionItem[];
    /** 开启表格容器感知密度收缩 */
    containerResponsive?: boolean;
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
    showRowActions: true,
    showSelectionBar: true,
    bulkActionItems: () => [],
    containerResponsive: true,
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
  "bulk-action": [payload: { actionKey: string; rowIds: string[]; rows: (T | DataRecord)[] }];
}>();
const ColumnHeaderMenu = defineAsyncComponent(() => import("./ColumnHeaderMenu.vue"));
const FieldTypePicker = defineAsyncComponent(() => import("./FieldTypePicker.vue"));

const density = computed<Density>(() => props.density ?? "standard");

// ── Breakpoint ─────────────────────────────────────────────────────────────

const { isMobile } = useBreakpoint();
const scrollContainerRef = ref<HTMLElement | null>(null);
const tableContainerRef = ref<HTMLElement | null>(null);
const fixedContainerRef = ref<HTMLElement | null>(null);
const virtualizationState = createVirtualListState();
const {
  containerDensity,
  densityMetrics,
  densityClass,
  containerWidthClass,
  densityStyle,
} = useDataTableLayout({
  tableContainerRef,
  density,
  containerResponsive: computed(() => props.containerResponsive ?? true),
  isMobile,
  onContainerWidthChange: virtualizationState.invalidate,
});
type RowWithRecord = T & { __record?: DataRecord };
const {
  detailSheetVisible,
  detailSheetTableRow,
  handleRowClick: handleDetailSheetRowClick,
  handleMobileRowClick: openMobileDetailSheet,
  buildDetailSavePayloads,
  closeDetailSheet,
} = useDataTableDetailSheet<RowWithRecord, DataRecord>();
type TableRowRecord = Record<string, unknown> & { id: string };

const editableFieldKeys = computed(() =>
  effectiveColumns.value
    .filter((field) => field.editable)
    .map((field) => field.key),
);

function getFirstEditableFieldKey(row: T): string | null {
  return resolveFirstEditableFieldKey({
    row,
    readonly: props.readonly,
    columns: effectiveColumns.value,
    editableFieldKeys: editableFieldKeys.value,
  });
}

function buildRowActionItems(row: T): RowActionItem[] {
  const items: RowActionItem[] = [
    {
      key: "detail",
      label: "详情",
      onClick: () => handleRowClick(row),
    },
  ];
  const editableFieldKey = getFirstEditableFieldKey(row);
  if (editableFieldKey) {
    items.push({
      key: "edit",
      label: "编辑",
      onClick: () => handleInlineEdit(row, editableFieldKey),
    });
  }
  return items;
}

function handleInlineEdit(row: T, fieldKey?: string) {
  const rowId = getRowId(row);
  const targetFieldKey = fieldKey ?? getFirstEditableFieldKey(row);
  if (!targetFieldKey) {
    handleRowClick(row);
    return;
  }
  inlineEdit.activate(rowId, targetFieldKey, getRowValue(row as TableRowRecord, targetFieldKey));
  if (props.enableKeyboard) {
    setActiveCell(rowId, targetFieldKey);
  }
}

function handleRowActionClick(row: T, actionKey: string) {
  if (actionKey === "detail") {
    handleRowClick(row);
    return;
  }
  if (actionKey === "edit") {
    handleInlineEdit(row);
  }
}

// ── Inline Edit ────────────────────────────────────────────────────────────

const inlineEdit = useTableEditing<TableRowRecord>();
const { commit: commitInlineEdit, editingCell, getCellState } = inlineEdit;

// ── Normalize Data ─────────────────────────────────────────────────────────

const { rows: normalizedData } = useTableData<T>({
  tasks: toRef(props, "tasks"),
  records: toRef(props, "records"),
});

// ── Column Logic ───────────────────────────────────────────────────────────

const { resolvedColumns, fieldContracts } = useTableColumnSchema({
  columns: toRef(props, "columns"),
  schema: toRef(props, "schema"),
  view: toRef(props, "view"),
  fieldDefs: toRef(props, "fieldDefs"),
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
    density: containerDensity,
    onResize: (colKey, width) => emit("column-resize", { colKey, width }),
  });

// Apply resize overrides to columns
const effectiveColumns = computed<ResolvedTableColumn[]>(() => {
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
  clearSelection,
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
  invalidateKey: containerDensity,
  state: virtualizationState,
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
  onActivateEdit: (rowId, colKey) => {
    const row = dataRows.value.find((item) => getRowId(item) === rowId) as TableRowRecord | undefined;
    inlineEdit.activate(rowId, colKey, row ? getRowValue(row, colKey) : undefined);
  },
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

const { indeterminate, hasSelectionBar, resolvedBulkActionItems, handleSelectAll, handleSelect, handleBulkAction } =
  useDataTableSelection<T>({
    rows: sortedData,
    selectedRows,
    rowKey: toRef(props, "rowKey"),
    selectable: effectiveSelectable,
    bulkActionItems: toRef(props, "bulkActionItems"),
    showSelectionBar: toRef(props, "showSelectionBar"),
    emitSelectionChange: (ids) => emit("selection-change", ids),
    toggleSelectAll,
    toggleRowSelection: (row, index = 0) => toggleRowSelection(row, index),
    clearSelection,
    emitBulkAction: (payload) => emit("bulk-action", payload),
  });

// ── Event Handlers ─────────────────────────────────────────────────────────

function getRowId(row: T): string {
  return resolveRowId(row, props.rowKey);
}

function getFieldDef(colKey: string): CellFieldDef {
  return fieldContracts.value.get(colKey) ?? resolveFieldDef(props.fieldDefs, colKey);
}

async function onCellCommit(rowId: string, fieldId: string, value: unknown) {
  const row = dataRows.value.find((item) => getRowId(item) === rowId) as TableRowRecord | undefined;
  const column = effectiveColumns.value.find((item) => item.key === fieldId);
  const result = await commitInlineEdit({
    rowId,
    fieldId,
    value,
    originalValue: row ? getRowValue(row, fieldId) : undefined,
    row,
    parser: column?.parser,
    validator: column?.validator,
  });
  if (!result.ok) return;
  emit("cell-edit", { rowId, fieldId, value: result.value });
}

function onCellRequestEdit(rowId: string, fieldId: string) {
  const row = dataRows.value.find((item) => getRowId(item) === rowId) as TableRowRecord | undefined;
  inlineEdit.activate(rowId, fieldId, row ? getRowValue(row, fieldId) : undefined);
  if (props.enableKeyboard) {
    setActiveCell(rowId, fieldId);
  }
}

function onCellRequestCancel() {
  inlineEdit.cancel();
}

function handleRowClick(row: T) {
  const result = handleDetailSheetRowClick({
    row: row as RowWithRecord,
    isMobile: isMobile.value,
  });
  if (result.type === "emit-record") {
    emit("row-click-record", result.row);
    emit("row-click", result.row);
    return;
  }
  if (result.type === "emit-row") {
    emit("row-click", result.row);
  }
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

function dataRowStyle(): CSSProperties {
  return buildDataRowStyle(densityMetrics.value.rowHeight);
}

function bodyCellStyle(col: TableColumn): CSSProperties {
  return buildBodyCellStyle({
    density: containerDensity.value,
    col,
    resolvedWidth: resolvedWidth(col.key),
    fillMinWidth: densityMetrics.value.fillMinWidth,
  });
}

function groupSpacerStyle(): CSSProperties {
  return buildGroupSpacerStyle(densityMetrics.value.groupRowHeight);
}

function onScrollRegionScroll(e: Event) {
  handleFixedAreaScroll(e);
  const target = e.target as HTMLElement;
  scrollLeft.value = target.scrollLeft;
}

function setDesktopFixedRegionRef(element: HTMLElement | null) {
  fixedContainerRef.value = element;
}

function setDesktopScrollRegionRef(element: HTMLElement | null) {
  scrollContainerRef.value = element;
}

function setDesktopStandardScrollRef(element: HTMLElement | null) {
  scrollContainerRef.value = element;
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

function isCellEditing(rowId: string, colKey: string): boolean {
  return (
    editingCell.value !== null &&
    editingCell.value.rowId === rowId &&
    editingCell.value.fieldId === colKey
  );
}

function cellState(rowId: string, colKey: string) {
  return getCellState(rowId, colKey);
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
  openMobileDetailSheet(row as RowWithRecord);
}

function handleDetailSave(payload: { rowId: string; fields: Record<string, unknown> }) {
  for (const editPayload of buildDetailSavePayloads(payload)) {
    emit("cell-edit", editPayload);
  }
}
</script>

<template>
  <template v-if="isMobile">
    <DataTableMobilePanel
      :rows="sortedData as TableRowRecord[]"
      :columns="effectiveColumns"
      :field-defs="fieldDefs"
      :selectable="effectiveSelectable"
      :addable="effectiveAddable"
      :status-color-map="statusColorMap"
      :readonly="readonly"
      :density-class="densityClass"
      :density-style="densityStyle"
      :detail-visible="detailSheetVisible"
      :detail-row="detailSheetTableRow"
      @row-click="(row) => handleMobileRowClick(row as T)"
      @add-row="emit('add-row')"
      @close-detail="closeDetailSheet"
      @detail-save="handleDetailSave"
      @row-delete="(id: string) => emit('row-delete', id)"
      @cell-edit="(payload) => emit('cell-edit', payload)"
    >
      <template v-if="$slots.cell" #cell="cellProps">
        <slot name="cell" v-bind="cellProps" />
      </template>
    </DataTableMobilePanel>
  </template>

  <div
    v-else
    ref="tableContainerRef"
    class="of-data-table"
    :class="[densityClass, containerWidthClass]"
    :style="densityStyle"
    role="grid"
    tabindex="0"
    @keydown="enableKeyboard ? handleKeyDown($event) : undefined"
  >
    <DataTableDesktopFrame
      :has-fixed-columns="hasFixedColumns"
      :show-selection-bar="hasSelectionBar"
      :selection-count="selectedRows.size"
      :selection-items="resolvedBulkActionItems"
      :fixed-width="fixedWidth"
      :show-fixed-shadow="showFixedShadow"
      :columns="effectiveColumns"
      :fixed-columns="fixedCols"
      :scrollable-columns="scrollableCols"
      :selectable="effectiveSelectable"
      :show-row-actions="showRowActions"
      :use-virtual="useVirtual"
      :total-height="totalHeight"
      :offset-y="offsetY"
      :set-fixed-region-ref="setDesktopFixedRegionRef"
      :set-scroll-region-ref="setDesktopScrollRegionRef"
      :set-standard-scroll-ref="setDesktopStandardScrollRef"
      @selection-action="handleBulkAction"
      @fixed-scroll="handleFixedScroll"
      @scroll="onScrollRegionScroll"
    >
      <template #fixed-header>
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
          :density="containerDensity"
          @sort="toggleSort"
          @select-all="handleSelectAll"
          @resize-start="onResizeStart"
          @resize-dblclick="onAutoFitColumn"
          @header-contextmenu="onHeaderContextMenu"
          @header-dblclick="onHeaderDblClick"
          @add-field="onAddField"
        />
      </template>

      <template #fixed-body>
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
                        :editing="isCellEditing(getRowId(item as T), col.key)"
                        :state="cellState(getRowId(item as T), col.key)"
                        @commit="onCellCommit"
                        @request-edit="onCellRequestEdit"
                        @request-cancel="onCellRequestCancel"
                      />
                      <span v-else class="of-td-text">{{ getRowValue(item as T, col.key) ?? "-" }}</span>
                    </slot>
                  </div>
                  <div
                    v-if="showRowActions"
                    class="of-table-row__actions"
                    aria-label="行快捷操作"
                    @click.stop
                  >
                    <template v-for="action in buildRowActionItems(item as T)" :key="action.key">
                      <button
                        type="button"
                        class="of-table-row__action-btn"
                        :class="{ 'of-table-row__action-btn--danger': action.variant === 'danger' }"
                        :disabled="action.disabled"
                        @click.stop="handleRowActionClick(item as T, action.key)"
                      >
                        <span>{{ action.label }}</span>
                      </button>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
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
                    :editing="isCellEditing(getRowId(item as T), col.key)"
                    :state="cellState(getRowId(item as T), col.key)"
                    @commit="onCellCommit"
                    @request-edit="onCellRequestEdit"
                    @request-cancel="onCellRequestCancel"
                  />
                  <span v-else class="of-td-text">{{ getRowValue(item as T, col.key) ?? "-" }}</span>
                </slot>
              </div>
              <div
                v-if="showRowActions"
                class="of-table-row__actions"
                aria-label="行快捷操作"
                @click.stop
              >
                <template v-for="action in buildRowActionItems(item as T)" :key="action.key">
                  <button
                    type="button"
                    class="of-table-row__action-btn"
                    :class="{ 'of-table-row__action-btn--danger': action.variant === 'danger' }"
                    :disabled="action.disabled"
                    @click.stop="handleRowActionClick(item as T, action.key)"
                  >
                    <span>{{ action.label }}</span>
                  </button>
                </template>
              </div>
            </div>
          </template>
        </template>
      </template>

      <template #scroll-header>
        <TableHeaderRow
          :columns="scrollableCols"
          :selectable="false"
          :sort-key="sort.field ?? ''"
          :sort-order="sort.order ?? 'asc'"
          :enable-resize="enableResize"
          :enable-field-menu="enableFieldManagement"
          :enable-add-field="enableFieldManagement"
          :density="containerDensity"
          @sort="toggleSort"
          @resize-start="onResizeStart"
          @resize-dblclick="onAutoFitColumn"
          @header-contextmenu="onHeaderContextMenu"
          @header-dblclick="onHeaderDblClick"
          @add-field="onAddField"
        />
      </template>

      <template #scroll-body>
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
                        :editing="isCellEditing(getRowId(item as T), col.key)"
                        :state="cellState(getRowId(item as T), col.key)"
                        @commit="onCellCommit"
                        @request-edit="onCellRequestEdit"
                        @request-cancel="onCellRequestCancel"
                      />
                      <span v-else class="of-td-text">{{ getRowValue(item as T, col.key) ?? "-" }}</span>
                    </slot>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
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
                    :editing="isCellEditing(getRowId(item as T), col.key)"
                    :state="cellState(getRowId(item as T), col.key)"
                    @commit="onCellCommit"
                    @request-edit="onCellRequestEdit"
                    @request-cancel="onCellRequestCancel"
                  />
                  <span v-else class="of-td-text">{{ getRowValue(item as T, col.key) ?? "-" }}</span>
                </slot>
              </div>
            </div>
          </template>
        </template>
      </template>

      <template #standard-header>
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
          :density="containerDensity"
          @sort="toggleSort"
          @select-all="handleSelectAll"
          @resize-start="onResizeStart"
          @resize-dblclick="onAutoFitColumn"
          @header-contextmenu="onHeaderContextMenu"
          @header-dblclick="onHeaderDblClick"
          @add-field="onAddField"
        />
      </template>

      <template #standard-body>
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
                  :density="containerDensity"
                  :show-row-actions="showRowActions"
                  :row-action-items="buildRowActionItems(item as T)"
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
                        :editing="isCellEditing(getRowId(slotRow as T), col.key)"
                        :state="cellState(getRowId(slotRow as T), col.key)"
                        :class="{
                          'of-cell--active': isActiveCell(getRowId(slotRow as T), col.key),
                          'of-cell--selected': isCellSelected(getRowId(slotRow as T), col.key),
                        }"
                        @commit="onCellCommit"
                        @request-edit="onCellRequestEdit"
                        @request-cancel="onCellRequestCancel"
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
              :density="containerDensity"
              :show-row-actions="showRowActions"
              :row-action-items="buildRowActionItems(item as T)"
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
                    :editing="isCellEditing(getRowId(slotRow as T), col.key)"
                    :state="cellState(getRowId(slotRow as T), col.key)"
                    :class="{
                      'of-cell--active': isActiveCell(getRowId(slotRow as T), col.key),
                      'of-cell--selected': isCellSelected(getRowId(slotRow as T), col.key),
                    }"
                    @commit="onCellCommit"
                    @request-edit="onCellRequestEdit"
                    @request-cancel="onCellRequestCancel"
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
      </template>
    </DataTableDesktopFrame>

    <div
      v-if="showResizeIndicator"
      class="of-resize-indicator"
      :style="{ left: resizeIndicatorX + 'px' }"
    />

    <DataTableDraftToolbar
      v-if="hasDrafts"
      :draft-count="drafts.size"
      @commit-all="handleCommitAll"
      @discard-all="handleDiscardAll"
    />

    <NewRowBtn v-if="effectiveAddable" @click="handleAddRow" />

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

.of-data-table--compact :deep(.of-table-group-row) {
  height: var(--of-data-table-group-row-height);
}

.of-data-table--compact :deep(.of-table-group-row__cell) {
  padding: 0 var(--of-spacing-2_5);
  gap: var(--of-spacing-1_5);
}

.of-data-table--standard :deep(.of-table-group-row) {
  height: var(--of-data-table-group-row-height);
}

.of-data-table--standard :deep(.of-table-group-row__cell) {
  padding: 0 var(--of-spacing-3);
  gap: var(--of-spacing-2);
}

.of-data-table--comfortable :deep(.of-table-group-row) {
  height: var(--of-data-table-group-row-height);
}

.of-data-table--comfortable :deep(.of-table-group-row__cell) {
  padding: 0 var(--of-spacing-3_5);
  gap: var(--of-spacing-2);
}

/* Active cell focus ring */
:deep(.of-cell--active) {
  outline: 2px solid var(--of-border-strong, var(--of-color-gray-300));
  outline-offset: -1px;
  border-radius: var(--of-radius-sm);
}

.of-data-table--compact :deep(.of-mobile-list) {
  padding: var(--of-spacing-1_5);
  gap: var(--of-spacing-1_5);
}

.of-data-table--standard :deep(.of-mobile-list) {
  padding: var(--of-spacing-2);
  gap: var(--of-spacing-2);
}

.of-data-table--comfortable :deep(.of-mobile-list) {
  padding: var(--of-spacing-2_5);
  gap: var(--of-spacing-2_5);
}

.of-data-table--compact :deep(.of-mobile-card) {
  padding: var(--of-spacing-2_5) var(--of-spacing-3);
  gap: var(--of-spacing-1_5);
}

.of-data-table--standard :deep(.of-mobile-card) {
  padding: var(--of-spacing-3) var(--of-spacing-4);
  gap: var(--of-spacing-2);
}

.of-data-table--comfortable :deep(.of-mobile-card) {
  padding: var(--of-spacing-3_5) var(--of-spacing-5);
  gap: var(--of-spacing-2_5);
}

.of-data-table--compact :deep(.of-mobile-add-btn) {
  padding: var(--of-spacing-2) var(--of-spacing-3);
  min-height: 40px;
}

.of-data-table--standard :deep(.of-mobile-add-btn) {
  padding: var(--of-spacing-2_5) var(--of-spacing-3);
  min-height: 44px;
}

.of-data-table--comfortable :deep(.of-mobile-add-btn) {
  padding: var(--of-spacing-3) var(--of-spacing-3_5);
  min-height: 48px;
}

.of-data-table--compact :deep(.of-new-row-btn) {
  padding: var(--of-spacing-1_5) var(--of-spacing-2_5);
}

.of-data-table--standard :deep(.of-new-row-btn) {
  padding: var(--of-spacing-2) var(--of-spacing-3);
}

.of-data-table--comfortable :deep(.of-new-row-btn) {
  padding: var(--of-spacing-2_5) var(--of-spacing-3_5);
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
  z-index: var(--of-z-sticky);
  pointer-events: none;
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
  border-radius: var(--of-radius-sm);
}

/* Add field overlay & popup */
.of-add-field-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--of-z-overlay);
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
  z-index: var(--of-z-base);
  background: var(--of-surface-elevated, var(--of-color-bg-elevated, #fff));
  border-radius: var(--of-radius-lg, 8px);
  box-shadow: var(--of-shadow-overlay-lg);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
}
</style>
