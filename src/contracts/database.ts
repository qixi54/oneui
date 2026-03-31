import type { Component, Ref } from "vue";
import type {
  ColorMap,
  DataRecord,
  Density,
  KanbanColumnData,
  Task,
  TableColumn,
  TableSchema,
  ViewConfig,
} from "../types";
import type { FilterLogic } from "../composables/useTableFilter";

export type DatabaseViewMode = "local" | "provider";

export type DatabaseViewSortOrder = "asc" | "desc" | null;

export interface DatabaseViewSortState {
  field: string | null;
  order: DatabaseViewSortOrder;
}

export interface DatabaseViewFetchParams {
  tableId: string;
  schema: TableSchema | null;
  view: ViewConfig;
  page: number;
  pageSize: number;
  sort: DatabaseViewSortState;
  selectedRecordId: string | null;
}

export interface DatabaseViewFetchResult<T extends DataRecord = DataRecord> {
  records?: readonly T[] | T[];
  data?: readonly T[] | T[];
  total?: number;
  schema?: TableSchema | null;
  views?: readonly ViewConfig[] | ViewConfig[] | null;
  activeViewId?: string | null;
  selectedRecordId?: string | null;
}

export interface DatabaseViewProvider<T extends DataRecord = DataRecord> {
  mode?: DatabaseViewMode;
  onFetch?: (params: DatabaseViewFetchParams) => Promise<DatabaseViewFetchResult<T>>;
  onRefresh?: (params: DatabaseViewFetchParams) => Promise<void> | void;
}

