<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { AlertCircle, Database } from "lucide-vue-next";
import DatabaseViewDetailHost from "./DatabaseViewDetailHost.vue";
import DatabaseViewContent from "./DatabaseViewContent.vue";
import DatabaseViewShell from "./DatabaseViewShell.vue";
import DatabaseViewToolbar from "./DatabaseViewToolbar.vue";
import { useDatabaseView } from "../../composables/useDatabaseView";
import {
  DATABASE_DETAIL_VIEW_ID as DETAIL_VIEW_ID,
  readWorkspacePreferences,
} from "../../composables/useDatabaseWorkspace";
import { useDatabaseDetailWorkspace } from "../../composables/useDatabaseDetailWorkspace";
import type {
  DatabaseViewKanbanCardMoveEvent,
  DatabaseViewKanbanQuickAddEvent,
  DatabaseViewProps,
  DatabaseViewSchemaEvent,
  DatabaseViewSlots,
  DatabaseViewViewTab,
} from "../../contracts/database";
import type { FilterCondition as ToolbarFilterCondition, FilterLogic } from "../../composables/useTableFilter";
import type {
  KanbanColumnData,
  CellValue,
  DataRecord,
  TableColumn,
} from "../../types";
import { buildGanttItems, taskToDataRecord } from "../../types";
import {
  buildDatabaseViewTabs,
  buildEmptyFilter,
  buildFallbackView,
  buildRenderedRecords,
  buildTableColumns,
  buildVirtualDetailView,
  cloneView,
  convertToolbarFiltersToViewFilters,
  convertViewFiltersToToolbarFilters,
  getVisibleFieldIds,
} from "./databaseViewUtils";

const props = withDefaults(defineProps<DatabaseViewProps>(), {
  tableId: "database-view",
  mode: "local",
  detailPresentation: "auto",
  detailSource: undefined,
  density: "standard",
  schema: null,
  records: () => [],
  views: () => [],
  provider: undefined,
  defaultView: undefined,
  currentViewId: "",
  initialViewId: "",
  selectedRecordId: undefined,
  initialSelectedRecordId: undefined,
  searchKeyword: undefined,
  loading: undefined,
  error: undefined,
  viewTabs: undefined,
  actions: undefined,
  ui: undefined,
  showToolbar: true,
  showViewSwitch: true,
  showFilter: true,
  showSort: true,
  showGroup: true,
  showColumns: true,
  showSearch: true,
  readonly: false,
  pageSize: 20,
  autoLoad: true,
});

const emit = defineEmits<{
  "update:currentViewId": [string];
  "update:selectedRecordId": [string | null];
  "update:searchKeyword": [string];
  "update:columns": [TableColumn[]];
  "update:filterLogic": [FilterLogic];
  "update:records": [DataRecord[]];
  "cell-edit": [{ rowId: string; fieldId: string; value: unknown }];
  "select-record": [DataRecord | null];
  "schema-add-field": [string];
  "schema-rename-field": [{ fieldId: string; newName: string }];
  "schema-change-field-type": [{ fieldId: string; newType: string }];
  "schema-hide-field": [string];
  "schema-delete-field": [string];
  "schema-duplicate-field": [string];
  "row-click": [unknown];
  "card-click": [unknown];
  add: [];
  "add-column": [];
  "record-change": [{ recordId: string; startDate?: string; endDate?: string }];
  "kanban-quick-add": [DatabaseViewKanbanQuickAddEvent];
  "kanban-card-move": [DatabaseViewKanbanCardMoveEvent];
  "load-view": [string];
  "save-view": [string];
  sort: [string];
  group: [string | null];
  refresh: [];
}>();

defineSlots<DatabaseViewSlots>();

defineOptions({ name: "DatabaseView", inheritAttrs: false });

const initialWorkspacePreferences = readWorkspacePreferences(props.tableId);
const schemaSource = computed(() => props.schema ?? null);
const recordSource = computed(() => props.records ?? []);
const viewSource = computed(() => {
  const source = (props.views ?? []).map((view) => cloneView(view));
  const hasTableView =
    source.some((view) => view.viewType === "table") ||
    (props.schema?.views ?? []).some((view) => view.viewType === "table");
  const hasDetailView =
    source.some((view) => view.viewType === "detail") ||
    (props.schema?.views ?? []).some((view) => view.viewType === "detail");
  if (!hasTableView) {
    source.unshift(buildFallbackView(props.schema, props.records ?? []));
  }
  if (!hasDetailView) {
    source.push(buildVirtualDetailView(DETAIL_VIEW_ID, props.schema, props.records ?? []));
  }
  return source;
});

