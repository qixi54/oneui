// ─── Base ────────────────────────────────────────────────────────────────────
export {
  ViewTab,
  ToolbarBtn,
  AddViewBtn,
  Badge,
  RangeSlider,
  ProgressBar,
  ButtonGroup,
  EmptyState,
  StatisticCard,
  DropdownMenu,
  StatusIndicator,
  Switch,
  Stepper,
  Accordion,
  Avatar,
  RefTag,
  DescBlock,
  ViewModeGroup,
  ViewSwitcher,
  SelectBadge,
  ChainItem,
  SectionBlock,
  MonitorItem,
  StatusSummary,
  InfoCard,
  PersonaCard,
  SearchHighlight,
} from "./components/base";
export type {
  ButtonOption,
  EmptyStateAction,
  MenuItem,
  StepItem,
  StepperProps,
  StepStatus,
  AvatarProps,
  RefTagProps,
  ViewModeOption,
  ViewModeGroupProps,
  ViewSwitcherTab,
  ViewSwitcherProps,
  SelectBadgeProps,
  ChainItemProps,
  SectionBlockProps,
  MonitorItemProps,
  StatusSummaryProps,
  StatusSummaryItem,
  InfoCardProps,
  PersonaCardProps,
} from "./components/base";

// ─── Layout ──────────────────────────────────────────────────────────────────
export { AppLayout, Navbar, Sidebar, StatusBar } from "./components/layout";

// ─── Field (standalone) ─────────────────────────────────────────────────────
export { default as FieldMarkdownPreview } from "./components/field/FieldMarkdownPreview.vue";

// ─── Table ───────────────────────────────────────────────────────────────────
export {
  DataTable,
  TableHeaderRow,
  TableDataRow,
  TableGroupRow,
  NewRowBtn,
  TableFilterPanel,
  TableColumnManager,
  TableToolbar,
  FieldCell,
  FieldTypePicker,
  ColumnHeaderMenu,
} from "./components/table";
// ExcelExport 可选导入（需要 xlsx 依赖）：import { ExcelExport } from 'oneflow-ui/dist/components/table'

// ─── Plugin Registry ────────────────────────────────────────────────────────
export {
  pluginComponentNames,
  pluginComponentRegistry,
  installPluginComponents,
  registerOneUIComponents,
} from "./registry/plugin-components";

// ─── Gallery ─────────────────────────────────────────────────────────────────
export { GalleryView, GalleryCard } from "./components/gallery";

// ─── Timeline ────────────────────────────────────────────────────────────────
export { ActivityTimeline, GanttTimeline, GanttRow } from "./components/timeline";
export type {
  ActivityTimelineProps,
  ActivityTimelineStatus,
  TimelineItem,
} from "./components/timeline";

// ─── Editor ──────────────────────────────────────────────────────────────────
export { ContentBlock, BlockQuote, CodeBlock, RefLink, RichTextEditor } from "./components/editor";

// ─── Form ────────────────────────────────────────────────────────────────────
export { FormDesigner } from "./components/form";

// ─── Database ────────────────────────────────────────────────────────────────
export { DatabaseView } from "./components/database";
export type {
  DatabaseViewActions as DatabaseViewComponentActions,
  DatabaseViewSchemaEvent,
  DatabaseViewViewTab,
  DatabaseViewProps,
} from "./components/database";

// ─── Auxiliary ───────────────────────────────────────────────────────────────
export { ColorPanel, PersonPanel, FileUpload } from "./components/auxiliary";

// ─── Detail ──────────────────────────────────────────────────────────────────
export { DetailLayout, PropPanel, PropRow, CommentItem } from "./components/detail";

// ─── Dashboard ───────────────────────────────────────────────────────────────
export {
  Dashboard,
  BarChart,
  PieChart,
  DoughnutChart,
  NumberCard,
  TableChart,
} from "./components/Dashboard";

// ─── Kanban ──────────────────────────────────────────────────────────────────
export { KanbanBoard, KanbanColumn, KanbanCard, QuickAddRow } from "./components/kanban";

// ─── AI Native ───────────────────────────────────────────────────────────────
export {
  AiThinking,
  AiStreamingCursor,
  AiMessageBubble,
  UserMessageBubble,
  AiMessageList,
  AiSender,
} from "./components/ai";

// ─── Overlay ─────────────────────────────────────────────────────────────────
export { Modal, Dialog, Drawer, SidePanel } from "./components/overlay";

// ─── Toast ───────────────────────────────────────────────────────────────────
export { ToastContainer, ToastItem } from "./components/toast";

// ─── Tabs ────────────────────────────────────────────────────────────────────
export { Tabs, TabPanel } from "./components/tabs";
export type { TabItem } from "./components/tabs";

// ─── Breadcrumb ──────────────────────────────────────────────────────────────
export { Breadcrumb, BreadcrumbItem } from "./components/breadcrumb";
export type { BreadcrumbItemData } from "./components/breadcrumb";

// ─── Mermaid ─────────────────────────────────────────────────────────────────
export { MermaidChart } from "./components/mermaid";

// ─── Split ───────────────────────────────────────────────────────────────────
export { SplitPane } from "./components/split";
export { default as ContextMenu } from "./components/ContextMenu/index.vue";
export type { ContextMenuItem } from "./components/ContextMenu/index.vue";

// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  Task,
  Priority,
  TaskStatus,
  ViewType,
  FieldType,
  FieldDefBase,
  FieldDef,
  TextFieldDef,
  NumberFieldDef,
  SelectFieldDef,
  DateFieldDef,
  CheckboxFieldDef,
  ContactFieldDef,
  RatingFieldDef,
  UserFieldDef,
  AttachmentFieldDef,
  RelationFieldDef,
  FormulaFieldDef,
  SelectOption,
  CellValue,
  ActiveCell,
  AggregationFn,
  AggregationConfig,
  DraftRowState,
  DataRecord,
  SortConfig,
  GroupConfig,
  FilterCondition as SchemaFilterCondition,
  ViewConfig,
  TableSchema,
  CurrencyFieldDef,
  RichTextFieldDef,
  AutoNumberFieldDef,
  CreatorFieldDef,
  ProgressFieldDef,
  ViewTabItem,
  TableColumn,
  KanbanColumnData,
  GalleryItem,
  GanttItem,
  PropItem,
  CommentData,
  SidebarItem,
  BadgeConfig,
  ColorMap,
} from "./types";
export {
  isSelectField,
  isFormulaField,
  taskToDataRecord,
  dataRecordToTask,
  buildKanbanColumns,
  buildGalleryItems,
  buildGanttItems,
} from "./types";

// ─── Supabase Adapter ───────────────────────────────────────────────────────
export {
  rowToDataRecord,
  rowsToDataRecords,
  dataRecordToRow,
  fieldsToRow,
  useSupabaseAdapter,
} from "./utils/supabaseAdapter";
export type { RowAdapterOptions, UseSupabaseAdapterOptions } from "./utils/supabaseAdapter";

export type { ChatMessage, UseAiChatOptions } from "./composables/useAiChat";
export type { UseStreamOptions, StreamMode, RetryOptions } from "./composables/useStream";
export type { UseTypewriterOptions } from "./composables/useTypewriter";
export type { FilterCondition, FilterLogic, FilterOperator } from "./composables/useTableFilter";
export type { SortState, PaginationState, UseTableOptions } from "./composables/useTable";
export type { UseMarkdownOptions } from "./composables/useMarkdown";
export type {
  ToastType,
  ToastItem as ToastItemData,
  UseToastOptions,
} from "./composables/useToast";
export type { UseVirtualListOptions } from "./composables/useVirtualList";
export type { EditingCell } from "./composables/useInlineEdit";
export type { UseColumnResizeOptions } from "./composables/useColumnResize";
export type { UseFixedColumnsOptions } from "./composables/useFixedColumns";
export type { UseKeyboardNavigationOptions } from "./composables/useKeyboardNavigation";
export type { RowReorderPayload, RowGroupChangePayload } from "./composables/useRowDrag";
export type { UseDraftRowsOptions } from "./composables/useDraftRows";
export type {
  ValidationRule,
  FilterFieldConfig,
  FilterPanelConfig,
  UseSchemaEngineOptions,
} from "./composables/useSchemaEngine";

// ─── Utils: Supabase Schema Introspection ───────────────────────────────────
export { inferSchema, fetchSchemaFromSupabase, humanizeColumnName } from "./utils/supabaseSchema";
export type { PgColumnInfo, InferSchemaOptions } from "./utils/supabaseSchema";

// ─── Composables ─────────────────────────────────────────────────────────────
export {
  useBadge,
  resolveBadge,
  mergeColorMap,
  DEFAULT_PRIORITY_MAP,
  DEFAULT_STATUS_MAP,
} from "./composables";
export { useStream } from "./composables/useStream";
export { useTypewriter } from "./composables/useTypewriter";
export { useAiChat } from "./composables/useAiChat";
export { useTableFilter } from "./composables/useTableFilter";
export { useTable } from "./composables/useTable";
export { useMarkdown } from "./composables/useMarkdown";
export { useToast } from "./composables/useToast";
export { useVirtualList } from "./composables/useVirtualList";
export { useInlineEdit } from "./composables/useInlineEdit";
export { useColumnResize } from "./composables/useColumnResize";
export { useFixedColumns } from "./composables/useFixedColumns";
export { useKeyboardNavigation } from "./composables/useKeyboardNavigation";
export { useRowDrag } from "./composables/useRowDrag";
export { useDraftRows } from "./composables/useDraftRows";
export { useWorkerSort } from "./composables/useWorkerSort";
export { useSchemaEngine } from "./composables/useSchemaEngine";
export { useSupabaseProvider } from "./composables/useSupabaseProvider";
export type {
  SupabaseQueryBuilder,
  SupabaseFilterBuilder,
  UseSupabaseProviderOptions,
} from "./composables/useSupabaseProvider";

export {
  useViewPersistence,
  createLocalStorageBackend,
  createSupabaseBackend,
} from "./composables/useViewPersistence";
export type {
  ViewStorageBackend,
  SupabaseViewBackendOptions,
  UseViewPersistenceOptions,
} from "./composables/useViewPersistence";

export { useDatabaseView } from "./composables/useDatabaseView";
export type {
  DatabaseViewMode,
  DatabaseViewFetchParams,
  DatabaseViewFetchResult,
  DatabaseViewProvider,
  DatabaseSchemaEvent,
  DatabaseViewActions,
  UseDatabaseViewOptions,
  UseDatabaseViewResult,
} from "./composables/useDatabaseView";
export { useDatabaseViewport, useDatabaseWorkspaceState } from "./composables/useDatabaseWorkspace";

export { useSearch } from "./composables/useSearch";
export type {
  UseSearchOptions,
  SearchHighlight as SearchHighlightSegment,
} from "./composables/useSearch";
