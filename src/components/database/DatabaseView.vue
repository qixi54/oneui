<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, type Component } from "vue";
import { AlertCircle, Database, Loader2 } from "lucide-vue-next";
import EmptyState from "../base/EmptyState.vue";
import FieldCell from "../table/FieldCell.vue";
import DetailLayout from "../detail/DetailLayout.vue";
import Drawer from "../overlay/Drawer.vue";
import SidePanel from "../overlay/SidePanel.vue";
import TableToolbar from "../table/TableToolbar.vue";
import DataTable from "../table/DataTable.vue";
import KanbanBoard from "../kanban/KanbanBoard.vue";
import GalleryView from "../gallery/GalleryView.vue";
import GanttTimeline from "../timeline/GanttTimeline.vue";
import type { EmptyStateAction } from "../base/EmptyState.vue";
import type { FieldDef as CellFieldDef } from "../table/FieldCell.vue";
import {
  useDatabaseView,
  type DatabaseViewActions as ViewDatabaseActions,
  type DatabaseViewMode,
  type DatabaseSchemaEvent,
  type DatabaseViewProvider as ViewDatabaseProvider,
} from "../../composables/useDatabaseView";
import type { FilterCondition as ToolbarFilterCondition, FilterLogic } from "../../composables/useTableFilter";
import type {
  CellValue,
  DataRecord,
  FieldDef as SchemaFieldDef,
  Density,
  TableColumn,
  TableSchema,
  ViewConfig,
} from "../../types";
import { buildGanttItems } from "../../types";

export interface DatabaseViewViewTab {
  value: string;
  label: string;
  icon?: string | Component;
}

export type DatabaseViewSchemaEvent = DatabaseSchemaEvent;

export interface DatabaseViewActions extends ViewDatabaseActions<DataRecord> {
  onViewChange?: (payload: { tableId: string; view: ViewConfig }) => void | Promise<void>;
  onViewLoad?: (payload: { tableId: string; viewId: string }) => void | Promise<void>;
  onViewSave?: (payload: { tableId: string; viewId: string; name: string }) => void | Promise<void>;
  onRecordChange?: (payload: {
    tableId: string;
    recordId: string;
    startDate?: string;
    endDate?: string;
  }) => void | Promise<void>;
}

export interface DatabaseViewUiOptions {
  enableFieldManagement?: boolean;
}

export type DatabaseViewDetailPresentation = "auto" | "side-panel" | "sheet" | "full-page";
type DatabaseViewResolvedDetailPresentation = Exclude<DatabaseViewDetailPresentation, "auto">;

interface DatabaseViewWorkspacePreferences {
  activeViewId?: string;
  detailPresentation?: DatabaseViewResolvedDetailPresentation;
  sidePanelWidth?: number;
  drawerWidth?: number;
  searchKeyword?: string;
}

export interface DatabaseViewProps {
  tableId?: string;
  mode?: DatabaseViewMode;
  detailPresentation?: DatabaseViewDetailPresentation;
  density?: Density;
  schema?: TableSchema | null;
  records?: DataRecord[];
  views?: ViewConfig[];
  provider?: ViewDatabaseProvider<DataRecord>;
  defaultView?: ViewConfig;
  currentViewId?: string;
  initialViewId?: string;
  selectedRecordId?: string | null;
  initialSelectedRecordId?: string | null;
  searchKeyword?: string;
  loading?: boolean;
  error?: string | Error | null;
  viewTabs?: DatabaseViewViewTab[];
  actions?: DatabaseViewActions;
  ui?: DatabaseViewUiOptions;
  showToolbar?: boolean;
  showViewSwitch?: boolean;
  showFilter?: boolean;
  showSort?: boolean;
  showGroup?: boolean;
  showColumns?: boolean;
  showSearch?: boolean;
  readonly?: boolean;
  pageSize?: number;
  autoLoad?: boolean;
}

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

