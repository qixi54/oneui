import {
  defineAsyncComponent,
  type App,
  type Component,
} from "vue";

type AsyncModule = {
  default: Component;
};

type ComponentLoader = () => Promise<AsyncModule>;

function lazyComponent(loader: ComponentLoader, name: string) {
  const component = defineAsyncComponent(() => loader().then((module) => module.default)) as Component & {
    name?: string;
    __name?: string;
  };
  component.name = name;
  return component;
}

const ViewTab = lazyComponent(() => import("./components/base/ViewTab.vue"), "ViewTab");
const ToolbarBtn = lazyComponent(() => import("./components/base/ToolbarBtn.vue"), "ToolbarBtn");
const AddViewBtn = lazyComponent(() => import("./components/base/AddViewBtn.vue"), "AddViewBtn");
const Badge = lazyComponent(() => import("./components/base/Badge.vue"), "Badge");
const RangeSlider = lazyComponent(() => import("./components/base/RangeSlider.vue"), "RangeSlider");
const ProgressBar = lazyComponent(() => import("./components/base/ProgressBar.vue"), "ProgressBar");
const ButtonGroup = lazyComponent(() => import("./components/base/ButtonGroup.vue"), "ButtonGroup");
const EmptyState = lazyComponent(() => import("./components/base/EmptyState.vue"), "EmptyState");
const StatisticCard = lazyComponent(
  () => import("./components/base/StatisticCard.vue"),
  "StatisticCard",
);
const DropdownMenu = lazyComponent(
  () => import("./components/base/DropdownMenu.vue"),
  "DropdownMenu",
);
const StatusIndicator = lazyComponent(
  () => import("./components/base/StatusIndicator.vue"),
  "StatusIndicator",
);
const Switch = lazyComponent(() => import("./components/base/Switch.vue"), "Switch");
const Stepper = lazyComponent(() => import("./components/base/Stepper.vue"), "Stepper");
const Accordion = lazyComponent(() => import("./components/base/Accordion.vue"), "Accordion");
const Avatar = lazyComponent(() => import("./components/base/Avatar.vue"), "Avatar");
const RefTag = lazyComponent(() => import("./components/base/RefTag.vue"), "RefTag");
const DescBlock = lazyComponent(() => import("./components/base/DescBlock.vue"), "DescBlock");
const ViewModeGroup = lazyComponent(
  () => import("./components/base/ViewModeGroup.vue"),
  "ViewModeGroup",
);
const ViewSwitcher = lazyComponent(
  () => import("./components/base/ViewSwitcher.vue"),
  "ViewSwitcher",
);
const SelectBadge = lazyComponent(
  () => import("./components/base/SelectBadge.vue"),
  "SelectBadge",
);
const ChainItem = lazyComponent(() => import("./components/base/ChainItem.vue"), "ChainItem");
const SectionBlock = lazyComponent(
  () => import("./components/base/SectionBlock.vue"),
  "SectionBlock",
);
const MonitorItem = lazyComponent(
  () => import("./components/base/MonitorItem.vue"),
  "MonitorItem",
);
const StatusSummary = lazyComponent(
  () => import("./components/base/StatusSummary.vue"),
  "StatusSummary",
);
const InfoCard = lazyComponent(() => import("./components/base/InfoCard.vue"), "InfoCard");
const PersonaCard = lazyComponent(
  () => import("./components/base/PersonaCard.vue"),
  "PersonaCard",
);
const SearchHighlight = lazyComponent(
  () => import("./components/base/SearchHighlight.vue"),
  "SearchHighlight",
);
const AppLayout = lazyComponent(() => import("./components/layout/AppLayout.vue"), "AppLayout");
const Navbar = lazyComponent(() => import("./components/layout/Navbar.vue"), "Navbar");
const Sidebar = lazyComponent(() => import("./components/layout/Sidebar.vue"), "Sidebar");
const StatusBar = lazyComponent(() => import("./components/layout/StatusBar.vue"), "StatusBar");
const Modal = lazyComponent(() => import("./components/overlay/Modal.vue"), "Modal");
const Dialog = lazyComponent(() => import("./components/overlay/Dialog.vue"), "Dialog");
const Drawer = lazyComponent(() => import("./components/overlay/Drawer.vue"), "Drawer");
const SidePanel = lazyComponent(() => import("./components/overlay/SidePanel.vue"), "SidePanel");
const ToastContainer = lazyComponent(
  () => import("./components/toast/ToastContainer.vue"),
  "ToastContainer",
);
const ToastItem = lazyComponent(() => import("./components/toast/ToastItem.vue"), "ToastItem");
const Tabs = lazyComponent(() => import("./components/tabs/Tabs.vue"), "Tabs");
const TabPanel = lazyComponent(() => import("./components/tabs/TabPanel.vue"), "TabPanel");
const Breadcrumb = lazyComponent(
  () => import("./components/breadcrumb/Breadcrumb.vue"),
  "Breadcrumb",
);
const BreadcrumbItem = lazyComponent(
  () => import("./components/breadcrumb/BreadcrumbItem.vue"),
  "BreadcrumbItem",
);