const databaseView = useDatabaseView<DataRecord>({
  tableId: props.tableId,
  mode: props.mode,
  schema: schemaSource,
  records: recordSource,
  views: viewSource,
  provider: props.provider,
  defaultView: props.defaultView,
  initialViewId:
    props.currentViewId ||
    props.initialViewId ||
    initialWorkspacePreferences.activeViewId ||
    props.defaultView?.viewId ||
    viewSource.value[0]?.viewId ||
    "",
  initialSelectedRecordId: props.selectedRecordId ?? props.initialSelectedRecordId,
  pageSize: props.pageSize,
  autoLoad: props.autoLoad,
  actions: {
    middleware: props.actions?.middleware,
    onCellEdit: async (payload) => {
      emit("cell-edit", payload);
      await props.actions?.onCellEdit?.(payload);
    },
    onCreateRecord: async ({ record }) => {
      await props.actions?.onCreateRecord?.({ tableId: props.tableId, record });
    },
    onUpdateRecord: async ({ recordId, patch, record }) => {
      await props.actions?.onUpdateRecord?.({ tableId: props.tableId, recordId, patch, record });
    },
    onDeleteRecord: async ({ recordId }) => {
      await props.actions?.onDeleteRecord?.({ tableId: props.tableId, recordId });
    },
    onSelectRecord: async (record) => {
      await props.actions?.onSelectRecord?.(record);
    },
    onSchemaEvent: async (event) => {
      switch (event.type) {
        case "schema-add-field":
          emit("schema-add-field", event.fieldType);
          break;
        case "schema-rename-field":
          emit("schema-rename-field", { fieldId: event.fieldId, newName: event.newName });
          break;
        case "schema-change-field-type":
          emit("schema-change-field-type", { fieldId: event.fieldId, newType: event.newType });
          break;
        case "schema-hide-field":
          emit("schema-hide-field", event.fieldId);
          break;
        case "schema-delete-field":
          emit("schema-delete-field", event.fieldId);
          break;
        case "schema-duplicate-field":
          emit("schema-duplicate-field", event.fieldId);
          break;
      }
      await props.actions?.onSchemaEvent?.(event);
    },
    onSaveView: async (view) => {
      emit("save-view", view.name);
      await props.actions?.onViewSave?.({ tableId: props.tableId, viewId: view.viewId, name: view.name });
    },
    onRefresh: async () => {
      emit("refresh");
      await props.actions?.onRefresh?.();
    },
  },
});

const activeView = computed(() => databaseView.activeView.value);
const activeViewId = computed(() => databaseView.activeViewId.value);
const selectedRecord = computed(() => databaseView.selectedRecord.value);
const activeSelectedRecordId = computed(() => databaseView.selectedRecordId.value);
const resolvedSchema = computed(() => databaseView.schema.value ?? schemaSource.value);
const resolvedRecords = computed<DataRecord[]>(() => [...databaseView.records.value]);
const activeViewType = computed(() => activeView.value.viewType || "table");
const filterLogic = ref<FilterLogic>("and");
const toolbarFilters = ref<ToolbarFilterCondition[]>([]);

watch(
  activeView,
  (view) => {
    toolbarFilters.value = convertViewFiltersToToolbarFilters(view.filters ?? []);
  },
  { immediate: true },
);

const resolvedViewTabs = computed<DatabaseViewViewTab[]>(() =>
  buildDatabaseViewTabs({
    providedTabs: props.viewTabs,
    viewList: databaseView.viewList.value,
    detailViewId: DETAIL_VIEW_ID,
  }),
);
const detailSource = computed(() => props.detailSource?.trim() || undefined);