const DETAIL_VIEW_ID = "detail";
const MOBILE_BREAKPOINT = "(max-width: 768px)";
const WORKSPACE_STORAGE_PREFIX = "oneui-database-workspace:";
const DEFAULT_SIDE_PANEL_WIDTH = 720;
const DEFAULT_DRAWER_WIDTH = 900;
const MIN_DETAIL_PANEL_WIDTH = 420;
const MAX_DETAIL_PANEL_WIDTH = 1320;

defineOptions({ name: "DatabaseView", inheritAttrs: false });

const isMobileViewport = ref(false);
let mobileMediaQuery: MediaQueryList | null = null;

function syncMobileViewport() {
  isMobileViewport.value = mobileMediaQuery?.matches ?? false;
}

onMounted(() => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
  mobileMediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
  syncMobileViewport();
  mobileMediaQuery.addEventListener("change", syncMobileViewport);
});

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener("change", syncMobileViewport);
  mobileMediaQuery = null;
});

function cloneView(view: ViewConfig): ViewConfig {
  return {
    ...view,
    visibleFields: [...view.visibleFields],
    sorts: view.sorts?.map((item) => ({ ...item })),
    groups: view.groups?.map((item) => ({ ...item })),
    filters: view.filters?.map((item) => ({ ...item })),
    aggregations: view.aggregations?.map((item) => ({ ...item })),
    fixedColumns: view.fixedColumns ? [...view.fixedColumns] : undefined,
    galleryCardFields: view.galleryCardFields ? [...view.galleryCardFields] : undefined,
  };
}

function clampWorkspaceWidth(width: number, fallback: number): number {
  if (!Number.isFinite(width)) return fallback;
  return Math.max(MIN_DETAIL_PANEL_WIDTH, Math.min(MAX_DETAIL_PANEL_WIDTH, width));
}

function getWorkspaceStorageKey(tableId?: string): string | null {
  const normalized = (tableId ?? "").trim();
  return normalized ? `${WORKSPACE_STORAGE_PREFIX}${normalized}` : null;
}

function readWorkspacePreferences(tableId?: string): DatabaseViewWorkspacePreferences {
  const storageKey = getWorkspaceStorageKey(tableId);
  if (!storageKey || typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    return JSON.parse(raw) as DatabaseViewWorkspacePreferences;
  } catch {
    return {};
  }
}

function writeWorkspacePreferences(tableId: string | undefined, prefs: DatabaseViewWorkspacePreferences) {
  const storageKey = getWorkspaceStorageKey(tableId);
  if (!storageKey || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(prefs));
  } catch {
    // ignore storage failures
  }
}

function inferFieldIdsFromRecords(records: DataRecord[]): string[] {
  const first = records[0];
  return first ? Object.keys(first.fields) : [];
}

function getViewTypeIcon(viewType: ViewConfig["viewType"]): string {
  switch (viewType) {
    case "kanban":
      return "columns-3";
    case "gallery":
      return "image";
    case "timeline":
      return "calendar-range";
    case "detail":
      return "file-text";
    case "table":
    default:
      return "table-2";
  }
}

function buildFallbackView(schema?: TableSchema | null, records: DataRecord[] = []): ViewConfig {
  const visibleFields = getVisibleFieldIds(schema, records);

  return {
    viewId: "table",
    viewType: "table",
    name: schema?.name || "表格",
    visibleFields,
    sorts: [],
    groups: [],
    filters: [],
    fixedColumns: [],
  };
}

function buildVirtualDetailView(schema?: TableSchema | null, records: DataRecord[] = []): ViewConfig {
  const visibleFields = getVisibleFieldIds(schema, records);

  return {
    viewId: DETAIL_VIEW_ID,
    viewType: "detail",
    name: "详情",
    visibleFields,
    sorts: [],
    groups: [],
    filters: [],
    fixedColumns: [],
  };
}

function getFieldLabel(fieldId: string, schema?: TableSchema | null): string {
  return schema?.fields.find((field) => field.id === fieldId)?.name ?? fieldId;
}

