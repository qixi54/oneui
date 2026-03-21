import { defineAsyncComponent, type App, type Component } from "vue";

type AsyncModule = {
  default: Component;
};

type ComponentLoader = () => Promise<AsyncModule>;

export interface PluginComponentEntry {
  name: string;
  loader: ComponentLoader;
}

function createLazyComponent(loader: ComponentLoader, name: string) {
  const component = defineAsyncComponent(() => loader().then((module) => module.default)) as Component & {
    name?: string;
    __name?: string;
  };
  component.name = name;
  return component;
}

export const pluginComponentRegistry = [
  { name: "ViewTab", loader: () => import("../components/base/ViewTab.vue") },
  { name: "ToolbarBtn", loader: () => import("../components/base/ToolbarBtn.vue") },
  { name: "AddViewBtn", loader: () => import("../components/base/AddViewBtn.vue") },
  { name: "Badge", loader: () => import("../components/base/Badge.vue") },
  { name: "RangeSlider", loader: () => import("../components/base/RangeSlider.vue") },
  { name: "ProgressBar", loader: () => import("../components/base/ProgressBar.vue") },
  { name: "ButtonGroup", loader: () => import("../components/base/ButtonGroup.vue") },
  { name: "EmptyState", loader: () => import("../components/base/EmptyState.vue") },
  { name: "StatisticCard", loader: () => import("../components/base/StatisticCard.vue") },
  { name: "DropdownMenu", loader: () => import("../components/base/DropdownMenu.vue") },
  { name: "StatusIndicator", loader: () => import("../components/base/StatusIndicator.vue") },
  { name: "Switch", loader: () => import("../components/base/Switch.vue") },
  { name: "Stepper", loader: () => import("../components/base/Stepper.vue") },
  { name: "Accordion", loader: () => import("../components/base/Accordion.vue") },
  { name: "Avatar", loader: () => import("../components/base/Avatar.vue") },
  { name: "RefTag", loader: () => import("../components/base/RefTag.vue") },
  { name: "DescBlock", loader: () => import("../components/base/DescBlock.vue") },
  { name: "ViewModeGroup", loader: () => import("../components/base/ViewModeGroup.vue") },
  { name: "ViewSwitcher", loader: () => import("../components/base/ViewSwitcher.vue") },
  { name: "SelectBadge", loader: () => import("../components/base/SelectBadge.vue") },
  { name: "ChainItem", loader: () => import("../components/base/ChainItem.vue") },
  { name: "SectionBlock", loader: () => import("../components/base/SectionBlock.vue") },
  { name: "MonitorItem", loader: () => import("../components/base/MonitorItem.vue") },
  { name: "StatusSummary", loader: () => import("../components/base/StatusSummary.vue") },
  { name: "InfoCard", loader: () => import("../components/base/InfoCard.vue") },
  { name: "PersonaCard", loader: () => import("../components/base/PersonaCard.vue") },
  { name: "SearchHighlight", loader: () => import("../components/base/SearchHighlight.vue") },
  { name: "AppLayout", loader: () => import("../components/layout/AppLayout.vue") },
  { name: "Navbar", loader: () => import("../components/layout/Navbar.vue") },
  { name: "Sidebar", loader: () => import("../components/layout/Sidebar.vue") },
  { name: "StatusBar", loader: () => import("../components/layout/StatusBar.vue") },
  { name: "Modal", loader: () => import("../components/overlay/Modal.vue") },
  { name: "Dialog", loader: () => import("../components/overlay/Dialog.vue") },
  { name: "Drawer", loader: () => import("../components/overlay/Drawer.vue") },
  { name: "SidePanel", loader: () => import("../components/overlay/SidePanel.vue") },
  { name: "ToastContainer", loader: () => import("../components/toast/ToastContainer.vue") },
  { name: "ToastItem", loader: () => import("../components/toast/ToastItem.vue") },
  { name: "Tabs", loader: () => import("../components/tabs/Tabs.vue") },
  { name: "TabPanel", loader: () => import("../components/tabs/TabPanel.vue") },
  { name: "Breadcrumb", loader: () => import("../components/breadcrumb/Breadcrumb.vue") },
  { name: "BreadcrumbItem", loader: () => import("../components/breadcrumb/BreadcrumbItem.vue") },
  { name: "DataTable", loader: () => import("../components/table/DataTable.vue") },
  { name: "TableHeaderRow", loader: () => import("../components/table/TableHeaderRow.vue") },
  { name: "TableDataRow", loader: () => import("../components/table/TableDataRow.vue") },
  { name: "TableGroupRow", loader: () => import("../components/table/TableGroupRow.vue") },
  { name: "NewRowBtn", loader: () => import("../components/table/NewRowBtn.vue") },
  { name: "TableFilterPanel", loader: () => import("../components/table/TableFilterPanel.vue") },
  { name: "TableColumnManager", loader: () => import("../components/table/TableColumnManager.vue") },
  { name: "TableToolbar", loader: () => import("../components/table/TableToolbar.vue") },
  { name: "FieldCell", loader: () => import("../components/table/FieldCell.vue") },
  { name: "FieldTypePicker", loader: () => import("../components/table/FieldTypePicker.vue") },
  { name: "ColumnHeaderMenu", loader: () => import("../components/table/ColumnHeaderMenu.vue") },
  { name: "FieldMarkdownPreview", loader: () => import("../components/field/FieldMarkdownPreview.vue") },
  { name: "KanbanBoard", loader: () => import("../components/kanban/KanbanBoard.vue") },
  { name: "KanbanColumn", loader: () => import("../components/kanban/KanbanColumn.vue") },
  { name: "KanbanCard", loader: () => import("../components/kanban/KanbanCard.vue") },
  { name: "QuickAddRow", loader: () => import("../components/kanban/QuickAddRow.vue") },
  { name: "GalleryView", loader: () => import("../components/gallery/GalleryView.vue") },
  { name: "GalleryCard", loader: () => import("../components/gallery/GalleryCard.vue") },
  { name: "ActivityTimeline", loader: () => import("../components/timeline/ActivityTimeline.vue") },
  { name: "GanttTimeline", loader: () => import("../components/timeline/GanttTimeline.vue") },
  { name: "GanttRow", loader: () => import("../components/timeline/GanttRow.vue") },
  { name: "ContentBlock", loader: () => import("../components/editor/ContentBlock.vue") },
  { name: "BlockQuote", loader: () => import("../components/editor/BlockQuote.vue") },
  { name: "CodeBlock", loader: () => import("../components/editor/CodeBlock.vue") },
  { name: "RefLink", loader: () => import("../components/editor/RefLink.vue") },
  { name: "RichTextEditor", loader: () => import("../components/editor/RichTextEditor.vue") },
  { name: "FormDesigner", loader: () => import("../components/form/FormDesigner.vue") },
  { name: "DatabaseView", loader: () => import("../components/database/DatabaseView.vue") },
  { name: "ColorPanel", loader: () => import("../components/auxiliary/ColorPanel.vue") },
  { name: "PersonPanel", loader: () => import("../components/auxiliary/PersonPanel.vue") },
  { name: "FileUpload", loader: () => import("../components/auxiliary/FileUpload.vue") },
  { name: "DetailLayout", loader: () => import("../components/detail/DetailLayout.vue") },
  { name: "PropPanel", loader: () => import("../components/detail/PropPanel.vue") },
  { name: "PropRow", loader: () => import("../components/detail/PropRow.vue") },
  { name: "CommentItem", loader: () => import("../components/detail/CommentItem.vue") },
  { name: "Dashboard", loader: () => import("../components/Dashboard/index.vue") },
  { name: "BarChart", loader: () => import("../components/Dashboard/charts/BarChart.vue") },
  { name: "PieChart", loader: () => import("../components/Dashboard/charts/PieChart.vue") },
  { name: "DoughnutChart", loader: () => import("../components/Dashboard/charts/DoughnutChart.vue") },
  { name: "NumberCard", loader: () => import("../components/Dashboard/charts/NumberCard.vue") },
  { name: "TableChart", loader: () => import("../components/Dashboard/charts/TableChart.vue") },
  { name: "AiThinking", loader: () => import("../components/ai/AiThinking.vue") },
  { name: "AiStreamingCursor", loader: () => import("../components/ai/AiStreamingCursor.vue") },
  { name: "AiMessageBubble", loader: () => import("../components/ai/AiMessageBubble.vue") },
  { name: "UserMessageBubble", loader: () => import("../components/ai/UserMessageBubble.vue") },
  { name: "AiMessageList", loader: () => import("../components/ai/AiMessageList.vue") },
  { name: "AiSender", loader: () => import("../components/ai/AiSender.vue") },
  { name: "MermaidChart", loader: () => import("../components/mermaid/MermaidChart.vue") },
  { name: "SplitPane", loader: () => import("../components/split/SplitPane.vue") },
  { name: "ContextMenu", loader: () => import("../components/ContextMenu/index.vue") },
] as const satisfies readonly PluginComponentEntry[];

export const pluginComponentNames = pluginComponentRegistry.map((entry) => entry.name);
export const pluginComponents = pluginComponentRegistry.map((entry) =>
  createLazyComponent(entry.loader, entry.name),
);

type InstallableComponent = Component & {
  name?: string;
  __name?: string;
};

export function registerOneUIComponents(app: App) {
  pluginComponents.forEach((component) => {
    const installable = component as InstallableComponent;
    app.component(installable.name || installable.__name || "", component);
  });
}

export const installPluginComponents = registerOneUIComponents;