const detailWorkspace = useDatabaseDetailWorkspace({
  tableId: toRef(props, "tableId"),
  activeViewId,
  currentViewId: toRef(props, "currentViewId"),
  selectedRecordId: toRef(props, "selectedRecordId"),
  selectedRecord,
  resolvedSchema,
  resolvedRecords,
  viewTabs: resolvedViewTabs,
  detailPresentation: toRef(props, "detailPresentation"),
  initialSearchKeyword: props.searchKeyword || initialWorkspacePreferences.searchKeyword || "",
  initialDetailPresentation: initialWorkspacePreferences.detailPresentation ?? null,
  initialSidePanelWidth: initialWorkspacePreferences.sidePanelWidth,
  initialDrawerWidth: initialWorkspacePreferences.drawerWidth,
  initialWorkspaceActive:
    props.currentViewId === DETAIL_VIEW_ID ||
    props.initialViewId === DETAIL_VIEW_ID ||
    props.selectedRecordId != null ||
    props.initialSelectedRecordId != null,
  onSelectRecord: (record) => {
    databaseView.setSelectedRecord(record);
  },
  onClearSelectedRecord: () => {
    databaseView.clearSelectedRecord();
  },
  onSetRecords: (next) => {
    setRecords(next);
  },
  onCellEdit: (payload) => {
    handleCellEdit(payload);
  },
  onSwitchView: (viewId) => {
    handleViewSwitch(viewId);
  },
});

const {
  searchKeyword,
  sidePanelWidth,
  drawerWidth,
  detailWorkspaceRow,
  detailWorkspaceTitle,
  detailWorkspaceDescription,
  detailPropertyItems,
  hasDetailDraftChanges,
  showDetailWorkspace,
  resolvedDetailPresentation,
  workspaceModes,
  canSwitchDetailPresentation,
  detailEmptyAction,
  setPreferredDetailPresentation,
  activateDetailWorkspace,
} = detailWorkspace;

watch(
  () => props.searchKeyword,
  (next) => {
    if (next === undefined) return;
    searchKeyword.value = next;
  },
  { immediate: true },
);

watch(searchKeyword, (keyword) => {
  emit("update:searchKeyword", keyword);
});

watch(
  () => props.currentViewId,
  (next) => {
    if (!next || next === activeViewId.value) return;
    if (next === DETAIL_VIEW_ID) {
      activateDetailWorkspace();
    }
    databaseView.setActiveViewId(next);
  },
  { immediate: true },
);

watch(
  () => props.selectedRecordId,
  (next) => {
    if (next === undefined) return;
    if (!next) {
      handleDetailClose();
      return;
    }
    activateDetailWorkspace();
    databaseView.setSelectedRecord(next);
  },
  { immediate: true },
);

watch(
  activeViewId,
  (next, prev) => {
    emit("update:currentViewId", next);
    if (next === DETAIL_VIEW_ID) {
      activateDetailWorkspace();
    }
    if (prev !== undefined && next !== prev) {
      props.actions?.onViewChange?.({
        tableId: props.tableId,
        view: cloneView(activeView.value),
      });
    }
  },
  { immediate: true },
);

watch(
  activeSelectedRecordId,
  (next, prev) => {
    emit("update:selectedRecordId", next);
    if (prev !== undefined && next !== prev) {
      emit("select-record", selectedRecord.value ?? null);
    }
  },
  { immediate: true },
);

const savedViews = computed(() =>
  databaseView.viewList.value.map((view) => ({
    id: view.id,
    name: view.name,
  })),
);

const toolbarColumns = computed(() => buildTableColumns(activeView.value, resolvedSchema.value, resolvedRecords.value));
const visibleRecordFieldIds = computed(() => getVisibleFieldIds(resolvedSchema.value, resolvedRecords.value));
const loadingStateTitle = "正在加载数据视图";
const loadingStateDescription = "请稍候，页面级编排器正在准备当前视图。";
const errorStateTitle = "数据视图加载失败";
const emptyStateTitle = "暂无记录";
const emptyStateDescription = computed(() => {
  if (activeViewType.value === "detail") {
    return "请选择一条记录，详情工作区会在这里打开。";
  }
  if (activeViewType.value === "timeline") {
    return "当前时间线没有可渲染的起止日期。";
  }
  return "当前视图没有匹配的数据，或者被筛选条件过滤为空。";
});

const currentSort = computed(() => {
  const sort = activeView.value.sorts?.[0];
  return {
    field: sort?.fieldId ?? null,
    order: sort?.direction ?? null,
  } as const;
});