function resolveColumnType(field?: SchemaFieldDef): TableColumn["type"] {
  switch (field?.type) {
    case "number":
    case "currency":
    case "progress":
      return "number";
    case "date":
    case "datetime":
      return "date";
    case "select":
    case "multi_select":
      return "status";
    default:
      return "string";
  }
}

function resolveCellFieldType(field?: SchemaFieldDef): CellFieldDef["type"] {
  switch (field?.type) {
    case "number":
      return "number";
    case "select":
      return "select";
    case "multi_select":
      return "multiselect";
    case "date":
      return "date";
    case "datetime":
      return "datetime";
    case "checkbox":
      return "checkbox";
    case "url":
      return "url";
    case "email":
      return "email";
    case "phone":
      return "phone";
    case "rating":
      return "rating";
    case "attachment":
      return "attachment";
    case "relation":
      return "relation";
    case "formula":
      return "text";
    case "currency":
      return "currency";
    case "richtext":
      return "richtext";
    case "auto_number":
      return "auto_number";
    case "creator":
      return "creator";
    case "progress":
      return "progress";
    case "text":
    default:
      return "text";
  }
}

function buildTableColumns(view: ViewConfig, schema?: TableSchema | null, records: DataRecord[] = []) {
  const orderedFieldIds =
    (view.visibleFields?.length ?? 0) > 0
      ? view.visibleFields
      : getVisibleFieldIds(schema, records);

  return orderedFieldIds.map((fieldId) => {
    const field = schema?.fields?.find((item) => item.id === fieldId);
    return {
      key: fieldId,
      label: getFieldLabel(fieldId, schema),
      type: resolveColumnType(field),
      hidden: field?.hidden ?? false,
      width: field?.width,
    } satisfies TableColumn;
  });
}

function buildDetailColumns(schema?: TableSchema | null, records: DataRecord[] = []) {
  const orderedFieldIds = getVisibleFieldIds(schema, records);

  return orderedFieldIds.map((fieldId) => {
    const field = schema?.fields?.find((item) => item.id === fieldId);
    return {
      key: fieldId,
      label: getFieldLabel(fieldId, schema),
      type: resolveColumnType(field),
      hidden: field?.hidden ?? false,
      width: field?.width,
    } satisfies TableColumn;
  });
}

function buildDetailFieldDefs(schema?: TableSchema | null, records: DataRecord[] = []) {
  const orderedFieldIds = getVisibleFieldIds(schema, records);

  return orderedFieldIds.map((fieldId) => {
    const field = schema?.fields?.find((item) => item.id === fieldId);
    return {
      id: fieldId,
      type: resolveCellFieldType(field),
      label: getFieldLabel(fieldId, schema),
    } satisfies CellFieldDef;
  });
}

function normalizeCellValue(value: CellValue): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((item) => String(item)).join(", ");
  return String(value);
}

function compareCellValues(a: CellValue, b: CellValue): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  const aNumber = Number(a);
  const bNumber = Number(b);
  const aNumeric = Number.isFinite(aNumber) && `${a}`.trim() !== "";
  const bNumeric = Number.isFinite(bNumber) && `${b}`.trim() !== "";
  if (aNumeric && bNumeric) return aNumber - bNumber;

  const aTime = Date.parse(String(a));
  const bTime = Date.parse(String(b));
  if (Number.isFinite(aTime) && Number.isFinite(bTime)) return aTime - bTime;

  return normalizeCellValue(a).localeCompare(normalizeCellValue(b), "zh-Hans-CN");
}

