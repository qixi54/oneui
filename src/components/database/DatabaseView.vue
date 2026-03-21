<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { AlertCircle, Database, Loader2 } from "lucide-vue-next";
import EmptyState from "../base/EmptyState.vue";
import Drawer from "../overlay/Drawer.vue";
import SidePanel from "../overlay/SidePanel.vue";
import TableToolbar from "../table/TableToolbar.vue";
import DatabaseDetailWorkspace from "./DatabaseDetailWorkspace.vue";
import DatabaseViewContent from "./DatabaseViewContent.vue";
import type { EmptyStateAction } from "../base/EmptyState.vue";
import { useDatabaseView } from "../../composables/useDatabaseView";
import {
  DATABASE_DETAIL_VIEW_ID as DETAIL_VIEW_ID,
  DEFAULT_DRAWER_WIDTH,
  DEFAULT_SIDE_PANEL_WIDTH,
  clampWorkspaceWidth,
  readWorkspacePreferences,
  useDatabaseViewport,
  useDatabaseWorkspaceState,
} from "../../composables/useDatabaseWorkspace";
import type {
  DatabaseViewProps,
  DatabaseViewResolvedDetailPresentation,
  DatabaseViewSchemaEvent,
  DatabaseViewViewTab,
} from "../../contracts/database";
import type { FilterCondition as ToolbarFilterCondition, FilterLogic } from "../../composables/useTableFilter";
import type {
  CellValue,
  DataRecord,
  TableColumn,
} from "../../types";
import { buildGanttItems } from "../../types";
import {
  buildDatabaseViewTabs,
  buildDetailColumns,
  buildDetailFieldDefs,
  buildDetailPropertyItems,
  buildDetailWorkspaceDescription,
  buildDetailWorkspaceTitle,
  buildEmptyFilter,
  buildFallbackView,
  buildRenderedRecords,
  buildTableColumns,
  buildVirtualDetailView,
  buildWorkspaceModes,
  cloneView,
  convertToolbarFiltersToViewFilters,
  convertViewFiltersToToolbarFilters,
  getVisibleFieldIds,
  partitionDetailColumns,
  resolveDetailPresentation,
  toDetailRow,
} from "./databaseViewUtils";