const currentGroup = computed(() => activeView.value.groups?.[0]?.fieldId ?? undefined);
const filterConditions = computed(() => toolbarFilters.value);
const filterActive = computed(() => filterConditions.value.length > 0);
const showToolbar = computed(() => props.showToolbar !== false);
const showViewSwitch = computed(() => props.showViewSwitch !== false && resolvedViewTabs.value.length > 1);
const showFilter = computed(() => props.showFilter !== false);
const showSort = computed(() => props.showSort !== false);
const showGroup = computed(() => props.showGroup !== false);
const showColumns = computed(() => props.showColumns !== false);
const showSearch = computed(() => props.showSearch !== false);

const effectiveLoading = computed(() => props.loading ?? databaseView.loading.value);
const effectiveError = computed(() => props.error ?? databaseView.error.value);

const renderedRecords = computed(() =>
  buildRenderedRecords({
    records: resolvedRecords.value,
    searchKeyword: searchKeyword.value,
    visibleFieldIds: visibleRecordFieldIds.value,
    filterConditions: filterConditions.value,
    filterLogic: filterLogic.value,
    sort: currentSort.value,
  }),
);

const resolvedTimelineItems = computed(() =>
  buildGanttItems(renderedRecords.value, {
    startFieldId: activeViewType.value === "timeline" ? "startDate" : undefined,
    endFieldId: activeViewType.value === "timeline" ? "endDate" : undefined,
    labelFieldId: "title",
  }),
);

const renderState = computed<"loading" | "error" | "empty" | "normal">(() => {
  if (effectiveLoading.value) return "loading";
  if (effectiveError.value) return "error";

  if (activeViewType.value === "detail") {
    return showDetailWorkspace.value ? "normal" : "empty";
  }

  if (activeViewType.value === "timeline") {
    return resolvedTimelineItems.value.length > 0 ? "normal" : "empty";
  }

  return renderedRecords.value.length > 0 ? "normal" : "empty";
});

function setRecords(next: DataRecord[]) {
  databaseView.setRecords(next);
  emit("update:records", next);
}

function handleViewSwitch(viewId: string) {
  if (!databaseView.viewList.value.some((view) => view.id === viewId)) return;
  if (viewId === DETAIL_VIEW_ID) {
    activateDetailWorkspace();
  }
  databaseView.switchView(viewId);
}

function handleToolbarUpdateCurrentView(viewId: string) {
  handleViewSwitch(viewId);
}

function handleToolbarLoadView(viewId: string) {
  if (!databaseView.viewList.value.some((view) => view.id === viewId)) return;
  if (viewId === DETAIL_VIEW_ID) {
    activateDetailWorkspace();
  }
  databaseView.switchView(viewId);
  emit("load-view", viewId);
  props.actions?.onViewLoad?.({ tableId: props.tableId, viewId });
}

function handleToolbarSaveView(name: string) {
  void databaseView.saveView({ name });
}

function syncViewFilters() {
  databaseView.updateActiveView({
    filters: convertToolbarFiltersToViewFilters(toolbarFilters.value),
  });
}

function handleToolbarAddFilter() {
  const fieldId = toolbarColumns.value.find((column) => !column.hidden)?.key ?? "";
  if (!fieldId) return;
  toolbarFilters.value = [...toolbarFilters.value, buildEmptyFilter(fieldId)];
  syncViewFilters();
}

function handleToolbarRemoveFilter(id: string) {
  toolbarFilters.value = toolbarFilters.value.filter((condition) => condition.id !== id);
  syncViewFilters();
}

function handleToolbarUpdateFilter(id: string, update: Partial<ToolbarFilterCondition>) {
  toolbarFilters.value = toolbarFilters.value.map((condition) =>
    condition.id === id ? { ...condition, ...update } : condition,
  );
  syncViewFilters();
}

function handleToolbarClearFilters() {
  toolbarFilters.value = [];
  syncViewFilters();
}

function handleToolbarUpdateFilterLogic(logic: FilterLogic) {
  filterLogic.value = logic;
  emit("update:filterLogic", logic);
}