function evaluateFilterCondition(value: CellValue, condition: ToolbarFilterCondition): boolean {
  const rawValue = normalizeCellValue(value).trim();
  const expected = (condition.value ?? "").trim();
  const lowerValue = rawValue.toLowerCase();
  const lowerExpected = expected.toLowerCase();

  switch (condition.operator) {
    case "equals":
      return lowerValue === lowerExpected;
    case "not_equals":
      return lowerValue !== lowerExpected;
    case "contains":
      return lowerValue.includes(lowerExpected);
    case "not_contains":
      return !lowerValue.includes(lowerExpected);
    case "starts_with":
      return lowerValue.startsWith(lowerExpected);
    case "ends_with":
      return lowerValue.endsWith(lowerExpected);
    case "gt":
      return compareCellValues(value, expected) > 0;
    case "gte":
      return compareCellValues(value, expected) >= 0;
    case "lt":
      return compareCellValues(value, expected) < 0;
    case "lte":
      return compareCellValues(value, expected) <= 0;
    case "is_empty":
      return rawValue === "";
    case "is_not_empty":
      return rawValue !== "";
    default:
      return true;
  }
}

function buildEmptyFilter(fieldId: string): ToolbarFilterCondition {
  return {
    id: `f_${Math.random().toString(36).slice(2, 8)}`,
    field: fieldId,
    operator: "contains",
    value: "",
  };
}

type SchemaFilterCondition = NonNullable<ViewConfig["filters"]>[number];

function convertViewFiltersToToolbarFilters(filters: ViewConfig["filters"] = []): ToolbarFilterCondition[] {
  return filters.map((filter, index) => ({
    id: `f_${filter.fieldId}_${index}`,
    field: filter.fieldId,
    operator: (() => {
      switch (filter.operator) {
        case "eq":
          return "equals";
        case "neq":
          return "not_equals";
        case "gt":
          return "gt";
        case "lt":
          return "lt";
        case "is_empty":
          return "is_empty";
        case "is_not_empty":
          return "is_not_empty";
        case "contains":
        default:
          return "contains";
      }
    })(),
    value: filter.value == null ? "" : String(filter.value),
  }));
}

function convertToolbarFiltersToViewFilters(
  filters: ToolbarFilterCondition[],
): NonNullable<ViewConfig["filters"]> {
  return filters
    .filter((filter) => filter.field)
    .map((filter): SchemaFilterCondition => {
      let operator: SchemaFilterCondition["operator"];
      switch (filter.operator) {
        case "equals":
          operator = "eq";
          break;
        case "not_equals":
          operator = "neq";
          break;
        case "gt":
        case "gte":
          operator = "gt";
          break;
        case "lt":
        case "lte":
          operator = "lt";
          break;
        case "is_empty":
          operator = "is_empty";
          break;
        case "is_not_empty":
          operator = "is_not_empty";
          break;
        case "contains":
        case "not_contains":
        case "starts_with":
        case "ends_with":
        default:
          operator = "contains";
          break;
      }

      return {
        fieldId: filter.field,
        operator,
        value: filter.value == null ? "" : filter.value,
      };
    });
}

function getVisibleFieldIds(schema?: TableSchema | null, records: DataRecord[] = []): string[] {
  const schemaFieldIds = schema?.fields?.filter((field) => !field.hidden).map((field) => field.id);
  if (schemaFieldIds?.length) return schemaFieldIds;
  return inferFieldIdsFromRecords(records);
}

function toDetailRow(record: DataRecord | null): Record<string, unknown> & { id: string } {
  if (!record) {
    return { id: "__detail-empty__" };
  }
  return {
    id: record.id,
    ...record.fields,
  };
}

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
    source.push(buildVirtualDetailView(props.schema, props.records ?? []));
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
const preferredDetailPresentation = ref<DatabaseViewResolvedDetailPresentation | null>(
  initialWorkspacePreferences.detailPresentation ?? null,
);
const sidePanelWidth = ref(
  clampWorkspaceWidth(initialWorkspacePreferences.sidePanelWidth ?? DEFAULT_SIDE_PANEL_WIDTH, DEFAULT_SIDE_PANEL_WIDTH),
);
const drawerWidth = ref(
  clampWorkspaceWidth(initialWorkspacePreferences.drawerWidth ?? DEFAULT_DRAWER_WIDTH, DEFAULT_DRAWER_WIDTH),
);
const searchKeyword = ref(props.searchKeyword || initialWorkspacePreferences.searchKeyword || "");
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
  [activeViewId, searchKeyword, preferredDetailPresentation, sidePanelWidth, drawerWidth],
  ([nextViewId, nextSearchKeyword, nextDetailPresentation, nextSidePanelWidth, nextDrawerWidth]) => {
    writeWorkspacePreferences(props.tableId, {
      activeViewId: nextViewId,
      searchKeyword: nextSearchKeyword,
      detailPresentation: nextDetailPresentation ?? undefined,
      sidePanelWidth: nextSidePanelWidth,
      drawerWidth: nextDrawerWidth,
    });
  },
  { immediate: true },
);

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

