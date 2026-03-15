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
} from "./components/base";
export type { ButtonOption, EmptyStateAction, MenuItem, StepItem, StepperProps, StepStatus, AvatarProps, RefTagProps, ViewModeOption, ViewModeGroupProps, ViewSwitcherTab, ViewSwitcherProps, SelectBadgeProps, ChainItemProps, SectionBlockProps, MonitorItemProps, StatusSummaryProps, StatusSummaryItem, InfoCardProps, PersonaCardProps } from "./components/base";

// ─── Layout ──────────────────────────────────────────────────────────────────
export { AppLayout, Navbar, Sidebar, StatusBar } from "./components/layout";

// ─── Table ───────────────────────────────────────────────────────────────────
export {
  DataTable,
  TableHeaderRow,
  TableDataRow,
  TableGroupRow,
  NewRowBtn,
  TableFilterPanel,
  TableColumnManager,
  FieldCell,
} from "./components/table";
// ExcelExport 可选导入（需要 xlsx 依赖）：import { ExcelExport } from 'oneflow-ui/dist/components/table'

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

// ─── Auxiliary ───────────────────────────────────────────────────────────────
export { ColorPanel, PersonPanel, FileUpload } from "./components/auxiliary";

// ─── Detail ──────────────────────────────────────────────────────────────────
export { DetailLayout, PropPanel, PropRow, CommentItem } from "./components/detail";

// ─── Dashboard ───────────────────────────────────────────────────────────────
export { Dashboard, BarChart, PieChart, DoughnutChart, NumberCard, TableChart } from "./components/Dashboard";

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
  DataRecord,
  SortConfig,
  GroupConfig,
  FilterCondition as SchemaFilterCondition,
  ViewConfig,
  TableSchema,
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
} from "./types";

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

// ─── Plugin Install ───────────────────────────────────────────────────────────
import type { App } from "vue";
import {
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
} from "./components/base";
import { AppLayout, Navbar, Sidebar, StatusBar } from "./components/layout";
import { DataTable, TableHeaderRow, TableDataRow, TableGroupRow, NewRowBtn } from "./components/table";
import { TableFilterPanel, TableColumnManager, FieldCell } from "./components/table";
import { KanbanBoard, KanbanColumn, KanbanCard, QuickAddRow } from "./components/kanban";
import { GalleryView, GalleryCard } from "./components/gallery";
import { ActivityTimeline, GanttTimeline, GanttRow } from "./components/timeline";
import { ContentBlock, BlockQuote, CodeBlock, RefLink, RichTextEditor } from "./components/editor";
import { FormDesigner } from "./components/form";
import { ColorPanel, PersonPanel, FileUpload } from "./components/auxiliary";
import { DetailLayout, PropPanel, PropRow, CommentItem } from "./components/detail";
import { Dashboard, BarChart, PieChart, DoughnutChart, NumberCard, TableChart } from "./components/Dashboard";
import {
  AiThinking,
  AiStreamingCursor,
  AiMessageBubble,
  UserMessageBubble,
  AiMessageList,
  AiSender,
} from "./components/ai";
import { Modal, Dialog, Drawer, SidePanel } from "./components/overlay";
import { ToastContainer, ToastItem } from "./components/toast";
import { Tabs, TabPanel } from "./components/tabs";
import { Breadcrumb, BreadcrumbItem } from "./components/breadcrumb";
import { MermaidChart } from "./components/mermaid";
import { SplitPane } from "./components/split";
import ContextMenu from "./components/ContextMenu/index.vue";

const components = [
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
  AppLayout,
  Navbar,
  Sidebar,
  StatusBar,
  DataTable,
  TableHeaderRow,
  TableDataRow,
  TableGroupRow,
  NewRowBtn,
  TableFilterPanel,
  TableColumnManager,
  FieldCell,
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  QuickAddRow,
  GalleryView,
  GalleryCard,
  ActivityTimeline,
  GanttTimeline,
  GanttRow,
  ContentBlock,
  BlockQuote,
  CodeBlock,
  RefLink,
  RichTextEditor,
  FormDesigner,
  ColorPanel,
  PersonPanel,
  FileUpload,
  DetailLayout,
  PropPanel,
  PropRow,
  CommentItem,
  Dashboard,
  BarChart,
  PieChart,
  DoughnutChart,
  NumberCard,
  TableChart,
  AiThinking,
  AiStreamingCursor,
  AiMessageBubble,
  UserMessageBubble,
  AiMessageList,
  AiSender,
  Modal,
  Dialog,
  Drawer,
  SidePanel,
  ToastContainer,
  ToastItem,
  Tabs,
  TabPanel,
  Breadcrumb,
  BreadcrumbItem,
  MermaidChart,
  SplitPane,
  RefTag,
  DescBlock,
  ViewModeGroup,
  ViewSwitcher,
  ContextMenu,
  SelectBadge,
  ChainItem,
  SectionBlock,
  MonitorItem,
  StatusSummary,
  InfoCard,
  PersonaCard,
];

export const OneflowUI = {
  install(app: App) {
    components.forEach((component) => {
      app.component(component.name || (component as any).__name || "", component);
    });
  },
};

export default OneflowUI;

// Import global styles
import "./styles/markdown.css";