function handleToolbarColumnsUpdate(columns: TableColumn[]) {
  emit("update:columns", columns);
  databaseView.updateActiveView({
    visibleFields: columns.filter((column) => !column.hidden).map((column) => column.key),
  });
}

function handleToolbarSort(field: string) {
  if (!field) {
    databaseView.updateActiveView({ sorts: [] });
    emit("sort", field);
    return;
  }

  const current = activeView.value.sorts?.[0];
  const nextDirection = current?.fieldId === field && current.direction === "asc" ? "desc" : "asc";
  databaseView.updateActiveView({
    sorts: [{ fieldId: field, direction: nextDirection }],
  });
  emit("sort", field);
}

function handleToolbarGroup(field: string | null) {
  databaseView.updateActiveView({
    groups: field ? [{ fieldId: field }] : [],
  });
  emit("group", field);
}

function handleSearchKeywordUpdate(keyword: string) {
  searchKeyword.value = keyword;
}

function forwardSchemaEvent(event: DatabaseViewSchemaEvent) {
  void databaseView.emitSchemaEvent(event);
}

function patchRecordField(rowId: string, fieldId: string, value: unknown) {
  const next = resolvedRecords.value.map((record) => {
    if (record.id !== rowId) return record;
    return {
      ...record,
      fields: {
        ...record.fields,
        [fieldId]: value as CellValue,
      },
    };
  });
  setRecords(next);
}

function handleCellEdit(payload: { rowId: string; fieldId: string; value: unknown }) {
  patchRecordField(payload.rowId, payload.fieldId, payload.value);
  void databaseView.emitCellEdit(payload);
}

function handleRecordChange(payload: { recordId: string; startDate?: string; endDate?: string }) {
  emit("record-change", payload);
  props.actions?.onRecordChange?.({ tableId: props.tableId, ...payload });
}

function handleTimelineRecordsUpdate(records: DataRecord[]) {
  setRecords(records);
}

function handleKanbanQuickAdd(payload: DatabaseViewKanbanQuickAddEvent) {
  emit("kanban-quick-add", payload);
  void props.actions?.onKanbanQuickAdd?.({
    tableId: props.tableId,
    ...payload,
  });
}

function handleKanbanCardMove(payload: DatabaseViewKanbanCardMoveEvent) {
  emit("kanban-card-move", payload);
  void props.actions?.onKanbanCardMove?.({
    tableId: props.tableId,
    ...payload,
  });
}

function buildRecordPatch(nextRecord: DataRecord, currentRecord: DataRecord): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  const fieldKeys = new Set([
    ...Object.keys(currentRecord.fields),
    ...Object.keys(nextRecord.fields),
  ]);
  for (const key of fieldKeys) {
    if (currentRecord.fields[key] !== nextRecord.fields[key]) {
      patch[key] = nextRecord.fields[key];
    }
  }
  return patch;
}

async function handleKanbanColumnsUpdate(columns: KanbanColumnData[]) {
  const recordsById = new Map(resolvedRecords.value.map((record) => [record.id, record]));
  const nextRecords = columns.flatMap((column) =>
    column.tasks.map((task) => {
      const nextTaskRecord = taskToDataRecord({
        ...task,
        status: column.id,
      });
      const currentRecord = recordsById.get(nextTaskRecord.id);
      if (!currentRecord) return nextTaskRecord;
      return {
        ...currentRecord,
        fields: {
          ...currentRecord.fields,
          ...nextTaskRecord.fields,
        },
        createdAt: currentRecord.createdAt ?? nextTaskRecord.createdAt,
        updatedAt: currentRecord.updatedAt ?? nextTaskRecord.updatedAt,
      };
    }),
  );
  const nextRecordsById = new Map(nextRecords.map((record) => [record.id, record]));
  const persistenceTasks: Promise<void>[] = [];

  for (const record of nextRecords) {
    const currentRecord = recordsById.get(record.id);
    if (!currentRecord) {
      if (props.actions?.onCreateRecord) {
        persistenceTasks.push(
          databaseView.emitCreateRecord({ record }),
        );
      }
      continue;
    }

    const patch = buildRecordPatch(record, currentRecord);
    if (Object.keys(patch).length > 0 && props.actions?.onUpdateRecord) {
      persistenceTasks.push(
        databaseView.emitUpdateRecord({
          recordId: record.id,
          patch,
          record,
        }),
      );
    }
  }

  for (const recordId of recordsById.keys()) {
    if (!nextRecordsById.has(recordId) && props.actions?.onDeleteRecord) {
      persistenceTasks.push(
        databaseView.emitDeleteRecord({ recordId }),
      );
    }
  }

  setRecords(nextRecords);
  if (persistenceTasks.length > 0) {
    await Promise.all(persistenceTasks);
  }
}