const DataTable = lazyComponent(() => import("./components/table/DataTable.vue"), "DataTable");
const TableHeaderRow = lazyComponent(
  () => import("./components/table/TableHeaderRow.vue"),
  "TableHeaderRow",
);
const TableDataRow = lazyComponent(
  () => import("./components/table/TableDataRow.vue"),
  "TableDataRow",
);
const TableGroupRow = lazyComponent(
  () => import("./components/table/TableGroupRow.vue"),
  "TableGroupRow",
);
const NewRowBtn = lazyComponent(() => import("./components/table/NewRowBtn.vue"), "NewRowBtn");
const TableFilterPanel = lazyComponent(
  () => import("./components/table/TableFilterPanel.vue"),
  "TableFilterPanel",
);
const TableColumnManager = lazyComponent(
  () => import("./components/table/TableColumnManager.vue"),
  "TableColumnManager",
);
const TableToolbar = lazyComponent(
  () => import("./components/table/TableToolbar.vue"),
  "TableToolbar",
);
const FieldCell = lazyComponent(() => import("./components/table/FieldCell.vue"), "FieldCell");
const FieldTypePicker = lazyComponent(
  () => import("./components/table/FieldTypePicker.vue"),
  "FieldTypePicker",
);
const ColumnHeaderMenu = lazyComponent(
  () => import("./components/table/ColumnHeaderMenu.vue"),
  "ColumnHeaderMenu",
);
const FieldMarkdownPreview = lazyComponent(
  () => import("./components/field/FieldMarkdownPreview.vue"),
  "FieldMarkdownPreview",
);
const KanbanBoard = lazyComponent(
  () => import("./components/kanban/KanbanBoard.vue"),
  "KanbanBoard",
);
const KanbanColumn = lazyComponent(
  () => import("./components/kanban/KanbanColumn.vue"),
  "KanbanColumn",
);
const KanbanCard = lazyComponent(
  () => import("./components/kanban/KanbanCard.vue"),
  "KanbanCard",
);
const QuickAddRow = lazyComponent(
  () => import("./components/kanban/QuickAddRow.vue"),
  "QuickAddRow",
);
const GalleryView = lazyComponent(
  () => import("./components/gallery/GalleryView.vue"),
  "GalleryView",
);
const GalleryCard = lazyComponent(
  () => import("./components/gallery/GalleryCard.vue"),
  "GalleryCard",
);
const ActivityTimeline = lazyComponent(
  () => import("./components/timeline/ActivityTimeline.vue"),
  "ActivityTimeline",
);
const GanttTimeline = lazyComponent(
  () => import("./components/timeline/GanttTimeline.vue"),
  "GanttTimeline",
);
const GanttRow = lazyComponent(() => import("./components/timeline/GanttRow.vue"), "GanttRow");
const ContentBlock = lazyComponent(
  () => import("./components/editor/ContentBlock.vue"),
  "ContentBlock",
);
const BlockQuote = lazyComponent(
  () => import("./components/editor/BlockQuote.vue"),
  "BlockQuote",
);
const CodeBlock = lazyComponent(() => import("./components/editor/CodeBlock.vue"), "CodeBlock");
const RefLink = lazyComponent(() => import("./components/editor/RefLink.vue"), "RefLink");
const RichTextEditor = lazyComponent(
  () => import("./components/editor/RichTextEditor.vue"),
  "RichTextEditor",
);
const FormDesigner = lazyComponent(
  () => import("./components/form/FormDesigner.vue"),
  "FormDesigner",
);
const DatabaseView = lazyComponent(
  () => import("./components/database/DatabaseView.vue"),
  "DatabaseView",
);
const ColorPanel = lazyComponent(
  () => import("./components/auxiliary/ColorPanel.vue"),
  "ColorPanel",
);
const PersonPanel = lazyComponent(
  () => import("./components/auxiliary/PersonPanel.vue"),
  "PersonPanel",
);
const FileUpload = lazyComponent(
  () => import("./components/auxiliary/FileUpload.vue"),
  "FileUpload",
);
const DetailLayout = lazyComponent(
  () => import("./components/detail/DetailLayout.vue"),
  "DetailLayout",
);
const PropPanel = lazyComponent(() => import("./components/detail/PropPanel.vue"), "PropPanel");
const PropRow = lazyComponent(() => import("./components/detail/PropRow.vue"), "PropRow");
const CommentItem = lazyComponent(
  () => import("./components/detail/CommentItem.vue"),
  "CommentItem",
);
const Dashboard = lazyComponent(() => import("./components/Dashboard/index.vue"), "Dashboard");
const BarChart = lazyComponent(
  () => import("./components/Dashboard/charts/BarChart.vue"),
  "BarChart",
);
const PieChart = lazyComponent(
  () => import("./components/Dashboard/charts/PieChart.vue"),
  "PieChart",
);
const DoughnutChart = lazyComponent(
  () => import("./components/Dashboard/charts/DoughnutChart.vue"),
  "DoughnutChart",
);
const NumberCard = lazyComponent(
  () => import("./components/Dashboard/charts/NumberCard.vue"),
  "NumberCard",
);
const TableChart = lazyComponent(
  () => import("./components/Dashboard/charts/TableChart.vue"),
  "TableChart",
);
const AiThinking = lazyComponent(() => import("./components/ai/AiThinking.vue"), "AiThinking");
const AiStreamingCursor = lazyComponent(
  () => import("./components/ai/AiStreamingCursor.vue"),
  "AiStreamingCursor",
);
const AiMessageBubble = lazyComponent(
  () => import("./components/ai/AiMessageBubble.vue"),
  "AiMessageBubble",
);
const UserMessageBubble = lazyComponent(
  () => import("./components/ai/UserMessageBubble.vue"),
  "UserMessageBubble",
);
const AiMessageList = lazyComponent(
  () => import("./components/ai/AiMessageList.vue"),
  "AiMessageList",
);
const AiSender = lazyComponent(() => import("./components/ai/AiSender.vue"), "AiSender");
const MermaidChart = lazyComponent(
  () => import("./components/mermaid/MermaidChart.vue"),
  "MermaidChart",
);
const SplitPane = lazyComponent(() => import("./components/split/SplitPane.vue"), "SplitPane");
const ContextMenu = lazyComponent(
  () => import("./components/ContextMenu/index.vue"),
  "ContextMenu",
);

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
  TableToolbar,
  FieldCell,
  FieldTypePicker,
  ColumnHeaderMenu,
  FieldMarkdownPreview,
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
  DatabaseView,
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
  SearchHighlight,
] as Component[];

type InstallableComponent = Component & {
  name?: string;
  __name?: string;
};

export const OneflowUI = {
  install(app: App) {
    components.forEach((component) => {
      const installable = component as InstallableComponent;
      app.component(installable.name || installable.__name || "", component);
    });
  },
};

export default OneflowUI;

import "./styles/variables.css";
import "./styles/themes/neutral.css";
import "./styles/themes/ops-console.css";
import "./styles/markdown.css";