const resolvedViewTabs = computed<DatabaseViewViewTab[]>(() => {
  const sourceTabs =
    props.viewTabs && props.viewTabs.length > 0
      ? props.viewTabs.map((tab) => ({ ...tab }))
      : databaseView.viewList.value.map((view) => ({
          value: view.id,
          label: view.name,
          icon: getViewTypeIcon(view.type),
        }));

  const tabs: DatabaseViewViewTab[] = [];
  const seen = new Set<string>();
  for (const tab of sourceTabs) {
    if (seen.has(tab.value)) continue;
    seen.add(tab.value);
    tabs.push(tab);
  }

  if (!seen.has(DETAIL_VIEW_ID)) {
    tabs.push({ value: DETAIL_VIEW_ID, label: "详情", icon: getViewTypeIcon("detail") });
  }

  return tabs;
});

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
const detailWorkspaceTitle = computed(
  () =>
    normalizeCellValue(
      selectedRecord.value?.fields?.title ??
        selectedRecord.value?.fields?.name ??
        selectedRecord.value?.fields?.subject ??
        selectedRecord.value?.id ??
        "记录详情",
    ) || "记录详情",
);
const detailContentFieldIds = computed(
  () => new Set(detailFieldDefs.value.filter((field) => field.type === "richtext").map((field) => field.id)),
);
const detailPropertyColumns = computed(() =>
  detailColumns.value.filter((column) => !detailContentFieldIds.value.has(column.key)),
);
const detailContentColumns = computed(() =>
  detailColumns.value.filter((column) => detailContentFieldIds.value.has(column.key)),
);
const detailWorkspaceDescription = computed(() => {
  const blocks = detailContentColumns.value
    .map((column) => {
      const value = getDetailCellValue(column.key);
      const text = normalizeCellValue(value).trim();
      if (!text) return "";
      return `## ${column.label}\n\n${text}`;
    })
    .filter((block) => block.length > 0);
  return blocks.join("\n\n");
});
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
const resolvedDetailPresentation = computed<DatabaseViewResolvedDetailPresentation>(() => {
  if (props.detailPresentation !== "auto") {
    return props.detailPresentation;
  }
  if (preferredDetailPresentation.value) {
    if (preferredDetailPresentation.value === "side-panel" && isMobileViewport.value) {
      return "sheet";
    }
    return preferredDetailPresentation.value;
  }
  return isMobileViewport.value ? "sheet" : "side-panel";
});
const workspaceModes = computed<Array<{ value: DatabaseViewResolvedDetailPresentation; label: string }>>(() => {
  const modes: Array<{ value: DatabaseViewResolvedDetailPresentation; label: string }> = [];
  if (!isMobileViewport.value) {
    modes.push({ value: "side-panel", label: "侧栏" });
  }
  modes.push({ value: "sheet", label: "抽屉" });
  modes.push({ value: "full-page", label: "全屏" });
  return modes;
});
const canSwitchDetailPresentation = computed(() => props.detailPresentation === "auto");

const effectiveLoading = computed(() => props.loading ?? databaseView.loading.value);
const effectiveError = computed(() => props.error ?? databaseView.error.value);