function handleRowSelect(record: DataRecord) {
  detailWorkspace.handleRowSelect(record);
}

function handleRowClick(payload: unknown) {
  emit("row-click", payload);
}

function handleContentRowClick(payload: unknown) {
  if (activeViewType.value === "timeline") {
    handleTimelineRowClick(payload as { id?: string; sourceRecordId?: string });
    return;
  }
  handleRowClick(payload);
}

function handleCardClick(payload: unknown) {
  emit("card-click", payload);
  detailWorkspace.handleCardClick(payload as { id?: string } | Record<string, unknown> | null | undefined);
}

function handleTimelineRowClick(payload: { id?: string; sourceRecordId?: string }) {
  emit("row-click", payload);
  detailWorkspace.handleTimelineRowClick(payload);
}

function handleDetailClose() {
  detailWorkspace.handleDetailClose();
}

function handleDetailDelete(rowId: string) {
  detailWorkspace.handleDetailDelete(rowId);
}

function handleDetailWorkspaceCommit(_rowId: string, fieldId: string, value: unknown) {
  detailWorkspace.handleDetailWorkspaceCommit(_rowId, fieldId, value);
}

function handleDetailWorkspaceSave() {
  detailWorkspace.handleDetailWorkspaceSave();
}

function handleSidePanelWidthUpdate(width: number) {
  detailWorkspace.handleSidePanelWidthUpdate(width);
}

function handleDrawerWidthUpdate(width: number) {
  detailWorkspace.handleDrawerWidthUpdate(width);
}
</script>