export interface DatabaseViewActionContext<T extends DataRecord = DataRecord> {
  action:
    | "cell-edit"
    | "create-record"
    | "update-record"
    | "delete-record"
    | "select-record"
    | "schema-event"
    | "save-view"
    | "delete-view"
    | "refresh";
  payload: unknown;
  tableId: string;
  mode: DatabaseViewMode;
  view: ViewConfig;
  activeViewId: string;
  selectedRecordId: string | null;
  selectedRecord: T | null;
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface DatabaseViewActionErrorContext<T extends DataRecord = DataRecord>
  extends DatabaseViewActionContext<T> {
  error: unknown;
}

export interface DatabaseViewActionMiddleware<T extends DataRecord = DataRecord> {
  before?: (context: DatabaseViewActionContext<T>) => Promise<void> | void;
  after?: (context: DatabaseViewActionContext<T>) => Promise<void> | void;
  error?: (context: DatabaseViewActionErrorContext<T>) => Promise<void> | void;
}

export type DatabaseViewActionMiddlewareList<T extends DataRecord = DataRecord> =
  | DatabaseViewActionMiddleware<T>
  | readonly DatabaseViewActionMiddleware<T>[];

export type DatabaseSchemaEvent =
  | { type: "schema-add-field"; fieldType: string }
  | { type: "schema-rename-field"; fieldId: string; newName: string }
  | { type: "schema-change-field-type"; fieldId: string; newType: string }
  | { type: "schema-hide-field"; fieldId: string }
  | { type: "schema-delete-field"; fieldId: string }
  | { type: "schema-duplicate-field"; fieldId: string };

export type DatabaseViewSchemaEvent = DatabaseSchemaEvent;

export interface DatabaseViewActions<T extends DataRecord = DataRecord> {
  middleware?: DatabaseViewActionMiddlewareList<T>;
  onCellEdit?: (payload: { rowId: string; fieldId: string; value: unknown }) => Promise<void> | void;
  onCreateRecord?: (payload: { record: T }) => Promise<void> | void;
  onUpdateRecord?: (payload: {
    recordId: string;
    patch: Record<string, unknown>;
    record: T;
  }) => Promise<void> | void;
  onDeleteRecord?: (payload: { recordId: string }) => Promise<void> | void;
  onSelectRecord?: (record: T | null) => Promise<void> | void;
  onSchemaEvent?: (event: DatabaseSchemaEvent) => Promise<void> | void;
  onSaveView?: (view: ViewConfig) => Promise<void> | void;
  onDeleteView?: (viewId: string) => Promise<void> | void;
  onRefresh?: () => Promise<void> | void;
}

export interface DatabaseViewDetailOptions {
  clearSelection?: boolean;
}

export interface DatabaseViewNavigationOptions {
  wrap?: boolean;
  openDetail?: boolean;
}

export interface UseDatabaseViewOptions<T extends DataRecord = DataRecord> {
  tableId: string;
  mode?: DatabaseViewMode;
  schema?: Ref<TableSchema | null | undefined> | TableSchema | null | undefined;
  records?: Ref<readonly T[] | T[] | undefined> | readonly T[] | T[] | undefined;
  views?: Ref<readonly ViewConfig[] | ViewConfig[] | undefined> | readonly ViewConfig[] | ViewConfig[] | undefined;
  provider?: DatabaseViewProvider<T>;
  actions?: DatabaseViewActions<T>;
  defaultView?: ViewConfig;
  initialViewId?: string;
  initialSelectedRecordId?: string | null;
  initialDetailOpen?: boolean;
  pageSize?: number;
  autoLoad?: boolean;
}

export interface UseDatabaseViewResult<T extends DataRecord = DataRecord> {
  tableId: string;
  mode: Readonly<Ref<DatabaseViewMode>>;
  schema: Readonly<Ref<TableSchema | null>>;
  records: Readonly<Ref<readonly T[]>>;
  views: Readonly<Ref<ViewConfig[]>>;
  activeViewId: Readonly<Ref<string>>;
  activeView: Readonly<Ref<ViewConfig>>;
  selectedRecordId: Readonly<Ref<string | null>>;
  selectedRecord: Readonly<Ref<T | null>>;
  selectedRecordIndex: Readonly<Ref<number>>;
  selectedRecordOrdinal: Readonly<Ref<number | null>>;
  hasSelectedRecord: Readonly<Ref<boolean>>;
  detailOpen: Readonly<Ref<boolean>>;
  detailRecord: Readonly<Ref<T | null>>;
  loading: Readonly<Ref<boolean>>;
  error: Readonly<Ref<Error | null>>;
  page: Readonly<Ref<number>>;
  pageSize: Readonly<Ref<number>>;
  totalCount: Readonly<Ref<number>>;
  viewList: Readonly<Ref<{ id: string; name: string; type: ViewConfig["viewType"] }[]>>;
  isProviderMode: Readonly<Ref<boolean>>;
  isLocalMode: Readonly<Ref<boolean>>;
  refresh: () => Promise<void>;
  getRecordById: (recordId: string) => T | null;
  getRecordIndex: (recordId: string) => number;
  selectRecord: (record: T | string | null) => void;
  openRecordDetail: (record?: T | string | null) => void;
  closeRecordDetail: (options?: DatabaseViewDetailOptions) => void;
  toggleRecordDetail: (record?: T | string | null) => void;
  selectNextRecord: (options?: DatabaseViewNavigationOptions) => void;
  selectPreviousRecord: (options?: DatabaseViewNavigationOptions) => void;
  switchView: (viewId: string) => void;
  setActiveViewId: (viewId: string) => void;
  createView: (name: string, baseConfig?: Partial<ViewConfig>) => Promise<string>;
  saveView: (config?: Partial<ViewConfig>) => Promise<void>;
  deleteView: (viewId: string) => Promise<void>;
  duplicateView: (sourceViewId: string, newName: string) => Promise<string>;
  updateActiveView: (patch: Partial<ViewConfig>) => void;
  setSelectedRecord: (record: T | string | null) => void;
  clearSelectedRecord: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  emitCellEdit: (payload: { rowId: string; fieldId: string; value: unknown }) => Promise<void>;
  emitCreateRecord: (payload: { record: T }) => Promise<void>;
  emitUpdateRecord: (payload: { recordId: string; patch: Record<string, unknown>; record: T }) => Promise<void>;
  emitDeleteRecord: (payload: { recordId: string }) => Promise<void>;
  emitSchemaEvent: (event: DatabaseSchemaEvent) => Promise<void>;
  setRecords: (next: readonly T[] | T[]) => void;
}

export interface DatabaseViewViewTab {
  value: string;
  label: string;
  icon?: string | Component;
}

export interface DatabaseViewUiOptions {
  enableFieldManagement?: boolean;
}

export type DatabaseViewLegacyDetailPresentation = "sheet" | "full-page";
export type DatabaseViewResolvedDetailPresentation = "side-panel" | "drawer" | "fullscreen";
export type DatabaseViewDetailPresentation =
  | "auto"
  | DatabaseViewResolvedDetailPresentation
  | DatabaseViewLegacyDetailPresentation;
export type DatabaseDetailPresenterShell = "side-panel" | "drawer" | "fullscreen";

export interface DatabaseDetailPresenterResolution {
  shell: DatabaseDetailPresenterShell;
  mode?: "persistent" | "lazy";
  fullscreen?: boolean;
  resizable: boolean;
  maskClosable: boolean;
}

export interface DatabaseDetailWorkspaceModeOption {
  value: Exclude<DatabaseViewDetailPresentation, "auto">;
  label: string;
}

export interface DatabaseDetailWorkspacePropertyItem {
  key: string;
  label: string;
  field?: unknown;
  value: unknown;
  fallbackText: string;
}

export interface DatabaseDetailWorkspaceSlotContext {
  rowId: string;
  recordId: string;
  source?: string;
  title: string;
  description: string;
  viewType: string;
  presentation: Exclude<DatabaseViewDetailPresentation, "auto">;
  canSwitchPresentation: boolean;
  workspaceModes: DatabaseDetailWorkspaceModeOption[];
  propertyItems: DatabaseDetailWorkspacePropertyItem[];
  readonly: boolean;
  hasDraftChanges: boolean;
}

export interface DatabaseDetailWorkspaceSlots {
  header?: (props: DatabaseDetailWorkspaceSlotContext) => unknown;
  actions?: (props: DatabaseDetailWorkspaceSlotContext) => unknown;
  preview?: (props: DatabaseDetailWorkspaceSlotContext) => unknown;
  activity?: (props: DatabaseDetailWorkspaceSlotContext) => unknown;
  footer?: (props: DatabaseDetailWorkspaceSlotContext) => unknown;
}

export interface DatabaseViewKanbanColumnHeaderSlotContext {
  column: KanbanColumnData;
  taskCount: number;
  dotColor: string;
  tasks: Task[];
  records: DataRecord[];
  addCard: () => void;
}

export interface DatabaseViewKanbanCardSlotContext {
  task: Task;
  record: DataRecord;
  fields: DataRecord["fields"];
  displayDate: string;
  priorityBadge: {
    label: string;
    style: Record<string, string>;
  };
  statusBadge: {
    label: string;
    style: Record<string, string>;
  };
  priorityLabel: string;
  statusLabel: string;
}

export type DatabaseViewKanbanFullCardSlotContext = DatabaseViewKanbanCardSlotContext;

export interface DatabaseViewKanbanAppearance {
  cardVariant?: "default" | "compact" | "custom";
  columnVariant?: "default" | "board" | "flat";
  quickAddVisible?: boolean;
  showColumnCount?: boolean;
}

export interface DatabaseViewKanbanQuickAddEvent {
  columnId: string;
  title: string;
  task: Task;
  record: DataRecord;
  fields: DataRecord["fields"];
}

export interface DatabaseViewKanbanCardMoveEvent {
  recordId: string;
  fromColumnId: string;
  toColumnId: string;
  task: Task;
  record: DataRecord;
  fields: DataRecord["fields"];
}

export interface DatabaseViewKanbanSlots {
  "kanban-column-header"?: (props: DatabaseViewKanbanColumnHeaderSlotContext) => unknown;
  "kanban-card"?: (props: DatabaseViewKanbanFullCardSlotContext) => unknown;
  "kanban-card-title"?: (props: DatabaseViewKanbanCardSlotContext) => unknown;
  "kanban-card-meta"?: (props: DatabaseViewKanbanCardSlotContext) => unknown;
  "kanban-card-tags"?: (props: DatabaseViewKanbanCardSlotContext) => unknown;
}

export type DatabaseViewSlots = DatabaseDetailWorkspaceSlots & DatabaseViewKanbanSlots;
export type DatabaseDetailPresenterSlots = DatabaseDetailWorkspaceSlots;
export type DatabaseViewDetailHostSlots = DatabaseDetailWorkspaceSlots;

export interface DatabaseViewWorkspacePreferences {
  activeViewId?: string;
  detailPresentation?: Exclude<DatabaseViewDetailPresentation, "auto">;
  sidePanelWidth?: number;
  drawerWidth?: number;
  searchKeyword?: string;
}

export interface DatabaseViewComponentActions
  extends Omit<DatabaseViewActions<DataRecord>, "onCreateRecord" | "onUpdateRecord" | "onDeleteRecord"> {
  onViewChange?: (payload: { tableId: string; view: ViewConfig }) => void | Promise<void>;
  onViewLoad?: (payload: { tableId: string; viewId: string }) => void | Promise<void>;
  onViewSave?: (payload: { tableId: string; viewId: string; name: string }) => void | Promise<void>;
  onUpdateRecord?: (payload: {
    tableId: string;
    recordId: string;
    patch: Record<string, unknown>;
    record: DataRecord;
  }) => void | Promise<void>;
  onCreateRecord?: (payload: {
    tableId: string;
    record: DataRecord;
  }) => void | Promise<void>;
  onDeleteRecord?: (payload: {
    tableId: string;
    recordId: string;
  }) => void | Promise<void>;
  onRecordChange?: (payload: {
    tableId: string;
    recordId: string;
    startDate?: string;
    endDate?: string;
  }) => void | Promise<void>;
  onKanbanQuickAdd?: (payload: {
    tableId: string;
    columnId: string;
    title: string;
    task: Task;
    record: DataRecord;
    fields: DataRecord["fields"];
  }) => void | Promise<void>;
  onKanbanCardMove?: (payload: {
    tableId: string;
    recordId: string;
    fromColumnId: string;
    toColumnId: string;
    task: Task;
    record: DataRecord;
    fields: DataRecord["fields"];
  }) => void | Promise<void>;
}

export interface DatabaseViewProps {
  tableId?: string;
  mode?: DatabaseViewMode;
  detailPresentation?: DatabaseViewDetailPresentation;
  detailSource?: string;
  density?: Density;
  priorityColorMap?: ColorMap;
  statusColorMap?: ColorMap;
  groupColorMap?: ColorMap;
  kanbanAppearance?: DatabaseViewKanbanAppearance;
  schema?: TableSchema | null;
  records?: DataRecord[];
  views?: ViewConfig[];
  provider?: DatabaseViewProvider<DataRecord>;
  defaultView?: ViewConfig;
  currentViewId?: string;
  initialViewId?: string;
  selectedRecordId?: string | null;
  initialSelectedRecordId?: string | null;
  searchKeyword?: string;
  loading?: boolean;
  error?: string | Error | null;
  viewTabs?: DatabaseViewViewTab[];
  actions?: DatabaseViewComponentActions;
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

export interface DatabaseViewEmits {
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
}