const renderedRecords = computed(() => {
  let rows = [...resolvedRecords.value];

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase();
    rows = rows.filter((record) =>
      visibleRecordFieldIds.value.some((fieldId) =>
        normalizeCellValue(record.fields[fieldId as keyof DataRecord["fields"]]).toLowerCase().includes(keyword),
      ),
    );
  }

  if (filterConditions.value.length > 0) {
    rows = rows.filter((record) => {
      const results = filterConditions.value.map((condition) => {
        const value = record.fields[condition.field as keyof DataRecord["fields"]];
        return evaluateFilterCondition(value as CellValue, condition);
      });
      return filterLogic.value === "and" ? results.every(Boolean) : results.some(Boolean);
    });
  }

  const sort = currentSort.value;
  if (sort.field && sort.order) {
    rows.sort((a, b) => {
      const cmp = compareCellValues(
        a.fields[sort.field as keyof DataRecord["fields"]],
        b.fields[sort.field as keyof DataRecord["fields"]],
      );
      return sort.order === "desc" ? -cmp : cmp;
    });
  }

  return rows;
});

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

function handleCardClick(payload: { id?: string } | Record<string, unknown>) {
  emit("card-click", payload);
  openRecord(findRecordById((payload as { id?: string }).id));
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

function getDetailFieldDef(fieldId: string): CellFieldDef {
  return (
    detailFieldDefs.value.find((field) => field.id === fieldId) ?? {
      id: fieldId,
      type: "text" as const,
      label: fieldId,
    }
  );
}

function getDetailCellValue(fieldId: string): CellValue {
  if (Object.prototype.hasOwnProperty.call(detailDraftFields.value, fieldId)) {
    return detailDraftFields.value[fieldId] as CellValue;
  }
  return detailRow.value[fieldId as keyof typeof detailRow.value] as CellValue;
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

      <div v-else class="of-database-view__content" :data-view="activeViewType">
        <DataTable
          v-if="activeViewType === 'table'"
          class="of-database-view__view of-database-view__view--table"
          :records="renderedRecords"
          :schema="resolvedSchema ?? undefined"
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
          @row-click="handleRowClick"
          @row-click-record="handleRowSelect"
        />

        <KanbanBoard
          v-else-if="activeViewType === 'kanban'"
          class="of-database-view__view of-database-view__view--kanban"
          :records="renderedRecords"
          :schema="resolvedSchema ?? undefined"
          :view="activeView"
          @card-click="handleCardClick"
          @update:columns="() => undefined"
          @add-column="() => emit('add-column')"
        />

        <GalleryView
          v-else-if="activeViewType === 'gallery'"
          class="of-database-view__view of-database-view__view--gallery"
          :records="renderedRecords"
          :schema="resolvedSchema ?? undefined"
          :view="activeView"
          @card-click="handleCardClick"
          @add="() => emit('add')"
        />

        <GanttTimeline
          v-else-if="activeViewType === 'timeline'"
          class="of-database-view__view of-database-view__view--timeline"
          :records="renderedRecords"
          :schema="resolvedSchema ?? undefined"
          :view-config="activeView"
          @row-click="handleTimelineRowClick"
          @record-change="handleRecordChange"
          @update:records="handleTimelineRecordsUpdate"
        />

        <div v-else class="of-database-view__detail-anchor" />
      </div>
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
      <DetailLayout
        :title="detailWorkspaceTitle"
        :comments="[]"
        :description-content="detailWorkspaceDescription"
        :description-editable="false"
      >
        <template #meta>
          <div
            v-if="canSwitchDetailPresentation"
            class="of-database-view__workspace-modes"
            data-role="workspace-mode-switch"
          >
            <button
              v-for="mode in workspaceModes"
              :key="mode.value"
              type="button"
              class="of-database-view__workspace-mode-btn"
              :class="{ 'of-database-view__workspace-mode-btn--active': resolvedDetailPresentation === mode.value }"
              :data-mode="mode.value"
              @click="setPreferredDetailPresentation(mode.value)"
            >
              {{ mode.label }}
            </button>
          </div>
          <span class="of-database-view__workspace-chip">{{ selectedRecord?.id ?? "record" }}</span>
          <span class="of-database-view__workspace-chip">{{ activeViewType }}</span>
          <span class="of-database-view__workspace-chip">{{ resolvedDetailPresentation }}</span>
        </template>

        <template #props>
          <div class="of-database-view__detail-workspace" :data-record-id="selectedRecord?.id ?? ''">
            <section class="of-database-view__detail-workspace-properties">
              <div
                v-for="column in detailPropertyColumns"
                :key="column.key"
                class="of-database-view__detail-workspace-field"
              >
                <span class="of-database-view__detail-workspace-label">{{ column.label }}</span>
                <div class="of-database-view__detail-workspace-value">
                  <FieldCell
                    v-if="detailFieldDefs.length > 0"
                    :row-id="detailWorkspaceRow.id"
                    :field="getDetailFieldDef(column.key)"
                    :value="getDetailCellValue(column.key)"
                    :readonly="readonly"
                    @commit="handleDetailWorkspaceCommit"
                  />
                  <span v-else class="of-database-view__detail-workspace-fallback">
                    {{ getDetailCellValue(column.key) ?? "—" }}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </template>

        <template #footer>
          <button
            class="of-database-view__detail-workspace-btn of-database-view__detail-workspace-btn--delete"
            type="button"
            @click="handleDetailDelete(selectedRecord?.id ?? detailWorkspaceRow.id)"
          >
            删除
          </button>
          <div class="of-database-view__detail-workspace-footer-spacer" />
          <button
            class="of-database-view__detail-workspace-btn of-database-view__detail-workspace-btn--cancel"
            type="button"
            @click="handleDetailClose"
          >
            取消
          </button>
          <button
            class="of-database-view__detail-workspace-btn of-database-view__detail-workspace-btn--save"
            type="button"
            :disabled="readonly || !hasDetailDraftChanges"
            @click="handleDetailWorkspaceSave"
          >
            保存
          </button>
        </template>
      </DetailLayout>
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
      <DetailLayout
        :title="detailWorkspaceTitle"
        :comments="[]"
        :description-content="detailWorkspaceDescription"
        :description-editable="false"
      >
        <template #meta>
          <div
            v-if="canSwitchDetailPresentation"
            class="of-database-view__workspace-modes"
            data-role="workspace-mode-switch"
          >
            <button
              v-for="mode in workspaceModes"
              :key="mode.value"
              type="button"
              class="of-database-view__workspace-mode-btn"
              :class="{ 'of-database-view__workspace-mode-btn--active': resolvedDetailPresentation === mode.value }"
              :data-mode="mode.value"
              @click="setPreferredDetailPresentation(mode.value)"
            >
              {{ mode.label }}
            </button>
          </div>
          <span class="of-database-view__workspace-chip">{{ selectedRecord?.id ?? "record" }}</span>
          <span class="of-database-view__workspace-chip">{{ activeViewType }}</span>
          <span class="of-database-view__workspace-chip">{{ resolvedDetailPresentation }}</span>
        </template>

        <template #props>
          <div class="of-database-view__detail-workspace" :data-record-id="selectedRecord?.id ?? ''">
            <section class="of-database-view__detail-workspace-properties">
              <div
                v-for="column in detailPropertyColumns"
                :key="column.key"
                class="of-database-view__detail-workspace-field"
              >
                <span class="of-database-view__detail-workspace-label">{{ column.label }}</span>
                <div class="of-database-view__detail-workspace-value">
                  <FieldCell
                    v-if="detailFieldDefs.length > 0"
                    :row-id="detailWorkspaceRow.id"
                    :field="getDetailFieldDef(column.key)"
                    :value="getDetailCellValue(column.key)"
                    :readonly="readonly"
                    @commit="handleDetailWorkspaceCommit"
                  />
                  <span v-else class="of-database-view__detail-workspace-fallback">
                    {{ getDetailCellValue(column.key) ?? "—" }}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </template>

        <template #footer>
          <button
            class="of-database-view__detail-workspace-btn of-database-view__detail-workspace-btn--delete"
            type="button"
            @click="handleDetailDelete(selectedRecord?.id ?? detailWorkspaceRow.id)"
          >
            删除
          </button>
          <div class="of-database-view__detail-workspace-footer-spacer" />
          <button
            class="of-database-view__detail-workspace-btn of-database-view__detail-workspace-btn--cancel"
            type="button"
            @click="handleDetailClose"
          >
            取消
          </button>
          <button
            class="of-database-view__detail-workspace-btn of-database-view__detail-workspace-btn--save"
            type="button"
            :disabled="readonly || !hasDetailDraftChanges"
            @click="handleDetailWorkspaceSave"
          >
            保存
          </button>
        </template>
      </DetailLayout>
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

.of-database-view__detail-workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.of-database-view__detail-workspace-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.of-database-view__workspace-modes {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border: 1px solid var(--of-workspace-border, var(--of-border-subtle, var(--of-color-gray-200)));
  border-radius: var(--of-radius-pill, 999px);
  background: var(--of-surface-workspace-raised, var(--of-surface-elevated, var(--of-color-bg-elevated)));
}

.of-database-view__workspace-mode-btn {
  border: none;
  background: transparent;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
  border-radius: var(--of-radius-pill, 999px);
  padding: 6px 10px;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
}

.of-database-view__workspace-mode-btn--active {
  background: var(--of-row-action-surface, var(--of-surface-selected, var(--of-color-gray-100)));
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-database-view__detail-workspace-heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.of-database-view__detail-workspace-kicker {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
}

.of-database-view__detail-workspace-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-database-view__detail-workspace-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
}

.of-database-view__detail-workspace-id,
.of-database-view__detail-workspace-mode {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--of-surface-muted, var(--of-color-gray-100, #f3f4f6));
}

.of-database-view__detail-workspace-body {
  display: grid;
  gap: 20px;
  min-height: 0;
}

.of-database-view__detail-workspace-properties,
.of-database-view__detail-workspace-content {
  display: grid;
  gap: 12px;
}

.of-database-view__detail-workspace-field,
.of-database-view__detail-workspace-content-block {
  display: grid;
  gap: 6px;
  padding: 14px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  border-radius: var(--of-radius-xl, 12px);
  background: var(--of-surface-elevated, var(--of-color-white, #ffffff));
}

.of-database-view__detail-workspace-label,
.of-database-view__detail-workspace-content-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--of-text-secondary, var(--of-color-text-secondary, #6b7280));
}

.of-database-view__detail-workspace-value,
.of-database-view__detail-workspace-fallback {
  min-width: 0;
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-database-view__detail-workspace-fallback {
  line-height: 1.6;
}

.of-database-view__detail-workspace-markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.of-database-view__detail-workspace-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.of-database-view__detail-workspace-footer-spacer {
  flex: 1;
}

.of-database-view__detail-workspace-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: var(--of-radius-lg, 8px);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.of-database-view__detail-workspace-btn--delete {
  border-color: var(--of-border-subtle, var(--of-color-danger-border, #fecaca));
  background: var(--of-surface-selected, var(--of-color-danger-bg, #fef2f2));
  color: var(--of-color-danger, #b91c1c);
}

.of-database-view__detail-workspace-btn--cancel {
  border-color: var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  background: var(--of-surface-panel, var(--of-color-gray-50, #f9fafb));
  color: var(--of-text-primary, var(--of-color-text, #111827));
}

.of-database-view__detail-workspace-btn--save {
  border-color: var(--of-border-strong, rgba(15, 23, 42, 0.14));
  background: var(--of-accent-default, #334155);
  color: var(--of-text-inverse, #fff);
}

.of-database-view__detail-workspace-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