<template>
  <DatabaseViewShell
    :state="renderState"
    :loading-title="loadingStateTitle"
    :loading-description="loadingStateDescription"
    :error-title="errorStateTitle"
    :error-description="effectiveError instanceof Error ? effectiveError.message : String(effectiveError)"
    :error-icon="AlertCircle"
    :empty-icon="Database"
    :empty-title="emptyStateTitle"
    :empty-description="emptyStateDescription"
    :empty-action="detailEmptyAction"
    v-bind="$attrs"
  >
    <template #toolbar>
      <DatabaseViewToolbar
        v-if="showToolbar"
        :current-view="activeViewId"
        :view-tabs="resolvedViewTabs"
        :columns="toolbarColumns"
        :filter-conditions="filterConditions"
        :filter-logic="filterLogic"
        :filter-active="filterActive"
        :current-sort="currentSort"
        :current-group="currentGroup"
        :search-keyword="searchKeyword"
        :show-view-switch="showViewSwitch"
        :show-filter="showFilter"
        :show-sort="showSort"
        :show-group="showGroup"
        :show-columns="showColumns"
        :show-search="showSearch"
        :saved-views="savedViews"
        @update:current-view="handleToolbarUpdateCurrentView"
        @update:columns="handleToolbarColumnsUpdate"
        @update:search-keyword="handleSearchKeywordUpdate"
        @add-filter="handleToolbarAddFilter"
        @remove-filter="handleToolbarRemoveFilter"
        @update-filter="handleToolbarUpdateFilter"
        @clear-filters="handleToolbarClearFilters"
        @update:filter-logic="handleToolbarUpdateFilterLogic"
        @sort="handleToolbarSort"
        @group="handleToolbarGroup"
        @save-view="handleToolbarSaveView"
        @load-view="handleToolbarLoadView"
      />
    </template>

    <template #content>
      <DatabaseViewContent
        :view-type="activeViewType"
        :records="renderedRecords"
        :schema="resolvedSchema"
        :view="activeView"
        :columns="toolbarColumns"
        :priority-color-map="props.priorityColorMap"
        :status-color-map="props.statusColorMap"
        :group-color-map="props.groupColorMap"
        :kanban-appearance="props.kanbanAppearance"
        :readonly="readonly"
        :enable-field-management="ui?.enableFieldManagement ?? false"
        @cell-edit="handleCellEdit"
        @schema-add-field="(fieldType) => forwardSchemaEvent({ type: 'schema-add-field', fieldType })"
        @schema-rename-field="
          ({ fieldId, newName }) => forwardSchemaEvent({ type: 'schema-rename-field', fieldId, newName })
        "
        @schema-change-field-type="
          ({ fieldId, newType }) => forwardSchemaEvent({ type: 'schema-change-field-type', fieldId, newType })
        "
        @schema-hide-field="(fieldId) => forwardSchemaEvent({ type: 'schema-hide-field', fieldId })"
        @schema-delete-field="(fieldId) => forwardSchemaEvent({ type: 'schema-delete-field', fieldId })"
        @schema-duplicate-field="(fieldId) => forwardSchemaEvent({ type: 'schema-duplicate-field', fieldId })"
        @row-click="handleContentRowClick"
        @row-click-record="handleRowSelect"
        @card-click="handleCardClick"
        @add="emit('add')"
        @add-column="emit('add-column')"
        @update:columns="handleKanbanColumnsUpdate"
        @record-change="handleRecordChange"
        @update:records="handleTimelineRecordsUpdate"
        @kanban-quick-add="handleKanbanQuickAdd"
        @kanban-card-move="handleKanbanCardMove"
      >
        <template v-if="$slots['kanban-column-header']" #kanban-column-header="slotProps">
          <slot name="kanban-column-header" v-bind="slotProps" />
        </template>
        <template v-if="$slots['kanban-card']" #kanban-card="slotProps">
          <slot name="kanban-card" v-bind="slotProps" />
        </template>
        <template v-if="$slots['kanban-card-title']" #kanban-card-title="slotProps">
          <slot name="kanban-card-title" v-bind="slotProps" />
        </template>
        <template v-if="$slots['kanban-card-meta']" #kanban-card-meta="slotProps">
          <slot name="kanban-card-meta" v-bind="slotProps" />
        </template>
        <template v-if="$slots['kanban-card-tags']" #kanban-card-tags="slotProps">
          <slot name="kanban-card-tags" v-bind="slotProps" />
        </template>
      </DatabaseViewContent>
    </template>

    <template #detail>
      <DatabaseViewDetailHost
        v-if="showDetailWorkspace"
        :visible="showDetailWorkspace"
        :title="detailWorkspaceTitle"
        :row-id="detailWorkspaceRow.id"
        :record-id="selectedRecord?.id ?? ''"
        :view-type="activeViewType"
        :description="detailWorkspaceDescription"
        :presentation="resolvedDetailPresentation"
        :source="detailSource"
        :side-panel-width="sidePanelWidth"
        :drawer-width="drawerWidth"
        :can-switch-presentation="canSwitchDetailPresentation"
        :workspace-modes="workspaceModes"
        :property-items="detailPropertyItems"
        :readonly="readonly"
        :has-draft-changes="hasDetailDraftChanges"
        @commit="handleDetailWorkspaceCommit"
        @save="handleDetailWorkspaceSave"
        @delete="handleDetailDelete"
        @close="handleDetailClose"
        @update:side-panel-width="handleSidePanelWidthUpdate"
        @update:drawer-width="handleDrawerWidthUpdate"
        @update:presentation="setPreferredDetailPresentation"
      >
        <template v-if="$slots.header" #header="slotProps">
          <slot name="header" v-bind="slotProps" />
        </template>
        <template v-if="$slots.actions" #actions="slotProps">
          <slot name="actions" v-bind="slotProps" />
        </template>
        <template v-if="$slots.preview" #preview="slotProps">
          <slot name="preview" v-bind="slotProps" />
        </template>
        <template v-if="$slots.activity" #activity="slotProps">
          <slot name="activity" v-bind="slotProps" />
        </template>
        <template v-if="$slots.footer" #footer="slotProps">
          <slot name="footer" v-bind="slotProps" />
        </template>
      </DatabaseViewDetailHost>
    </template>
  </DatabaseViewShell>
</template>

<style scoped>
.of-database-view__toolbar {
  position: sticky;
  top: 0;
  z-index: var(--of-z-raised);
}
</style>