const props = withDefaults(defineProps<DatabaseViewProps>(), {
  tableId: "database-view",
  mode: "local",
  detailPresentation: "auto",
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
  "load-view": [string];
  "save-view": [string];
  sort: [string];
  group: [string | null];
  refresh: [];
}>();

defineOptions({ name: "DatabaseView", inheritAttrs: false });

function buildDetailEmptyAction(fallbackViewId: string | null): EmptyStateAction | undefined {
  if (fallbackViewId) {
    return {
      label: "返回列表",
      onClick: () => handleViewSwitch(fallbackViewId),
    };
  }
  return undefined;
}

const initialWorkspacePreferences = readWorkspacePreferences(props.tableId);
const { isMobileViewport } = useDatabaseViewport();
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
    onCellEdit: async (payload) => {
      emit("cell-edit", payload);
      await props.actions?.onCellEdit?.(payload);
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
const detailDraftFields = ref<Record<string, unknown>>({});
const {
  preferredDetailPresentation,
  sidePanelWidth,
  drawerWidth,
  searchKeyword,
} = useDatabaseWorkspaceState({
  tableId: toRef(props, "tableId"),
  activeViewId: databaseView.activeViewId,
  initialSearchKeyword: props.searchKeyword || initialWorkspacePreferences.searchKeyword || "",
  initialDetailPresentation: initialWorkspacePreferences.detailPresentation ?? null,
  initialSidePanelWidth: initialWorkspacePreferences.sidePanelWidth,
  initialDrawerWidth: initialWorkspacePreferences.drawerWidth,
});
const filterLogic = ref<FilterLogic>("and");
const toolbarFilters = ref<ToolbarFilterCondition[]>([]);
const detailWorkspaceActive = ref(
  props.currentViewId === DETAIL_VIEW_ID ||
    props.initialViewId === DETAIL_VIEW_ID ||
    props.selectedRecordId != null ||
    props.initialSelectedRecordId != null,
);

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
  activeView,
  (view) => {
    toolbarFilters.value = convertViewFiltersToToolbarFilters(view.filters ?? []);
  },
  { immediate: true },
);

watch(
  () => props.currentViewId,
  (next) => {
    if (!next || next === activeViewId.value) return;
    databaseView.setActiveViewId(next);
    if (next === DETAIL_VIEW_ID) {
      detailWorkspaceActive.value = true;
    }
  },
  { immediate: true },
);

watch(
  () => props.selectedRecordId,
  (next) => {
    if (next === undefined) return;
    if (!next) {
      detailWorkspaceActive.value = false;
      detailDraftFields.value = {};
      databaseView.clearSelectedRecord();
      return;
    }
    detailWorkspaceActive.value = true;
    detailDraftFields.value = {};
    databaseView.setSelectedRecord(next);
  },
  { immediate: true },
);

watch(
  activeViewId,
  (next, prev) => {
    emit("update:currentViewId", next);
    if (next === DETAIL_VIEW_ID) {
      detailWorkspaceActive.value = true;
    }
    if (prev !== undefined && next !== prev) {
      props.actions?.onViewChange?.({ tableId: props.tableId, view: cloneView(activeView.value) });
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

const resolvedViewTabs = computed<DatabaseViewViewTab[]>(() =>
  buildDatabaseViewTabs({
    providedTabs: props.viewTabs,
    viewList: databaseView.viewList.value,
    detailViewId: DETAIL_VIEW_ID,
  }),
);

const savedViews = computed(() =>
  databaseView.viewList.value.map((view) => ({
    id: view.id,
    name: view.name,
  })),
);

const toolbarColumns = computed(() => buildTableColumns(activeView.value, resolvedSchema.value, resolvedRecords.value));
const detailColumns = computed(() => buildDetailColumns(resolvedSchema.value, resolvedRecords.value));
const detailFieldDefs = computed(() => buildDetailFieldDefs(resolvedSchema.value, resolvedRecords.value));
const detailRow = computed(() => toDetailRow(selectedRecord.value));
const detailWorkspaceRow = computed(() => ({
  ...detailRow.value,
  ...detailDraftFields.value,
}));
const detailWorkspaceTitle = computed(() => buildDetailWorkspaceTitle(selectedRecord.value));
const detailColumnPartitions = computed(() => partitionDetailColumns(detailColumns.value, detailFieldDefs.value));
const detailPropertyColumns = computed(() => detailColumnPartitions.value.propertyColumns);
const detailContentColumns = computed(() => detailColumnPartitions.value.contentColumns);
const detailWorkspaceDescription = computed(() =>
  buildDetailWorkspaceDescription(detailContentColumns.value, detailWorkspaceRow.value),
);
const detailPropertyItems = computed(() =>
  buildDetailPropertyItems({
    columns: detailPropertyColumns.value,
    fieldDefs: detailFieldDefs.value,
    row: detailWorkspaceRow.value,
  }),
);
const hasDetailDraftChanges = computed(() => Object.keys(detailDraftFields.value).length > 0);
const visibleRecordFieldIds = computed(() => getVisibleFieldIds(resolvedSchema.value, resolvedRecords.value));

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
const showDetailWorkspace = computed(() => detailWorkspaceActive.value && Boolean(selectedRecord.value));
const resolvedDetailPresentation = computed<DatabaseViewResolvedDetailPresentation>(() =>
  resolveDetailPresentation({
    requested: props.detailPresentation,
    preferred: preferredDetailPresentation.value,
    isMobileViewport: isMobileViewport.value,
  }),
);
const workspaceModes = computed(() => buildWorkspaceModes(isMobileViewport.value));
const canSwitchDetailPresentation = computed(() => props.detailPresentation === "auto");

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

const detailEmptyAction = computed<EmptyStateAction | undefined>(() => {
  if (activeViewType.value !== "detail") return undefined;

  const firstRecord = resolvedRecords.value[0];
  if (firstRecord) {
    return {
      label: "打开第一条记录",
      onClick: () => openRecord(firstRecord),
    };
  }

  const fallbackViewId = resolvedViewTabs.value.find((tab) => tab.value !== DETAIL_VIEW_ID)?.value ?? null;
  return buildDetailEmptyAction(fallbackViewId);
});

function setRecords(next: DataRecord[]) {
  databaseView.setRecords(next);
  emit("update:records", next);
}

function openRecord(record: DataRecord | null) {
  if (!record) return;
  detailWorkspaceActive.value = true;
  detailDraftFields.value = {};
  databaseView.setSelectedRecord(record);
}

function setPreferredDetailPresentation(mode: DatabaseViewResolvedDetailPresentation) {
  if (!canSwitchDetailPresentation.value) return;
  preferredDetailPresentation.value = mode;
}

function findRecordById(recordId: string | undefined | null) {
  if (!recordId) return null;
  return resolvedRecords.value.find((record) => record.id === recordId) ?? null;
}

function handleViewSwitch(viewId: string) {
  if (!databaseView.viewList.value.some((view) => view.id === viewId)) return;
  if (viewId === DETAIL_VIEW_ID) {
    detailWorkspaceActive.value = true;
  }
  databaseView.switchView(viewId);
}

function handleToolbarUpdateCurrentView(viewId: string) {
  handleViewSwitch(viewId);
}

function handleToolbarLoadView(viewId: string) {
  if (!databaseView.viewList.value.some((view) => view.id === viewId)) return;
  if (viewId === DETAIL_VIEW_ID) {
    detailWorkspaceActive.value = true;
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
  emit("update:searchKeyword", keyword);
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

function handleRowSelect(record: DataRecord) {
  openRecord(record);
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
  openRecord(findRecordById((payload as { id?: string } | null | undefined)?.id));
}

function handleTimelineRowClick(payload: { id?: string; sourceRecordId?: string }) {
  emit("row-click", payload);
  openRecord(findRecordById(payload.sourceRecordId ?? payload.id));
}

function handleDetailClose() {
  detailWorkspaceActive.value = false;
  detailDraftFields.value = {};
  databaseView.clearSelectedRecord();
}

function handleDetailSave(payload: { rowId: string; fields: Record<string, unknown> }) {
  for (const [fieldId, value] of Object.entries(payload.fields)) {
    handleCellEdit({ rowId: payload.rowId, fieldId, value });
  }
  detailDraftFields.value = {};
  handleDetailClose();
}

function handleDetailDelete(rowId: string) {
  const next = resolvedRecords.value.filter((record) => record.id !== rowId);
  setRecords(next);
  detailWorkspaceActive.value = false;
  detailDraftFields.value = {};
  databaseView.clearSelectedRecord();
}

function handleDetailWorkspaceCommit(_rowId: string, fieldId: string, value: unknown) {
  detailDraftFields.value = {
    ...detailDraftFields.value,
    [fieldId]: value,
  };
}

function handleDetailWorkspaceSave() {
  if (!selectedRecord.value) return;
  handleDetailSave({
    rowId: selectedRecord.value.id,
    fields: { ...detailDraftFields.value },
  });
}

function handleSidePanelWidthUpdate(width: number) {
  sidePanelWidth.value = clampWorkspaceWidth(width, DEFAULT_SIDE_PANEL_WIDTH);
}

function handleDrawerWidthUpdate(width: number) {
  drawerWidth.value = clampWorkspaceWidth(width, DEFAULT_DRAWER_WIDTH);
}
</script>

<template>
  <section class="of-database-view" data-role="database-view" v-bind="$attrs">
    <div
      v-if="renderState === 'loading'"
      class="of-database-view__state of-database-view__state--loading"
      data-role="loading-state"
    >
      <Loader2 class="of-database-view__spinner" :size="20" />
      <div class="of-database-view__state-text">
        <div class="of-database-view__state-title">正在加载数据视图</div>
        <div class="of-database-view__state-description">请稍候，页面级编排器正在准备当前视图。</div>
      </div>
    </div>

    <div v-else-if="renderState === 'error'" class="of-database-view__state" data-role="error-state">
      <EmptyState
        :icon="AlertCircle"
        title="数据视图加载失败"
        :description="effectiveError instanceof Error ? effectiveError.message : String(effectiveError)"
      />
    </div>

    <template v-else>
      <TableToolbar
        v-if="showToolbar"
        class="of-database-view__toolbar"
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

      <div v-if="renderState === 'empty'" class="of-database-view__state of-database-view__state--empty" data-role="empty-state">
        <EmptyState
          :icon="Database"
          title="暂无记录"
          :description="
            activeViewType === 'detail'
              ? '请选择一条记录，详情工作区会在这里打开。'
              : activeViewType === 'timeline'
                ? '当前时间线没有可渲染的起止日期。'
                : '当前视图没有匹配的数据，或者被筛选条件过滤为空。'
          "
          :action="detailEmptyAction"
        />
      </div>

      <DatabaseViewContent
        v-else
        :view-type="activeViewType"
        :records="renderedRecords"
        :schema="resolvedSchema"
        :view="activeView"
        :columns="toolbarColumns"
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
        @record-change="handleRecordChange"
        @update:records="handleTimelineRecordsUpdate"
      />
    </template>

    <SidePanel
      v-if="showDetailWorkspace && resolvedDetailPresentation === 'side-panel'"
      :model-value="showDetailWorkspace"
      :title="detailWorkspaceTitle"
      :width="sidePanelWidth"
      :resizable="true"
      mode="persistent"
      @update:width="handleSidePanelWidthUpdate"
      @update:model-value="handleDetailClose"
    >
      <DatabaseDetailWorkspace
        :row-id="detailWorkspaceRow.id"
        :record-id="selectedRecord?.id ?? ''"
        :title="detailWorkspaceTitle"
        :description="detailWorkspaceDescription"
        :view-type="activeViewType"
        :presentation="resolvedDetailPresentation"
        :can-switch-presentation="canSwitchDetailPresentation"
        :workspace-modes="workspaceModes"
        :property-items="detailPropertyItems"
        :readonly="readonly"
        :has-draft-changes="hasDetailDraftChanges"
        @commit="handleDetailWorkspaceCommit"
        @save="handleDetailWorkspaceSave"
        @delete="handleDetailDelete"
        @close="handleDetailClose"
        @update:presentation="setPreferredDetailPresentation"
      />
    </SidePanel>

    <Drawer
      v-else-if="showDetailWorkspace"
      :model-value="showDetailWorkspace"
      :title="detailWorkspaceTitle"
      :width="drawerWidth"
      :resizable="resolvedDetailPresentation !== 'full-page'"
      :fullscreen="resolvedDetailPresentation === 'full-page'"
      :mask-closable="true"
      @update:width="handleDrawerWidthUpdate"
      @update:model-value="handleDetailClose"
    >
      <DatabaseDetailWorkspace
        :row-id="detailWorkspaceRow.id"
        :record-id="selectedRecord?.id ?? ''"
        :title="detailWorkspaceTitle"
        :description="detailWorkspaceDescription"
        :view-type="activeViewType"
        :presentation="resolvedDetailPresentation"
        :can-switch-presentation="canSwitchDetailPresentation"
        :workspace-modes="workspaceModes"
        :property-items="detailPropertyItems"
        :readonly="readonly"
        :has-draft-changes="hasDetailDraftChanges"
        @commit="handleDetailWorkspaceCommit"
        @save="handleDetailWorkspaceSave"
        @delete="handleDetailDelete"
        @close="handleDetailClose"
        @update:presentation="setPreferredDetailPresentation"
      />
    </Drawer>
  </section>
</template>

<style scoped>
.of-database-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  min-height: 100%;
}

.of-database-view__toolbar {
  position: sticky;
  top: 0;
  z-index: 2;
}

.of-database-view__content {
  min-width: 0;
}

.of-database-view__view {
  min-width: 0;
}

.of-database-view__detail-anchor {
  min-height: 1px;
}

.of-database-view__state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200));
  border-radius: var(--of-radius-xl);
  background: var(--of-surface-elevated, var(--of-color-white));
}

.of-database-view__state--loading {
  gap: 14px;
  color: var(--of-text-secondary, var(--of-color-text-secondary));
}

.of-database-view__state-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.of-database-view__state-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--of-text-primary, var(--of-color-text));
}

.of-database-view__state-description {
  font-size: 13px;
  color: var(--of-text-secondary, var(--of-color-text-secondary));
}

.of-database-view__spinner {
  animation: of-database-view-spin 0.9s linear infinite;
  color: var(--of-accent-default, #334155);
  flex-shrink: 0;
}

@keyframes of-database-view-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
