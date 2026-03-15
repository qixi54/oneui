<script setup lang="ts">
import { ref } from "vue";
import {
  // Base
  ViewTab,
  ToolbarBtn,
  AddViewBtn,
  RangeSlider,
  ButtonGroup,
  EmptyState,
  StatisticCard,
  DropdownMenu,
  // Layout
  AppLayout,
  Navbar,
  Sidebar,
  StatusBar,
  // Overlay
  Modal,
  Dialog,
  // Toast
  ToastContainer,
  useToast,
  // Tabs
  Tabs,
  TabPanel,
  // Breadcrumb
  Breadcrumb,
  BreadcrumbItem,
  // Mermaid
  MermaidChart,
  // Split
  SplitPane,
  // Gallery
  GalleryView,
  // Gantt
  GanttTimeline,
  FormDesigner,
  // Editor
  ContentBlock,
  BlockQuote,
  CodeBlock,
  RefLink,
  RichTextEditor,
  // Detail
  DetailLayout,
  PropPanel,
  CommentItem,
  // Kanban
  KanbanBoard,
  // Dashboard
  Dashboard,
  BarChart,
  PieChart,
  DoughnutChart,
  NumberCard,
  TableChart,
  // Auxiliary
  ColorPanel,
  PersonPanel,
  FileUpload,
  // Table
  DataTable,
  FieldCell,
  ContextMenu,
  // AI
  AiThinking,
  AiStreamingCursor,
  AiMessageBubble,
  UserMessageBubble,
  AiMessageList,
  AiSender,
  // Composables
  useTable,
  useTableFilter,
  useMarkdown,
  // Table enhanced
  TableFilterPanel,
  TableColumnManager,
  // 新增原子组件
  Badge,
  ProgressBar,
  StatusIndicator,
  Switch as OneSwitch,
  Stepper,
  Accordion,
  Drawer,
  SidePanel,
  ActivityTimeline,
  // v2.1 业务组件
  RefTag,
  Avatar,
  SelectBadge,
  ChainItem,
  DescBlock,
  ViewModeGroup,
  ViewSwitcher,
  // v3 信息组件
  SectionBlock,
  MonitorItem,
  StatusSummary,
  InfoCard,
  PersonaCard,
} from "../index";
import type {
  TabItem,
  BreadcrumbItemData,
  MenuItem,
  TableColumn,
  KanbanColumnData,
  GalleryItem,
  GanttItem,
  SidebarItem,
  PropItem,
  CommentData,
  ViewTabItem,
  Task,
  TableSchema,
  DataRecord,
} from "../index";
import type { ButtonOption } from "../components/base";
import type { ChatMessage } from "../composables/useAiChat";
import type { CellValue, FieldDef } from "@/components/table/FieldCell.vue";
import { DEFAULT_TABLE_SCHEMA, isSelectField } from "../types";

const toast = useToast();

// ── 导航 ──
const activeSection = ref("base");
const sections = [
  { key: "base", label: "基础组件" },
  { key: "badge", label: "徽章系统" },
  { key: "layout", label: "应用布局" },
  { key: "overlay", label: "弹窗/通知" },
  { key: "tabs", label: "标签页" },
  { key: "breadcrumb", label: "面包屑" },
  { key: "split", label: "分栏" },
  { key: "mermaid", label: "图表" },
  { key: "gallery", label: "画廊" },
  { key: "gantt", label: "甘特图" },
  { key: "form", label: "表单设计器" },
  { key: "editor", label: "内容编辑器" },
  { key: "detail", label: "详情页" },
  { key: "table", label: "表格" },
  { key: "inline-edit", label: "内联编辑" },
  { key: "kanban", label: "看板" },
  { key: "dashboard", label: "Dashboard" },
  { key: "auxiliary", label: "辅助组件" },
  { key: "ai", label: "AI 组件" },
  { key: "composables", label: "Composables" },
  { key: "new-atoms", label: "新原子组件" },
  { key: "biz-components", label: "业务组件" },
  { key: "v3-components", label: "v3 信息组件" },
];

// ── Tabs ──
const tabItems: TabItem[] = [
  { key: "overview", label: "概览", icon: "home" },
  { key: "members", label: "成员", icon: "users" },
  { key: "settings", label: "设置", icon: "settings" },
  { key: "docs", label: "文档", icon: "file-text", disabled: true },
];
const activeTab = ref("overview");

const cardTabItems: TabItem[] = [
  { key: "all", label: "全部" },
  { key: "active", label: "进行中" },
  { key: "done", label: "已完成" },
];
const activeCardTab = ref("all");

// ── Breadcrumb ──
const breadcrumbItems: BreadcrumbItemData[] = [
  { label: "首页", path: "/", icon: "home" },
  { label: "项目", path: "/projects" },
  { label: "需求管理", path: "/projects/requirements" },
  { label: "用户故事详情" },
];

// ── Modal / Dialog ──
const showModal = ref(false);
const showFormModal = ref(false);
const showDialog = ref(false);
const dialogLoading = ref(false);
function handleDialogConfirm() {
  dialogLoading.value = true;
  setTimeout(() => {
    dialogLoading.value = false;
    showDialog.value = false;
    toast.success("删除成功");
  }, 1500);
}

// ── Toast ──
function fireToast(type: "info" | "success" | "warning" | "error") {
  const msgs = {
    info: "这是一条信息提示",
    success: "操作成功完成！",
    warning: "请注意，此操作不可撤销",
    error: "操作失败，请重试",
  };
  toast[type](msgs[type], { title: type.charAt(0).toUpperCase() + type.slice(1) });
}

// ── StatisticCard ──
const stats = [
  { icon: "file-text", iconColor: "blue" as const, value: "1,234", label: "文档总数" },
  { icon: "users", iconColor: "green" as const, value: "56", label: "团队成员" },
  { icon: "bell", iconColor: "orange" as const, value: "12", label: "待处理任务" },
  { icon: "settings", iconColor: "purple" as const, value: "99.9%", label: "系统可用率" },
];

// ── ButtonGroup ──
// ButtonOption 使用 value 字段（不是 key）
const viewOptions: ButtonOption[] = [
  { value: "table", label: "表格", icon: "table-2" },
  { value: "kanban", label: "看板", icon: "layout-grid" },
  { value: "gallery", label: "画廊", icon: "image" },
];
const selectedView = ref("table");

// ── RangeSlider ──
const sliderVal = ref(60);

// ── DropdownMenu ──
// MenuItem 使用 variant: 'destructive'（不是 danger）
const menuItems: MenuItem[] = [
  { label: "查看详情", icon: "eye", onClick: () => toast.info("查看详情") },
  { label: "编辑", icon: "edit", onClick: () => toast.info("编辑") },
  { label: "删除", icon: "trash-2", variant: "destructive", onClick: () => toast.error("已删除") },
];

// ── ViewTab ──
// ViewTab 使用 v-model + :items（不是逐个渲染）
const viewTabItems: ViewTabItem[] = [
  { key: "table", label: "表格", icon: "table-2" },
  { key: "kanban", label: "看板", icon: "kanban" },
  { key: "gallery", label: "画廊", icon: "layout-grid" },
  { key: "timeline", label: "时间线", icon: "gantt-chart" },
];
const activeViewTab = ref("table");

// ── Layout ──
const sidebarItems: SidebarItem[] = [
  { id: "dashboard", label: "项目看板", icon: "layout-dashboard", active: true },
  { id: "tasks", label: "任务列表", icon: "list-checks", badge: 12 },
  { id: "docs", label: "文档库", icon: "file-text" },
  { id: "timeline", label: "时间线", icon: "gantt-chart" },
  { id: "settings", label: "设置", icon: "settings" },
];
function handleSidebarClick(item: SidebarItem) {
  sidebarItems.forEach((s) => (s.active = s.id === item.id));
  toast.info(`切换到：${item.label}`);
}

// ── Mermaid ──
const mermaidCode = ref(`graph TD
  A[用户提交需求] --> B{需求评审}
  B -->|通过| C[创建任务]
  B -->|拒绝| D[反馈原因]
  C --> E[开发实现]
  E --> F[代码审查]
  F --> G[测试验证]
  G -->|通过| H[上线发布]
  G -->|失败| E`);

const mermaidCode2 = ref(`sequenceDiagram
  participant U as 用户
  participant A as AI助手
  participant DB as 数据库
  U->>A: 发送问题
  A->>DB: 检索知识库
  DB-->>A: 返回相关文档
  A-->>U: 流式输出答案`);

// ── Gallery ──
const galleryItems: GalleryItem[] = [
  {
    id: "g1",
    title: "实现认证中间件重构",
    description: "对现有认证中间件进行架构重构，提升可维护性和性能，支持多种认证策略切换。",
    status: "blocked",
    priority: "P0",
    role: "BE",
    bannerColor: "#BFDBFE",
    extraProps: [
      { key: "负责角色", value: "BE", icon: "user" },
      { key: "优先级", value: "P0", icon: "flag" },
    ],
  },
  {
    id: "g2",
    title: "画廊视图拖拽排序",
    description: "基于 vue-draggable-plus 实现画廊卡片的拖拽重排，支持跨列移动，动画流畅。",
    status: "in_progress",
    priority: "P1",
    role: "FE",
    bannerColor: "#BBF7D0",
    extraProps: [
      { key: "负责角色", value: "FE", icon: "user" },
      { key: "优先级", value: "P1", icon: "flag" },
    ],
  },
  {
    id: "g3",
    title: "接口回归测试覆盖",
    description: "对任务、文档、Issue 等核心模块的所有 API 接口进行全量回归测试。",
    status: "todo",
    priority: "P2",
    role: "QA",
    bannerColor: "#FDE68A",
    extraProps: [
      { key: "负责角色", value: "QA", icon: "user" },
      { key: "优先级", value: "P2", icon: "flag" },
    ],
  },
  {
    id: "g4",
    title: "数据库索引优化",
    description: "针对高频查询接口优化 PostgreSQL 索引策略，提升查询速度 50%。",
    status: "done",
    priority: "P3",
    role: "BE",
    bannerColor: "#DDD6FE",
    extraProps: [
      { key: "负责角色", value: "BE", icon: "user" },
      { key: "优先级", value: "P3", icon: "flag" },
    ],
  },
];

const galleryRecords: DataRecord[] = [
  {
    id: "gr1",
    fields: {
      title: "需求评审看板重构",
      description: "将看板泳道改为按字段配置，并统一列规则。",
      status: "in_progress",
      priority: "P1",
      assignee: "FE",
      coverUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1200&auto=format&fit=crop",
      role: "FE",
    },
    updatedAt: "2026-03-03",
  },
  {
    id: "gr2",
    fields: {
      title: "联调任务拆分",
      description: "拆分 API 联调任务并补充验收清单。",
      status: "todo",
      priority: "P2",
      assignee: "BE",
      coverUrl: "#BFDBFE",
      role: "BE",
    },
    updatedAt: "2026-03-02",
  },
];

// ── Gantt ──
const ganttItems: GanttItem[] = [
  {
    id: "gn1",
    title: "认证中间件重构",
    status: "blocked",
    priority: "P0",
    startDate: "2026-02-03",
    endDate: "2026-02-14",
    barColor: "#FEE2E2",
  },
  {
    id: "gn2",
    title: "画廊视图拖拽功能",
    status: "in_progress",
    priority: "P1",
    startDate: "2026-02-08",
    endDate: "2026-02-20",
    barColor: "#FEF3C7",
  },
  {
    id: "gn3",
    title: "接口回归测试",
    status: "todo",
    priority: "P2",
    startDate: "2026-02-14",
    endDate: "2026-02-24",
    barColor: "#BFDBFE",
  },
  {
    id: "gn4",
    title: "数据库索引优化",
    status: "done",
    priority: "P3",
    startDate: "2026-02-20",
    endDate: "2026-03-01",
    barColor: "#F1F5F9",
  },
];

// ── FormDesigner ──
const formSchema = ref<TableSchema>({
  ...DEFAULT_TABLE_SCHEMA,
  tableId: "task_form",
  name: "任务创建表单",
  fields: DEFAULT_TABLE_SCHEMA.fields.map((field) =>
    isSelectField(field)
      ? { ...field, options: field.options.map((opt) => ({ ...opt })) }
      : { ...field }
  ),
  views: [],
});

// ── Editor ──
const editableContent = ref("点击这里可以编辑此文本内容。\n支持多行，按 Escape 或失焦保存。");
const richEditorHtml = ref("<p>这是 <strong>RichTextEditor</strong> 默认内容，可直接编辑并保存。</p>");

// CodeBlock 需要 code prop（字符串）
const bashCode = `curl -X POST https://api.example.com/api/task/create \\
  -H "Content-Type: application/json" \\
  -d '{"config":{"project":"demo","channel":"main"},"task":{"title":"新建任务","assignee":"BE","priority":"P1"}}'`;

const tsCode = `import { useTable } from 'oneflow-ui'

const { data, pagination, sort, toggleSort, setPage } = useTable({
  data: myData,
  pageSize: 10,
})`;

// ── Detail ──
const detailTask = {
  id: "ZHO-BE-012",
  title: "实现认证中间件重构",
  status: "blocked",
  priority: "P0",
  role: "BE",
  description: "对现有认证中间件进行架构重构，提升可维护性和性能，支持多种认证策略动态切换。",
};
const detailDescription = ref(
  "对现有认证中间件进行架构重构，提升可维护性和性能，支持多种认证策略动态切换。\n依赖 OAuth2 服务完成后方可继续，预计 02/15 解除阻塞。",
);

const detailProps: PropItem[] = [
  { key: "状态", value: "已阻塞", valueColor: "var(--of-status-blocked-text)", valueBg: "var(--of-status-blocked-bg)", dotColor: "var(--of-status-blocked-text)" },
  { key: "优先级", value: "P0", valueColor: "var(--of-priority-p0-text)", valueBg: "var(--of-priority-p0-bg)" },
  { key: "负责角色", value: "BE", valueColor: "var(--of-role-be-text)", valueBg: "var(--of-role-be-bg)" },
  { key: "创建时间", value: "2026-02-05" },
  { key: "截止日期", value: "2026-02-20" },
];

const detailComments: CommentData[] = [
  {
    id: "c1",
    author: "BE Agent",
    authorInitial: "B",
    avatarColor: "var(--of-color-primary-500)",
    action: "完成了代码提交",
    content: "commit: auth-middleware-v2 分支已推送，待 OAuth2 服务就绪后合并。",
    time: "3 小时前",
  },
  {
    id: "c2",
    author: "ARCH",
    authorInitial: "A",
    avatarColor: "var(--of-color-warning)",
    action: "更新了状态",
    content: "OAuth2 服务延期，该任务标记为已阻塞，等待解除。",
    time: "1 天前",
  },
];

// ── Table ──
const tableColumns: TableColumn[] = [
  { key: "title", label: "任务名称", width: 200 },
  { key: "assignee", label: "负责人", width: 120 },
  { key: "priority", label: "优先级", width: 100, type: "priority" },
  { key: "status", label: "状态", width: 100, type: "status" },
  { key: "dueDate", label: "截止日期", width: 120, type: "date" },
];
const tableRawData = [
  { id: "1", title: "重构登录模块", assignee: "张三", priority: "P0", status: "进行中", dueDate: "2026-03-10" },
  { id: "2", title: "设计新版 Dashboard", assignee: "李四", priority: "P1", status: "待开始", dueDate: "2026-03-15" },
  { id: "3", title: "修复分页 Bug", assignee: "王五", priority: "P2", status: "已完成", dueDate: "2026-03-05" },
  { id: "4", title: "接口性能优化", assignee: "赵六", priority: "P1", status: "进行中", dueDate: "2026-03-20" },
  { id: "5", title: "编写单元测试", assignee: "张三", priority: "P2", status: "待开始", dueDate: "2026-03-25" },
  { id: "6", title: "文档整理", assignee: "李四", priority: "P3", status: "待开始", dueDate: "2026-03-28" },
  { id: "7", title: "安全审计", assignee: "王五", priority: "P0", status: "进行中", dueDate: "2026-03-08" },
];

// ── 分组 Demo ──
const demoGroupBy = ref('');

// useTable 新 API：接收 options 对象
const {
  data: tableData,
  pagination,
  sort,
  toggleSort,
  setPage,
  selectedCount,
  clearSelection,
} = useTable({ data: tableRawData, pageSize: 5 });

// ── TableFilterPanel ──
const managedColumns = ref<TableColumn[]>([...tableColumns]);
const showFilterPanel = ref(false);
const showColumnManager = ref(false);
const {
  conditions,
  logic,
  addCondition,
  removeCondition,
  updateCondition,
  filterData,
  isActive: filterActive,
} = useTableFilter({ columns: tableColumns });

function setFilterLogic(val: "and" | "or") {
  logic.value = val;
}
function filteredTableData(): Task[] {
  return filterData(tableRawData) as unknown as Task[];
}

// ── useMarkdown ──
const { renderMarkdown } = useMarkdown({ showCopyButton: true });
const markdownSource = `## OneflowUI 组件库

**核心特性**：

- 完全 TypeScript，所有 props 类型安全
- 数据驱动徽章（ColorMap 机制）
- 内置 \`useTable\`、\`useAiChat\`、\`useMarkdown\` 等 Composables

### 代码示例

\`\`\`ts
import { useMarkdown } from 'oneflow-ui'

const { renderMarkdown } = useMarkdown({ showCopyButton: true })
const html = renderMarkdown('**Hello** world')
\`\`\`

> 所有组件使用 CSS 变量，支持主题定制。`;
const markdownHtml = ref(renderMarkdown(markdownSource));

// ── Kanban ──
const kanbanColumns: KanbanColumnData[] = [
  {
    id: "todo",
    title: "待开始",
    color: "var(--of-color-gray-500)",
    tasks: [
      { id: "t1", title: "设计新版 Dashboard", priority: "P1", status: "待开始", assignee: "李四", tags: ["设计"] },
      { id: "t2", title: "编写单元测试", priority: "P2", status: "待开始", assignee: "张三", tags: ["测试"] },
    ],
  },
  {
    id: "doing",
    title: "进行中",
    color: "var(--of-color-info)",
    tasks: [
      { id: "t3", title: "重构登录模块", priority: "P0", status: "进行中", assignee: "张三", tags: ["后端"] },
      { id: "t4", title: "接口性能优化", priority: "P1", status: "进行中", assignee: "赵六", tags: ["性能"] },
    ],
  },
  {
    id: "blocked",
    title: "已阻塞",
    color: "var(--of-color-warning)",
    tasks: [
      { id: "t5", title: "认证中间件重构", priority: "P0", status: "已阻塞", assignee: "张三", tags: ["后端"] },
    ],
  },
  {
    id: "done",
    title: "已完成",
    color: "var(--of-color-success)",
    tasks: [
      { id: "t6", title: "修复分页 Bug", priority: "P2", status: "已完成", assignee: "王五", tags: ["修复"] },
    ],
  },
];

const kanbanRecords: DataRecord[] = [
  {
    id: "kr1",
    fields: { title: "完善表格筛选交互", priority: "P1", stage: "todo", assignee: "FE" },
  },
  {
    id: "kr2",
    fields: { title: "处理字段映射兼容层", priority: "P0", stage: "doing", assignee: "BE" },
  },
  {
    id: "kr3",
    fields: { title: "补充组件回归用例", priority: "P2", stage: "done", assignee: "QA" },
  },
];

// ── AI ──
// ChatMessage.role 是 "ai" | "user"（不是 "assistant"）
const aiInput = ref("");
const aiMessages = ref<ChatMessage[]>([
  {
    id: "1",
    role: "ai",
    content: "你好！我是 OneflowUI 的 AI 助手，有什么可以帮你的？",
  },
  {
    id: "2",
    role: "user",
    content: "帮我介绍一下 Tabs 组件的用法",
  },
  {
    id: "3",
    role: "ai",
    content:
      '## Tabs 组件\n\nTabs 支持两种变体：\n\n- **line** - 下划线风格，适合内容切换\n- **card** - 卡片风格，适合设置面板\n\n```vue\n<Tabs v-model="active" :tabs="tabs">\n  <TabPanel name="tab1">内容</TabPanel>\n</Tabs>\n```\n\n支持键盘方向键导航，完整 ARIA 无障碍。',
  },
]);
const aiThinking = ref(false);

function sendAiMessage() {
  if (!aiInput.value.trim()) return;
  const userMsg = aiInput.value;
  aiInput.value = "";
  aiMessages.value.push({
    id: Date.now().toString(),
    role: "user",
    content: userMsg,
  });
  aiThinking.value = true;
  setTimeout(() => {
    aiThinking.value = false;
    aiMessages.value.push({
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: `收到你的问题："${userMsg}"。这是一个演示回复，实际使用时请接入真实 AI 接口。`,
    });
  }, 2000);
}

// ── Dashboard ──
// widgets 为空时 Dashboard 自动使用内置演示数据（number-card + bar + pie + doughnut + table）
const dashboardWidgets = [
  { id: "kpi-1", type: "number-card" as const, title: "总任务", data: { value: 128, trend: "up", compare: "+12%" }, colSpan: 1 as const },
  { id: "kpi-2", type: "number-card" as const, title: "已完成", data: { value: 84, trend: "up", compare: "+8%" }, colSpan: 1 as const },
  { id: "kpi-3", type: "number-card" as const, title: "阻塞中", data: { value: 7, trend: "down", compare: "-2" }, colSpan: 1 as const },
  { id: "kpi-4", type: "number-card" as const, title: "成员数", data: { value: 12, trend: "flat", compare: "0" }, colSpan: 1 as const },
  { id: "bar-1", type: "bar" as const, title: "近7天任务趋势", data: [12, 17, 14, 20, 23, 16, 19], colSpan: 2 as const },
  { id: "doughnut-1", type: "doughnut" as const, title: "优先级分布", data: [{ name: "P0", value: 7 }, { name: "P1", value: 24 }, { name: "P2", value: 53 }, { name: "P3", value: 44 }], colSpan: 1 as const },
  { id: "pie-1", type: "pie" as const, title: "状态分布", data: [{ name: "Todo", value: 34 }, { name: "进行中", value: 52 }, { name: "完成", value: 42 }], colSpan: 1 as const },
  { id: "table-1", type: "table" as const, title: "近期任务", data: [
    { label: "重构登录模块", value: "P0 · 进行中" },
    { label: "Dashboard 迁移", value: "P1 · 已完成" },
    { label: "辅助组件迁移", value: "P1 · 已完成" },
    { label: "GanttTimeline 实现", value: "P0 · 已完成" },
  ], colSpan: 2 as const },
];

// ── Auxiliary ──
const auxColor = ref("#6366f1");
const auxPerson = ref<string | null>(null);
const auxFiles = ref<File[]>([]);
const auxPeople = [
  { id: "u1", name: "张三", avatar: "", role: "BE" },
  { id: "u2", name: "李四", avatar: "", role: "FE" },
  { id: "u3", name: "王五", avatar: "", role: "QA" },
  { id: "u4", name: "赵六", avatar: "", role: "ARCH" },
];

// ── Inline Edit ──
const inlineEditRows = ref([
  { id: "1", name: "张三", score: 85, active: true, birthday: "1990-01-15", rating: 4 },
  { id: "2", name: "李四", score: 92, active: false, birthday: "1985-06-20", rating: 5 },
  { id: "3", name: "王五", score: 78, active: true, birthday: "1995-03-10", rating: 3 },
]);

const fieldDefs: FieldDef[] = [
  { id: "name", type: "text", label: "姓名" },
  { id: "score", type: "number", label: "分数" },
  { id: "active", type: "checkbox", label: "在职" },
  { id: "birthday", type: "date", label: "生日" },
  { id: "rating", type: "rating", label: "评价", max: 5 },
];

const selectRows = ref([
  { id: "s1", status: "active", tags: ["frontend", "vue"] as string[] },
  { id: "s2", status: "inactive", tags: ["backend"] as string[] },
]);

const selectFieldDefs: FieldDef[] = [
  {
    id: "status",
    type: "select",
    label: "状态",
    options: [
      { label: "活跃", value: "active", color: "var(--of-color-success)" },
      { label: "停用", value: "inactive", color: "var(--of-color-error)" },
      { label: "待定", value: "pending", color: "var(--of-color-warning)" },
    ],
  },
  {
    id: "tags",
    type: "multiselect",
    label: "标签",
    options: [
      { label: "前端", value: "frontend" },
      { label: "后端", value: "backend" },
      { label: "Vue", value: "vue" },
      { label: "React", value: "react" },
    ],
  },
];

function handleInlineEditCommit(
  rows: Array<{ id: string; [key: string]: unknown }>,
  rowId: string,
  fieldId: string,
  value: CellValue,
) {
  const row = rows.find((item) => item.id === rowId);
  if (row) {
    (row as any)[fieldId] = value as any;
  }
}

// ── 业务组件 demo 数据 ──
const viewModeVal = ref('side');
const viewSwitcherTab = ref('table');

// ── v3 信息组件 demo 数据 ──
const sectionCollapsed = ref(false);
const sectionStatus = ref<'pending' | 'updating' | 'done' | 'editing'>('done');
const personaExpanded = ref(false);
const persona2Expanded = ref(false);

// ── 新原子组件 demo 数据 ──
const switchVal = ref(false);
const progressVal = ref(60);
const drawerOpen = ref(false);
const sidePanelOpen = ref(false);
const stepperCurrent = ref(1);
const accordionVal = ref<string[]>(['item1']);
const accordionMultiVal = ref<string[]>([]);

const stepperItems = [
  { label: '提交申请', description: '填写基本信息' },
  { label: '审批中', description: '等待上级确认' },
  { label: '技术评审', description: 'ARCH 架构师评审' },
  { label: '完成', description: '流程结束' },
];

const accordionItems = [
  { key: 'item1', title: '什么是 OneUI？' },
  { key: 'item2', title: '如何快速开始？' },
  { key: 'item3', title: '支持按需引入吗？' },
];
const accordionContents: Record<string, string> = {
  item1: 'OneUI 是基于 Vue 3 + TypeScript 的任务管理视图组件库，提供 75+ 个开箱即用的组件，涵盖 Table、Kanban、Gantt、AI Chat 等业务场景组件。',
  item2: '通过 pnpm add @oneflowui/ui 安装，然后 import OneflowUI from "@oneflowui/ui" 并 app.use(OneflowUI) 全局注册即可使用所有组件。',
  item3: '支持。通过命名导出方式按需引入：import { KanbanBoard, DataTable } from "@oneflowui/ui"，配合 Tree-shaking 减少打包体积。',
};

const timelineItems = [
  { action: '任务创建', actor: 'PM', detail: '由 PM 通过 FlowAPI 创建任务并分配给 FE', time: '2026-03-01 09:00', status: 'done' as const },
  { action: '开始开发', actor: 'FE', detail: 'Codex Agent 开始编写 Badge 组件代码', time: '2026-03-02 14:30', status: 'done' as const },
  { action: '代码评审', actor: 'ARCH', detail: '进行多 Agent 代码评审，共识评分 8.6', time: '2026-03-05 10:00', progress: 80, status: 'start' as const },
  { action: '测试验收', actor: 'QA', detail: '运行 pnpm test 并验证所有组件', time: '2026-03-08', status: 'default' as const },
  { action: '发布上线', actor: 'OPS', detail: '打包发布到 npm @oneflowui/ui', time: '', status: 'default' as const },
];

const ctxVisible = ref(false);
const ctxX = ref(0);
const ctxY = ref(0);
const ctxItems = [
  { key: "copy", label: "复制", icon: "📋" },
  { key: "paste", label: "粘贴", icon: "📌" },
  { key: "sep1", separator: true, label: "" },
  { key: "delete", label: "删除", icon: "🗑", danger: true },
];
function showContextMenu(e: MouseEvent) {
  ctxX.value = e.clientX;
  ctxY.value = e.clientY;
  ctxVisible.value = true;
}
function onCtxSelect(key: string) {
  console.log("选择:", key);
}
</script>

<template>
  <div class="dev-app">
    <!-- Toast 容器 -->
    <ToastContainer />

    <!-- 顶部导航 -->
    <header class="dev-header">
      <div class="dev-header__logo">⚡ OneflowUI Dev</div>
      <nav class="dev-header__nav">
        <button
          v-for="s in sections"
          :key="s.key"
          class="dev-nav-btn"
          :class="{ active: activeSection === s.key }"
          @click="activeSection = s.key"
        >
          {{ s.label }}
        </button>
      </nav>
    </header>

    <main class="dev-main">

      <!-- ══════════════════════════════════════════════════════
           基础组件
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'base'">
        <section class="dev-section">
          <h2>StatisticCard 统计卡片</h2>
          <p class="dev-desc">展示关键指标数据，支持图标颜色自定义。</p>
          <div class="dev-row">
            <StatisticCard
              v-for="s in stats"
              :key="s.label"
              :icon="s.icon"
              :icon-color="s.iconColor"
              :value="s.value"
              :label="s.label"
              style="flex: 1; min-width: 180px"
            />
          </div>
        </section>

        <section class="dev-section">
          <h2>ButtonGroup 按钮组</h2>
          <p class="dev-desc">单选按钮组，常用于视图切换。ButtonOption 使用 value 字段。</p>
          <ButtonGroup v-model="selectedView" :options="viewOptions" />
          <p style="margin-top: 8px; color: var(--of-color-text-secondary); font-size: 13px">当前选中：{{ selectedView }}</p>
        </section>

        <section class="dev-section">
          <h2>ViewTab + ToolbarBtn 视图标签与工具栏</h2>
          <p class="dev-desc">ViewTab 使用 v-model 绑定当前视图，传入 ViewTabItem[] 数组；ToolbarBtn 用于筛选、排序等操作。</p>
          <div style="border-bottom: 1px solid var(--of-border-color); margin-bottom: 12px;">
            <ViewTab v-model="activeViewTab" :items="viewTabItems" />
          </div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <ToolbarBtn icon="list-filter" label="筛选" :active="true" @click="toast.info('筛选')" />
            <ToolbarBtn icon="arrow-up-down" label="排序" @click="toast.info('排序')" />
            <ToolbarBtn icon="group" label="分组" @click="toast.info('分组')" />
            <div style="flex: 1;" />
            <ToolbarBtn icon="plus" label="新建任务" @click="toast.success('新建任务')" />
            <AddViewBtn @click="toast.info('添加视图')" />
          </div>
        </section>

        <section class="dev-section">
          <h2>RangeSlider 滑块</h2>
          <p class="dev-desc">带标签和描述的范围滑块，适合数值配置场景。</p>
          <RangeSlider
            v-model="sliderVal"
            label="相似度阈值"
            :min="0"
            :max="100"
            description="控制向量检索的相似度匹配程度"
          />
        </section>

        <section class="dev-section">
          <h2>DropdownMenu 操作菜单</h2>
          <p class="dev-desc">右键/更多操作菜单，支持 variant: 'destructive' 高亮危险操作。</p>
          <div style="display: flex; align-items: center; gap: 16px">
            <span style="font-size: 14px; color: var(--of-color-text-secondary)">点击右侧按钮展开菜单：</span>
            <DropdownMenu :items="menuItems" />
          </div>
        </section>

        <section class="dev-section">
          <h2>EmptyState 空状态</h2>
          <p class="dev-desc">无数据时的占位展示，支持操作按钮。</p>
          <EmptyState
            icon="inbox"
            title="暂无任务"
            description="当前没有待处理的任务，点击下方按钮创建第一条"
            :action="{ label: '+ 新建任务', onClick: () => toast.success('新建任务') }"
          />
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           徽章系统
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'badge'">
        <section class="dev-section">
          <h2>状态徽章 · Status Badge</h2>
          <p class="dev-desc">内置默认状态颜色，可通过 statusColorMap prop 完全覆盖，传给 DataTable、KanbanCard 等组件。</p>
          <div class="dev-row" style="flex-wrap: wrap; gap: 8px;">
            <span class="of-badge" style="color:var(--of-status-todo-text);background:var(--of-status-todo-bg);">待处理</span>
            <span class="of-badge" style="color:var(--of-status-in-progress-text);background:var(--of-status-in-progress-bg);">进行中</span>
            <span class="of-badge" style="display:flex;align-items:center;gap:4px;color:var(--of-status-blocked-text);background:var(--of-status-blocked-bg);">
              <span style="width:6px;height:6px;border-radius:50%;background:var(--of-status-blocked-text);display:inline-block;"></span>已阻塞
            </span>
            <span class="of-badge" style="color:var(--of-badge-green-text);background:var(--of-color-success-light);">已完成</span>
            <span class="of-badge" style="color:var(--of-badge-purple-text);background:var(--of-badge-purple-bg);">审核中</span>
          </div>
        </section>

        <section class="dev-section">
          <h2>优先级徽章 · Priority Badge</h2>
          <p class="dev-desc">内置 P0-P3，可自定义为 urgent/high/medium/low 等任意值，支持完整的 ColorMap 覆盖。</p>
          <div class="dev-row" style="gap: 8px; flex-wrap: wrap;">
            <span class="of-badge" style="color:var(--of-priority-p0-text);background:var(--of-priority-p0-bg);font-weight:600;">P0</span>
            <span class="of-badge" style="color:var(--of-status-blocked-text);background:var(--of-status-blocked-bg);font-weight:600;">P1</span>
            <span class="of-badge" style="color:var(--of-status-in-progress-text);background:var(--of-status-in-progress-bg);font-weight:600;">P2</span>
            <span class="of-badge" style="color:var(--of-color-text-secondary);background:var(--of-status-todo-bg);font-weight:600;">P3</span>
          </div>
          <div class="dev-row" style="gap: 8px; flex-wrap: wrap; margin-top: 12px;">
            <span style="font-size: 12px; color: var(--of-color-text-tertiary);">自定义值：</span>
            <span class="of-badge" style="color:var(--of-priority-p0-text);background:var(--of-priority-p0-bg);">紧急</span>
            <span class="of-badge" style="color:var(--of-status-blocked-text);background:var(--of-status-blocked-bg);">高</span>
            <span class="of-badge" style="color:var(--of-status-in-progress-text);background:var(--of-status-in-progress-bg);">中</span>
            <span class="of-badge" style="color:var(--of-color-text-secondary);background:var(--of-status-todo-bg);">低</span>
          </div>
        </section>

        <section class="dev-section">
          <h2>角色 / 自定义徽章</h2>
          <p class="dev-desc">ColorMap 支持任意 key，完全由调用方定义枚举值，数据驱动渲染。</p>
          <div class="dev-row" style="gap: 8px; flex-wrap: wrap;">
            <span class="of-badge" style="color:var(--of-role-be-text);background:var(--of-role-be-bg);">BE</span>
            <span class="of-badge" style="color:var(--of-badge-blue-text);background:var(--of-badge-blue-bg);">FE</span>
            <span class="of-badge" style="color:var(--of-badge-green-text);background:var(--of-color-success-light);">QA</span>
            <span class="of-badge" style="color:var(--of-status-blocked-text);background:var(--of-status-blocked-bg);">ARCH</span>
            <span class="of-badge" style="color:var(--of-badge-purple-text);background:var(--of-badge-purple-bg);">PM</span>
            <span class="of-badge" style="color:var(--of-badge-purple-text);background:var(--of-badge-purple-bg);">审核中</span>
            <span class="of-badge" style="color:var(--of-badge-blue-text);background:var(--of-badge-blue-bg);">部署中</span>
          </div>
        </section>

        <section class="dev-section">
          <h2>ColorMap 配置示例</h2>
          <p class="dev-desc">将自定义 ColorMap 传给 DataTable、KanbanCard、GalleryCard 等组件，覆盖内置枚举。</p>
          <pre style="background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; font-size: 13px; line-height: 1.6; overflow-x: auto;">{{ `import type { ColorMap } from 'oneflow-ui'

// 完全自定义状态映射：
const myStatusMap: ColorMap = {
  draft:     { text: '#64748B', bg: '#F1F5F9', label: '草稿' },
  reviewing: { text: '#7C3AED', bg: '#EDE9FE', label: '审核中' },
  published: { text: '#22C55E', bg: '#DCFCE7', label: '已发布' },
}

// 传给任意组件：
// <DataTable :status-color-map="myStatusMap" />
// <KanbanBoard :status-color-map="myStatusMap" />` }}</pre>
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           应用布局
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'layout'">
        <section class="dev-section">
          <h2>AppLayout 应用布局框架</h2>
          <p class="dev-desc">三层布局：#navbar slot（顶部导航）+ #sidebar slot（侧边栏）+ #statusbar slot（底部状态栏），默认 slot 为主内容区。</p>
          <div style="height: 520px; border: 1px solid var(--of-border-color); border-radius: 10px; overflow: hidden;">
            <AppLayout>
              <template #navbar>
                <Navbar
                  username="GeduoUser"
                  search-placeholder="⌘K 搜索..."
                  :notify-count="3"
                  @notify-click="toast.info('查看通知')"
                  @avatar-click="toast.info('用户设置')"
                >
                  <template #logo>
                    <span style="font-size: 15px; font-weight: 700; color: var(--of-color-primary-500);">⚡ OneFlow</span>
                  </template>
                </Navbar>
              </template>

              <template #sidebar>
                <Sidebar :items="sidebarItems" @item-click="handleSidebarClick" />
              </template>

              <!-- 主内容 -->
              <div style="padding: 20px 28px;">
                <div style="margin-bottom: 12px;">
                  <ViewTab v-model="activeViewTab" :items="viewTabItems" />
                </div>
                <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; margin-bottom: 12px;">
                  <ToolbarBtn icon="list-filter" label="筛选" :active="true" @click="toast.info('筛选')" />
                  <ToolbarBtn icon="arrow-up-down" label="排序" @click="toast.info('排序')" />
                  <div style="flex:1;" />
                  <ToolbarBtn icon="plus" label="新建任务" @click="toast.success('新建')" />
                </div>
                <DataTable :tasks="tableRawData.slice(0, 4)" :columns="tableColumns" />
              </div>

              <template #statusbar>
                <StatusBar
                  :synced="true"
                  shortcuts="⌘N 新建  ·  ⌘K 搜索  ·  ? 快捷键"
                  version="v1.0.0"
                />
              </template>
            </AppLayout>
          </div>
        </section>

        <section class="dev-section">
          <h2>Navbar 独立演示</h2>
          <p class="dev-desc">支持 #logo slot、搜索框、通知徽标、头像。</p>
          <div style="border: 1px solid var(--of-border-color); border-radius: 8px; overflow: hidden;">
            <Navbar
              username="张三"
              :notify-count="5"
              @notify-click="toast.info('查看通知')"
              @avatar-click="toast.info('个人设置')"
            />
          </div>
        </section>

        <section class="dev-section">
          <h2>Sidebar 侧边栏独立演示</h2>
          <p class="dev-desc">数据驱动导航，支持图标、徽标、子菜单、激活状态。</p>
          <div style="width: 220px; height: 300px; border: 1px solid var(--of-border-color); border-radius: 8px; overflow: hidden;">
            <Sidebar :items="sidebarItems" @item-click="handleSidebarClick" />
          </div>
        </section>

        <section class="dev-section">
          <h2>StatusBar 状态栏独立演示</h2>
          <p class="dev-desc">显示同步状态（已同步/同步中）、快捷键提示和版本信息。</p>
          <div style="border: 1px solid var(--of-border-color); border-radius: 8px; overflow: hidden; margin-bottom: 12px;">
            <StatusBar :synced="true" shortcuts="⌘N 新建  ·  ⌘K 搜索" version="v1.0.0" />
          </div>
          <div style="border: 1px solid var(--of-border-color); border-radius: 8px; overflow: hidden;">
            <StatusBar :synced="false" shortcuts="" version="v1.0.0" />
          </div>
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           弹窗/通知
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'overlay'">
        <section class="dev-section">
          <h2>Toast 通知</h2>
          <p class="dev-desc">四种类型的消息通知，自动消失，支持自定义标题。useToast() 返回 info/success/warning/error 方法。</p>
          <div class="dev-row">
            <button class="dev-btn dev-btn--info" @click="fireToast('info')">Info</button>
            <button class="dev-btn dev-btn--success" @click="fireToast('success')">Success</button>
            <button class="dev-btn dev-btn--warning" @click="fireToast('warning')">Warning</button>
            <button class="dev-btn dev-btn--error" @click="fireToast('error')">Error</button>
          </div>
        </section>

        <section class="dev-section">
          <h2>Modal 弹窗</h2>
          <p class="dev-desc">支持 ESC 关闭、点击遮罩关闭、自定义宽度。通过 v-model 控制显示，#footer slot 自定义底部操作。</p>
          <div class="dev-row">
            <button class="dev-btn" @click="showModal = true">基础 Modal</button>
            <button class="dev-btn" @click="showFormModal = true">表单 Modal</button>
          </div>

          <Modal v-model="showModal" title="查看详情" width="560px">
            <p style="color: var(--of-color-text-secondary); font-size: 14px; line-height: 1.8">
              这是一个基础 Modal 组件，支持 ESC 关闭、点击遮罩关闭、自定义宽度和底部操作区。
            </p>
            <template #footer>
              <button class="dev-btn" style="background: var(--of-color-gray-100); color: var(--of-color-text-primary)" @click="showModal = false">关闭</button>
              <button class="dev-btn" @click="() => { showModal = false; toast.success('已确认'); }">确认</button>
            </template>
          </Modal>

          <Modal v-model="showFormModal" title="创建任务" width="480px">
            <div style="display: flex; flex-direction: column; gap: 16px; padding: 4px 0">
              <label style="font-size: 14px; color: var(--of-color-text-primary)">
                <div style="margin-bottom: 6px; font-weight: 500">任务标题</div>
                <input
                  style="width: 100%; padding: 8px 12px; border: 1px solid var(--of-border-color); border-radius: 6px; font-size: 14px; box-sizing: border-box;"
                  placeholder="请输入任务标题"
                />
              </label>
              <label style="font-size: 14px; color: var(--of-color-text-primary)">
                <div style="margin-bottom: 6px; font-weight: 500">优先级</div>
                <select style="width: 100%; padding: 8px 12px; border: 1px solid var(--of-border-color); border-radius: 6px; font-size: 14px;">
                  <option>P0 - 紧急</option>
                  <option>P1 - 高</option>
                  <option selected>P2 - 中</option>
                  <option>P3 - 低</option>
                </select>
              </label>
              <label style="font-size: 14px; color: var(--of-color-text-primary)">
                <div style="margin-bottom: 6px; font-weight: 500">描述</div>
                <textarea
                  style="width: 100%; padding: 8px 12px; border: 1px solid var(--of-border-color); border-radius: 6px; font-size: 14px; resize: vertical; min-height: 80px; box-sizing: border-box;"
                  placeholder="任务描述（可选）"
                />
              </label>
            </div>
            <template #footer>
              <button class="dev-btn" style="background: var(--of-color-gray-100); color: var(--of-color-text-primary)" @click="showFormModal = false">取消</button>
              <button class="dev-btn" @click="() => { showFormModal = false; toast.success('任务已创建'); }">创建</button>
            </template>
          </Modal>
        </section>

        <section class="dev-section">
          <h2>Dialog 确认对话框</h2>
          <p class="dev-desc">带加载状态的确认对话框，支持 type="danger" 危险操作类型。</p>
          <div class="dev-row">
            <button class="dev-btn dev-btn--error" @click="showDialog = true">删除确认</button>
          </div>
          <Dialog
            v-model="showDialog"
            type="danger"
            title="确认删除"
            content="确定要删除这条记录吗？此操作不可撤销，删除后数据将无法恢复。"
            confirm-text="确认删除"
            :loading="dialogLoading"
            @confirm="handleDialogConfirm"
            @cancel="showDialog = false"
          />
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           标签页
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'tabs'">
        <section class="dev-section">
          <h2>Tabs - Line 变体（含图标、禁用）</h2>
          <p class="dev-desc">下划线风格标签页，适合内容区域切换，支持图标和禁用状态。TabPanel 的 name 对应 TabItem 的 key。</p>
          <Tabs v-model="activeTab" :tabs="tabItems" variant="line">
            <TabPanel name="overview">
              <div style="padding: 16px 0; color: var(--of-color-text-secondary); font-size: 14px">
                📊 这是概览面板内容，展示项目整体情况。
              </div>
            </TabPanel>
            <TabPanel name="members">
              <div style="padding: 16px 0; color: var(--of-color-text-secondary); font-size: 14px">
                👥 这是成员管理面板，可以添加/移除团队成员。
              </div>
            </TabPanel>
            <TabPanel name="settings">
              <div style="padding: 16px 0; color: var(--of-color-text-secondary); font-size: 14px">
                ⚙️ 这是设置面板。
              </div>
            </TabPanel>
          </Tabs>
        </section>

        <section class="dev-section">
          <h2>Tabs - Card 变体</h2>
          <p class="dev-desc">卡片风格标签页，适合设置面板、分类筛选。</p>
          <Tabs v-model="activeCardTab" :tabs="cardTabItems" variant="card">
            <TabPanel name="all">
              <div style="padding: 16px 0; color: var(--of-color-text-secondary); font-size: 14px">
                📋 全部任务列表（7 条）
              </div>
            </TabPanel>
            <TabPanel name="active">
              <div style="padding: 16px 0; color: var(--of-color-text-secondary); font-size: 14px">
                🔄 进行中的任务（3 条）
              </div>
            </TabPanel>
            <TabPanel name="done">
              <div style="padding: 16px 0; color: var(--of-color-text-secondary); font-size: 14px">
                ✅ 已完成的任务（1 条）
              </div>
            </TabPanel>
          </Tabs>
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           面包屑
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'breadcrumb'">
        <section class="dev-section">
          <h2>Breadcrumb - 数据模式</h2>
          <p class="dev-desc">通过 items 数组配置（BreadcrumbItemData），使用 path 字段（不是 href）。</p>
          <Breadcrumb :items="breadcrumbItems" />
        </section>

        <section class="dev-section">
          <h2>Breadcrumb - Slot 模式 + 自定义分隔符</h2>
          <p class="dev-desc">使用 BreadcrumbItem 子组件逐个编写。BreadcrumbItem 使用 path prop（不是 href）。</p>
          <Breadcrumb separator="›">
            <BreadcrumbItem path="/" icon="home">首页</BreadcrumbItem>
            <span class="of-breadcrumb__separator">›</span>
            <BreadcrumbItem path="/settings">设置</BreadcrumbItem>
            <span class="of-breadcrumb__separator">›</span>
            <BreadcrumbItem :active="true">个人信息</BreadcrumbItem>
          </Breadcrumb>
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           分栏
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'split'">
        <section class="dev-section">
          <h2>SplitPane - 水平分栏（支持触摸拖拽）</h2>
          <p class="dev-desc">可拖拽调整两侧宽度，支持 min/max 限制，触摸设备同样可用。</p>
          <div style="height: 400px; border: 1px solid var(--of-border-color); border-radius: 8px; overflow: hidden">
            <SplitPane direction="horizontal" :default-size="30" :min-size="15" :max-size="70">
              <template #first>
                <div style="padding: 16px; height: 100%; box-sizing: border-box; background: var(--of-color-bg-hover)">
                  <div style="font-weight: 600; font-size: 13px; color: var(--of-color-text-primary); margin-bottom: 12px">📁 文件树</div>
                  <div
                    v-for="f in ['src/', 'components/', 'Tabs.vue', 'Modal.vue', 'index.ts']"
                    :key="f"
                    style="padding: 4px 8px; font-size: 13px; color: var(--of-color-text-secondary); cursor: pointer; border-radius: 4px;"
                    @mouseenter="($event.target as HTMLElement).style.background = 'var(--of-color-gray-200)'"
                    @mouseleave="($event.target as HTMLElement).style.background = ''"
                  >
                    {{ f }}
                  </div>
                </div>
              </template>
              <template #second>
                <div style="padding: 16px; height: 100%; box-sizing: border-box; overflow: auto">
                  <div style="font-weight: 600; font-size: 13px; color: var(--of-color-text-primary); margin-bottom: 12px">📝 代码预览</div>
                  <pre style="font-size: 12px; color: var(--of-color-text-secondary); background: var(--of-color-gray-100); padding: 12px; border-radius: 6px; overflow: auto;">{{ `import { Tabs, TabPanel } from 'oneflow-ui'\n\nconst tabs = [\n  { key: 'a', label: '标签A' },\n  { key: 'b', label: '标签B' },\n]` }}</pre>
                </div>
              </template>
            </SplitPane>
          </div>
        </section>

        <section class="dev-section">
          <h2>SplitPane - 垂直分栏</h2>
          <p class="dev-desc">上下分栏，适合编辑器+预览布局。</p>
          <div style="height: 350px; border: 1px solid var(--of-border-color); border-radius: 8px; overflow: hidden">
            <SplitPane direction="vertical" :default-size="40">
              <template #first>
                <div style="padding: 16px; height: 100%; box-sizing: border-box; background: var(--of-color-info-light)">
                  <div style="font-weight: 600; font-size: 13px; color: var(--of-color-info)">上方面板</div>
                  <p style="font-size: 13px; color: var(--of-color-text-secondary); margin-top: 8px">拖拽中间分隔条调整高度比例</p>
                </div>
              </template>
              <template #second>
                <div style="padding: 16px; height: 100%; box-sizing: border-box; background: var(--of-color-success-light)">
                  <div style="font-weight: 600; font-size: 13px; color: var(--of-badge-green-text)">下方面板</div>
                  <p style="font-size: 13px; color: var(--of-color-text-secondary); margin-top: 8px">移动端同样支持 touch 拖拽</p>
                </div>
              </template>
            </SplitPane>
          </div>
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           图表
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'mermaid'">
        <section class="dev-section">
          <h2>MermaidChart - 流程图</h2>
          <p class="dev-desc">基于 Mermaid.js 渲染，支持多种图表类型，theme 可选 default / neutral / dark / forest。</p>
          <MermaidChart :code="mermaidCode" theme="default" />
        </section>
        <section class="dev-section">
          <h2>MermaidChart - 时序图</h2>
          <p class="dev-desc">使用 neutral 主题渲染时序图。</p>
          <MermaidChart :code="mermaidCode2" theme="neutral" />
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           画廊
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'gallery'">
        <section class="dev-section">
          <h2>GalleryView + GalleryCard 画廊视图（兼容模式）</h2>
          <p class="dev-desc">
            卡片式画廊，支持顶部彩色横条、额外属性展示和添加按钮。
            GalleryItem 扩展自 Task，增加 bannerColor / extraProps 字段。
            :columns 控制每行列数。
          </p>
          <GalleryView
            :items="galleryItems"
            :columns="3"
            :addable="true"
            @card-click="(item) => toast.info(`打开：${item.title}`)"
            @add="toast.success('添加新卡片')"
          />
        </section>
        <section class="dev-section">
          <h2>GalleryView 封面配置化（records + coverFieldId）</h2>
          <p class="dev-desc">通过 `coverFieldId` 指定封面字段；值为 URL 时显示图片，值为颜色值时回退为顶部色条。</p>
          <GalleryView
            :records="galleryRecords"
            cover-field-id="coverUrl"
            :card-field-ids="['role', 'priority', 'assignee']"
            :columns="2"
            :addable="false"
          />
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           甘特图
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'gantt'">
        <section class="dev-section">
          <h2>GanttTimeline + GanttRow 甘特图</h2>
          <p class="dev-desc">
            时间线视图，自动计算今日线位置。GanttItem 扩展自 Task，必须提供 startDate / endDate，
            可选 barColor 自定义条形颜色。:days 控制显示天数。
          </p>
          <div style="overflow-x: auto;">
            <GanttTimeline
              :items="ganttItems"
              start-date="2026-02-01"
              :days="28"
              @row-click="(item) => toast.info(`点击：${item.title}`)"
            />
          </div>
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           表单设计器
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'form'">
        <section class="dev-section">
          <h2>FormDesigner 表单设计器</h2>
          <p class="dev-desc">
            面向 TableSchema 三层模型的字段设计器，支持字段增删、拖拽排序、类型切换、必填/隐藏配置，
            select/multi_select 类型支持逗号分隔快速录入选项。
          </p>
          <FormDesigner
            :schema="formSchema"
            @update:schema="formSchema = $event"
            @change="toast.info(`Schema 已更新：${$event.fields.length} 个字段`)"
          />
          <pre class="dev-json-preview">{{ JSON.stringify(formSchema, null, 2) }}</pre>
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           内容编辑器
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'editor'">
        <section class="dev-section">
          <h2>RichTextEditor 富文本编辑器</h2>
          <p class="dev-desc">基于 Quill 的 WYSIWYG 编辑器，支持格式化、列表、链接与图片，并通过 save 事件触发保存。</p>
          <div style="max-width: 800px;">
            <RichTextEditor
              v-model="richEditorHtml"
              placeholder="请输入任务详情..."
              @save="() => toast.success('RichTextEditor 内容已保存')"
            />
          </div>
        </section>

        <section class="dev-section">
          <h2>ContentBlock 文本块</h2>
          <p class="dev-desc">文本内容展示块，content prop 控制内容，设置 editable 可点击进入编辑模式，用 \n 换行。</p>
          <div style="display: flex; flex-direction: column; gap: 12px; max-width: 700px;">
            <div>
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 6px;">只读模式（content prop）：</p>
              <ContentBlock content="这是一段描述文本，支持多行显示。&#10;第二段内容可以展示更多详情和上下文信息，支持纯文字和行内组件混排。" />
            </div>
            <div>
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 6px;">可编辑模式（点击进入编辑）：</p>
              <ContentBlock
                v-model:content="editableContent"
                :editable="true"
              />
            </div>
            <div>
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 6px;">使用 slot 自定义内容：</p>
              <ContentBlock>
                <p style="font-size: 13px; color: var(--of-color-text-primary); line-height: 1.6; margin: 0;">通过 <strong>slot</strong> 自定义内容，可以包含任意 HTML 结构。</p>
              </ContentBlock>
            </div>
          </div>
        </section>

        <section class="dev-section">
          <h2>BlockQuote 引用块</h2>
          <p class="dev-desc">带左侧边框的引用样式，content prop 为引用正文，可选 cite prop 为出处。</p>
          <div style="max-width: 700px; display: flex; flex-direction: column; gap: 12px;">
            <BlockQuote
              content="架构师在做技术选型时，应优先考虑团队已有技术栈的成熟度，避免引入维护成本过高的新技术。"
              cite="摘自 DECISION-2026-001"
            />
            <BlockQuote
              content="数据驱动是 OneflowUI 的核心设计理念——状态、优先级等枚举值完全由调用方通过 ColorMap 定义。"
            />
          </div>
        </section>

        <section class="dev-section">
          <h2>useMarkdown Markdown 渲染</h2>
          <p class="dev-desc">useMarkdown 返回 renderMarkdown(content) 函数，将 Markdown 文本转为 HTML，带代码高亮。用 v-html 渲染结果。</p>
          <div style="max-width: 700px;">
            <div
              class="of-markdown"
              style="padding: 16px; background: var(--of-color-bg-elevated); border: 1px solid var(--of-border-color); border-radius: 8px;"
              v-html="markdownHtml"
            />
          </div>
        </section>

        <section class="dev-section">
          <h2>CodeBlock 代码块</h2>
          <p class="dev-desc">暗色主题代码块，使用 code prop 传入代码字符串，language prop 指定语言，copyable 开启复制按钮。</p>
          <div style="max-width: 700px; display: flex; flex-direction: column; gap: 12px;">
            <CodeBlock :code="bashCode" language="bash" :copyable="true" />
            <CodeBlock :code="tsCode" language="typescript" :copyable="true" />
          </div>
        </section>

        <section class="dev-section">
          <h2>RefLink 引用链接</h2>
          <p class="dev-desc">带样式的内联引用标签，refId 是必填的引用 ID，label 可选（不传则显示 refId），点击触发 click 事件。</p>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 13px; color: var(--of-color-text-primary);">相关文档：</span>
            <RefLink ref-id="wiki:GLOBAL-API-STANDARDS" @click="(id) => toast.info(id)" />
            <RefLink ref-id="task:ZHO-BE-012" label="认证中间件重构" @click="(id) => toast.info(id)" />
            <RefLink ref-id="memo:2026-02-11" @click="(id) => toast.info(id)" />
          </div>
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           详情页
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'detail'">
        <section class="dev-section">
          <h2>DetailLayout 任务详情布局</h2>
          <p class="dev-desc">左右双栏布局：左侧主内容（标题/描述富文本区/活动记录），右侧属性面板。支持通过 descriptionContent + descriptionEditable 接入可编辑富文本区。</p>
          <div style="border: 1px solid var(--of-border-color); border-radius: 10px; overflow: hidden;">
            <DetailLayout
              :task="detailTask"
              :prop-items="detailProps"
              :comments="detailComments"
              v-model:description-content="detailDescription"
              :description-editable="true"
            />
          </div>
        </section>

        <section class="dev-section">
          <h2>PropPanel + PropRow 属性面板</h2>
          <p class="dev-desc">可单独使用的属性面板，PropItem 支持 valueColor/valueBg/dotColor 样式配置。</p>
          <div style="max-width: 360px; border: 1px solid var(--of-border-color); border-radius: 10px; overflow: hidden;">
            <PropPanel title="任务属性" :items="detailProps" />
          </div>
        </section>

        <section class="dev-section">
          <h2>CommentItem 评论条目</h2>
          <p class="dev-desc">活动记录/评论列表中的单个条目，CommentData 包含 author/authorInitial/avatarColor/action/content/time 字段。</p>
          <div style="max-width: 600px; border: 1px solid var(--of-border-color); border-radius: 10px; padding: 16px;">
            <CommentItem v-for="c in detailComments" :key="c.id" :comment="c" />
          </div>
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           表格
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'table'">

        <!-- 1. 多条件筛选面板 -->
        <section class="dev-section">
          <h2>TableFilterPanel 多条件筛选面板</h2>
          <p class="dev-desc">结合 useTableFilter composable 使用。conditions / logic 由 useTableFilter 维护，面板通过 emit 回传变更。</p>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <button class="dev-btn" style="font-size: 13px; padding: 6px 14px;" @click="showFilterPanel = !showFilterPanel">
              {{ showFilterPanel ? '隐藏筛选面板' : '展开筛选面板' }}
            </button>
            <span v-if="filterActive" style="font-size: 12px; color: var(--of-color-primary-500); background: var(--of-color-primary-100); padding: 2px 8px; border-radius: 12px;">筛选已激活</span>
          </div>
          <TableFilterPanel
            v-if="showFilterPanel"
            :columns="tableColumns"
            :conditions="conditions"
            :logic="logic"
            :visible="showFilterPanel"
            @add-condition="addCondition()"
            @remove-condition="removeCondition"
            @update-condition="(id, patch) => updateCondition(id, patch)"
            @update:logic="setFilterLogic"
            @close="showFilterPanel = false"
          />
          <DataTable :tasks="filteredTableData()" :columns="tableColumns" />
        </section>

        <!-- 2. 列管理器 -->
        <section class="dev-section">
          <h2>TableColumnManager 列管理器</h2>
          <p class="dev-desc">可以拖拽排序、切换列的可见性。update:columns 事件返回调整后的列配置，可传回 DataTable。</p>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <button class="dev-btn" style="font-size: 13px; padding: 6px 14px;" @click="showColumnManager = !showColumnManager">
              {{ showColumnManager ? '隐藏列管理器' : '管理列' }}
            </button>
          </div>
          <TableColumnManager
            v-if="showColumnManager"
            :columns="managedColumns"
            :visible="showColumnManager"
            @update:columns="(cols) => (managedColumns = cols)"
            @close="showColumnManager = false"
          />
          <DataTable :tasks="tableRawData.slice(0, 4)" :columns="managedColumns.filter(c => !c.hidden)" />
        </section>

        <!-- 3. 表格工具栏完整组合 -->
        <section class="dev-section">
          <h2>DataTable + useTable 完整交互演示</h2>
          <p class="dev-desc">
            useTable 返回 selectedRows / selectedCount / isAllSelected / toggleRowSelection / clearSelection，
            DataTable 内置行选择、分页、列排序交互。
          </p>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
            <button class="dev-btn" style="font-size: 13px; padding: 6px 14px; background: var(--of-color-gray-500);" @click="toggleSort('title')">
              按标题排序 ({{ sort.field === 'title' ? sort.order : '无' }})
            </button>
            <button class="dev-btn" style="font-size: 13px; padding: 6px 14px; background: var(--of-color-gray-500);" @click="toggleSort('priority')">
              按优先级排序 ({{ sort.field === 'priority' ? sort.order : '无' }})
            </button>
            <div style="flex: 1;" />
            <span v-if="selectedCount > 0" style="font-size: 13px; color: var(--of-color-primary-500);">
              已选 {{ selectedCount }} 条
            </span>
            <button v-if="selectedCount > 0" class="dev-btn" style="font-size: 13px; padding: 6px 14px; background: var(--of-color-error);" @click="clearSelection">取消选择</button>
          </div>
          <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 8px;">
            共 {{ pagination.total }} 条 | 第 {{ pagination.page }} / {{ Math.ceil(pagination.total / pagination.pageSize) }} 页
          </p>
          <DataTable :tasks="tableData" :columns="tableColumns" />
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 12px; justify-content: flex-end;">
            <button class="dev-btn" style="padding: 6px 12px; font-size: 12px;" :disabled="pagination.page <= 1" @click="setPage(pagination.page - 1)">上一页</button>
            <span style="font-size: 13px; color: var(--of-color-text-secondary);">{{ pagination.page }} / {{ Math.ceil(pagination.total / pagination.pageSize) }}</span>
            <button class="dev-btn" style="padding: 6px 12px; font-size: 12px;" :disabled="pagination.page >= Math.ceil(pagination.total / pagination.pageSize)" @click="setPage(pagination.page + 1)">下一页</button>
          </div>
        </section>

        <!-- 4. 分组视图 -->
        <section class="dev-section">
          <h2>DataTable + groupBy 分组视图</h2>
          <p class="dev-desc">设置 group-by 按字段分组，每组可折叠/展开。传入 group-color-map 时分组标题以 Badge 样式显示。</p>
          <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
            <button class="dev-btn" style="font-size: 13px; padding: 6px 14px;"
              @click="demoGroupBy = demoGroupBy === 'status' ? '' : 'status'">
              {{ demoGroupBy === 'status' ? '✓ 按状态分组' : '按状态分组' }}
            </button>
            <button class="dev-btn" style="font-size: 13px; padding: 6px 14px;"
              @click="demoGroupBy = demoGroupBy === 'priority' ? '' : 'priority'">
              {{ demoGroupBy === 'priority' ? '✓ 按优先级分组' : '按优先级分组' }}
            </button>
            <button class="dev-btn" style="font-size: 13px; padding: 6px 14px;"
              @click="demoGroupBy = demoGroupBy === 'assignee' ? '' : 'assignee'">
              {{ demoGroupBy === 'assignee' ? '✓ 按负责人分组' : '按负责人分组' }}
            </button>
            <button v-if="demoGroupBy" class="dev-btn" style="font-size: 13px; padding: 6px 14px; background: var(--of-color-gray-500);"
              @click="demoGroupBy = ''">
              取消分组
            </button>
          </div>
          <DataTable
            :tasks="tableRawData"
            :columns="tableColumns"
            :group-by="demoGroupBy || undefined"
          />
        </section>

      </template>

      <!-- ══════════════════════════════════════════════════════
           内联编辑
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'inline-edit'">
        <section class="dev-section">
          <h2>基础字段类型</h2>
          <p class="dev-desc">演示 text / number / checkbox / date / rating 五种字段的内联编辑。</p>
          <table class="demo-table">
            <thead>
              <tr>
                <th v-for="f in fieldDefs" :key="f.id">{{ f.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in inlineEditRows" :key="row.id">
                <td v-for="f in fieldDefs" :key="f.id" style="padding: 0; min-width: 120px">
                  <FieldCell
                    :row-id="row.id"
                    :field="f"
                    :value="(row as any)[f.id]"
                    @commit="(rowId, fieldId, val) => handleInlineEditCommit(inlineEditRows, rowId, fieldId, val)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="dev-section">
          <h2>Select / MultiSelect</h2>
          <p class="dev-desc">演示 select 与 multiselect 字段，包含状态色和多标签选择。</p>
          <table class="demo-table">
            <thead>
              <tr>
                <th v-for="f in selectFieldDefs" :key="f.id">{{ f.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in selectRows" :key="row.id">
                <td v-for="f in selectFieldDefs" :key="f.id" style="padding: 0; min-width: 180px">
                  <FieldCell
                    :row-id="row.id"
                    :field="f"
                    :value="(row as any)[f.id]"
                    @commit="(rowId, fieldId, val) => handleInlineEditCommit(selectRows, rowId, fieldId, val)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="dev-section">
          <h2>ContextMenu 右键菜单</h2>
          <p class="dev-desc">右键点击下方区域，弹出上下文菜单并响应选择事件。</p>
          <div
            @contextmenu.prevent="showContextMenu"
            style="padding: 16px; border: 1px dashed var(--of-color-gray-300); cursor: context-menu; border-radius: 8px; color: var(--of-color-text-secondary);"
          >
            右键点击此区域
          </div>
          <ContextMenu
            v-if="ctxVisible"
            :x="ctxX"
            :y="ctxY"
            :items="ctxItems"
            @select="onCtxSelect"
            @close="ctxVisible = false"
          />
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           看板
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'kanban'">
        <section class="dev-section">
          <h2>KanbanBoard 看板视图（兼容模式）</h2>
          <p class="dev-desc">多列看板，每列对应一个状态。KanbanColumnData 包含 id/title/color/tasks 字段（注意：没有 count 字段，tasks.length 即为数量）。</p>
          <KanbanBoard :columns="kanbanColumns" />
        </section>
        <section class="dev-section">
          <h2>KanbanBoard 泳道配置化（records + kanbanFieldId）</h2>
          <p class="dev-desc">传入 records，并用 `kanbanFieldId` 指定泳道字段；可通过 `laneOrder/laneTitles` 控制顺序与显示名。</p>
          <KanbanBoard
            :records="kanbanRecords"
            kanban-field-id="stage"
            :lane-order="['todo', 'doing', 'done']"
            :lane-titles="{ todo: '待处理', doing: '进行中', done: '已完成' }"
          />
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           Dashboard
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'dashboard'">
        <section class="dev-section">
          <h2>Dashboard 内置演示数据（空 widgets）</h2>
          <p class="dev-desc">不传 widgets 时，Dashboard 自动展示内置的 number-card + bar + pie + doughnut + table 五种图表，验证默认可用性。</p>
          <Dashboard title="项目总览（内置 Demo）" :columns="4" />
        </section>

        <section class="dev-section">
          <h2>Dashboard 自定义 widgets 配置</h2>
          <p class="dev-desc">
            通过 widgets 数组配置：type 可选 number-card / bar / pie / doughnut / table，
            colSpan 控制占用列数（1-4），rowSpan 控制占用行数（1-2）。
          </p>
          <Dashboard title="自定义 Dashboard" :widgets="dashboardWidgets" :columns="4" :gap="16" />
        </section>

        <section class="dev-section">
          <h2>单图表组件独立使用</h2>
          <p class="dev-desc">BarChart / PieChart / DoughnutChart / NumberCard / TableChart 均可单独引用，无需包在 Dashboard 容器内。</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 900px;">
            <div style="border: 1px solid var(--of-border-color); border-radius: 8px; padding: 16px;">
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 8px;">NumberCard</p>
              <NumberCard :data="{ value: 128, trend: 'up', compare: '+12%' }" title="总任务" />
            </div>
            <div style="border: 1px solid var(--of-border-color); border-radius: 8px; padding: 16px;">
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 8px;">BarChart</p>
              <BarChart :data="[12, 17, 14, 20, 23, 16, 19]" title="近7天趋势" />
            </div>
            <div style="border: 1px solid var(--of-border-color); border-radius: 8px; padding: 16px;">
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 8px;">DoughnutChart</p>
              <DoughnutChart :data="[{ name: 'P0', value: 7 }, { name: 'P1', value: 24 }, { name: 'P2', value: 53 }]" title="优先级分布" />
            </div>
            <div style="border: 1px solid var(--of-border-color); border-radius: 8px; padding: 16px;">
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 8px;">PieChart</p>
              <PieChart :data="[{ name: 'Todo', value: 34 }, { name: '进行中', value: 52 }, { name: '完成', value: 42 }]" title="状态分布" />
            </div>
            <div style="border: 1px solid var(--of-border-color); border-radius: 8px; padding: 16px;">
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 8px;">TableChart</p>
              <TableChart :data="[{ label: 'GanttTimeline', value: '已完成' }, { label: 'RichTextEditor', value: '已完成' }, { label: 'FormDesigner', value: '已完成' }]" title="近期完成" />
            </div>
          </div>
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           辅助组件
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'auxiliary'">
        <section class="dev-section">
          <h2>ColorPanel 颜色选择器</h2>
          <p class="dev-desc">
            带预设色板 + 自定义输入的颜色选择器，v-model 绑定当前颜色值（hex 字符串）。
            presets prop 自定义色板，showInput 控制显示输入框，支持 disabled。
          </p>
          <div style="display: flex; align-items: flex-start; gap: 32px; flex-wrap: wrap;">
            <div>
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 8px;">默认预设色板</p>
              <ColorPanel v-model="auxColor" @change="(c) => toast.info('选色：' + c)" />
            </div>
            <div>
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 8px;">自定义预设 + 无输入框</p>
              <ColorPanel
                v-model="auxColor"
                :presets="['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6']"
                :show-input="false"
              />
            </div>
            <div style="display: flex; align-items: center; gap: 12px; margin-top: 24px;">
              <div :style="{ width: '32px', height: '32px', borderRadius: '50%', background: auxColor, border: '2px solid var(--of-border-color)' }" />
              <span style="font-size: 13px; color: var(--of-color-text-secondary);">当前颜色：{{ auxColor }}</span>
            </div>
          </div>
        </section>

        <section class="dev-section">
          <h2>PersonPanel 人员选择器</h2>
          <p class="dev-desc">
            下拉选择器，从 people 数组中选取负责人，v-model 绑定选中的 id（字符串 | null）。
            people 数组每项需包含 id / name / role 字段，avatar 可选（无头像时显示首字母）。
          </p>
          <div style="max-width: 300px; display: flex; flex-direction: column; gap: 12px;">
            <PersonPanel
              v-model="auxPerson"
              :people="auxPeople"
              placeholder="请选择负责人"
              @change="(id) => toast.info('选中：' + (auxPeople.find(p => p.id === id)?.name ?? '无'))"
            />
            <p style="font-size: 13px; color: var(--of-color-text-secondary);">当前选中 id：{{ auxPerson ?? '(未选择)' }}</p>
          </div>
        </section>

        <section class="dev-section">
          <h2>FileUpload 文件上传</h2>
          <p class="dev-desc">
            拖拽 / 点击上传组件，v-model 绑定 File[] 数组。
            multiple 允许多选，maxCount 限制最大数量，accept 限制文件类型（如 .pdf,.docx），
            maxSizeMb 限制单文件大小（MB）。
          </p>
          <div style="max-width: 500px; display: flex; flex-direction: column; gap: 16px;">
            <div>
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 8px;">单文件上传（accept: .pdf,.docx）</p>
              <FileUpload
                v-model="auxFiles"
                accept=".pdf,.docx"
                :multiple="false"
                @change="(files) => toast.info(`已选择 ${files.length} 个文件`)"
              />
            </div>
            <div>
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 8px;">多文件（最多 3 个，限 5MB）</p>
              <FileUpload
                v-model="auxFiles"
                :multiple="true"
                :max-count="3"
                :max-size-mb="5"
                @change="(files) => toast.success(`已上传 ${files.length} 个文件`)"
              />
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-top: 6px;">已选文件：{{ auxFiles.map(f => f.name).join(', ') || '(无)' }}</p>
            </div>
          </div>
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           AI 组件
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'ai'">
        <section class="dev-section">
          <h2>AiThinking 思考状态</h2>
          <p class="dev-desc">三点跳动动画，表示 AI 正在思考中，支持 sm / md 两种尺寸。</p>
          <div class="dev-row" style="align-items: flex-end; gap: 32px;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <AiThinking size="md" />
              <span style="font-size: 11px; color: var(--of-color-text-tertiary);">size=md（默认）</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <AiThinking size="sm" />
              <span style="font-size: 11px; color: var(--of-color-text-tertiary);">size=sm</span>
            </div>
            <div style="display: flex; align-items: flex-end; gap: 12px;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--of-color-primary-50); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">🤖</div>
              <AiThinking size="md" />
              <span style="font-size: 11px; color: var(--of-color-text-tertiary);">实际对话场景中的位置</span>
            </div>
          </div>
        </section>

        <section class="dev-section">
          <h2>AiStreamingCursor 流式输出光标</h2>
          <p class="dev-desc">闪烁光标，嵌入文本末尾表示正在流式输出。可通过 style 调整颜色适应不同背景。</p>
          <div style="display: flex; flex-direction: column; gap: 16px; max-width: 600px;">
            <div>
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 6px;">普通文本末尾：</p>
              <div style="font-size: 14px; color: var(--of-color-text-primary); line-height: 1.8;">
                正在为你生成内容，这是一段持续输出的文字流...<AiStreamingCursor />
              </div>
            </div>
            <div>
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 6px;">标题级别：</p>
              <div style="font-size: 20px; font-weight: 600; color: var(--of-color-text-primary);">
                深度学习在自然语言处理中的应用<AiStreamingCursor />
              </div>
            </div>
            <div>
              <p style="font-size: 12px; color: var(--of-color-text-secondary); margin-bottom: 6px;">代码块内（白色光标）：</p>
              <div style="background: var(--of-color-bg-code); color: var(--of-color-gray-200); padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.6;">
                <span style="color: var(--of-color-primary-300);">const</span> result = <span style="color: var(--of-badge-green-border);">await</span> llm.generate(prompt)<AiStreamingCursor style="background: var(--of-color-gray-200);" />
              </div>
            </div>
          </div>
        </section>

        <section class="dev-section">
          <h2>AiMessageBubble / UserMessageBubble 消息气泡</h2>
          <p class="dev-desc">AiMessageBubble（AI 消息，支持 Markdown，:streaming 属性显示光标）和 UserMessageBubble（用户消息，紫色气泡）。</p>
          <div style="max-width: 680px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: flex-end;">
              <UserMessageBubble content="帮我写一份项目架构方案，要包含前后端技术选型和部署方案" />
            </div>
            <AiMessageBubble content="好的！以下是项目架构方案：\n\n**前端技术栈**\n- Vue 3 + TypeScript + Vite\n- Pinia 状态管理\n- oneflow-ui 组件库" />
            <div style="display: flex; justify-content: flex-end;">
              <UserMessageBubble content="部署方案用 Docker + K8s 可以吗？" />
            </div>
            <AiMessageBubble content="**后端技术栈**\n- FastAPI + Python 3.11\n- PostgreSQL + Redis 缓存" :streaming="true" />
          </div>
        </section>

        <section class="dev-section">
          <h2>AiMessageList + AiSender 完整对话界面</h2>
          <p class="dev-desc">
            AiMessageList 渲染 ChatMessage[] 消息列表（ChatMessage.role 为 "ai" | "user"），
            AiSender 提供输入框和发送按钮（v-model 绑定输入内容，@send 触发发送）。
          </p>
          <div
            style="border: 1px solid var(--of-border-color); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; height: 520px;"
          >
            <!-- 头部 -->
            <div style="padding: 14px 20px; border-bottom: 1px solid var(--of-color-gray-200); display: flex; align-items: center; gap: 10px; flex-shrink: 0; background: var(--of-color-bg-elevated);">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--of-color-primary-50); display: flex; align-items: center; justify-content: center; font-size: 16px;">🤖</div>
              <div>
                <div style="font-size: 13px; font-weight: 600; color: var(--of-color-text-primary);">OneFlow AI 助手</div>
                <div style="font-size: 11px; color: var(--of-color-success);">● 在线</div>
              </div>
            </div>

            <!-- 消息列表 -->
            <div style="flex: 1; overflow-y: auto; padding: 16px; background: var(--of-color-bg-canvas);">
              <AiMessageList :messages="aiMessages" />
              <div v-if="aiThinking" style="margin-top: 8px; display: flex; align-items: flex-end; gap: 10px;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--of-color-primary-50); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;">🤖</div>
                <AiThinking size="md" />
              </div>
            </div>

            <!-- 发送框 -->
            <div style="border-top: 1px solid var(--of-color-gray-200); flex-shrink: 0;">
              <AiSender v-model="aiInput" placeholder="向 AI 提问..." @send="sendAiMessage" />
            </div>
          </div>
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           Composables 使用示例
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'composables'">
        <section class="dev-section">
          <h2>Composables 使用示例</h2>
          <p class="dev-desc">oneflow-ui 提供一套完整的 Composables，可单独使用，无需引入组件。</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;">

            <div class="composable-card">
              <div class="composable-card__header">
                <span class="composable-badge">useAiChat</span>
                <span class="composable-desc-sm">AI 对话状态管理</span>
              </div>
              <pre class="composable-code">const { messages, isGenerating,
  send, cancel
} = useAiChat({
  sendRequest: async (content) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
    return res.body // ReadableStream
  },
  parseChunk: (data) => data?.answer ?? null,
  typewriter: true,        // 打字机效果
  typewriterSpeed: 20,     // ms/字符
})</pre>
            </div>

            <div class="composable-card">
              <div class="composable-card__header">
                <span class="composable-badge">useStream</span>
                <span class="composable-desc-sm">通用流式处理</span>
              </div>
              <pre class="composable-code">const { isStreaming, start, cancel } = useStream({
  mode: 'sse',  // 'raw' | 'sse'
  onData: (parsed) => {
    fullText.value += parsed.answer
  },
  onDone: () => console.log('完成'),
})
// 绑定到 fetch Response.body
await start(response.body)</pre>
            </div>

            <div class="composable-card">
              <div class="composable-card__header">
                <span class="composable-badge">useTable</span>
                <span class="composable-desc-sm">表格状态管理</span>
              </div>
              <pre class="composable-code">const { data, pagination, sort,
  toggleSort, setPage,
  selectedCount, toggleRowSelection,
  isAllSelected, clearSelection,
} = useTable({
  data: rawRows,
  pageSize: 20,
  // 服务端分页：
  serverSide: true,
  onFetch: async ({ page, sort }) =>
    api.getTasks({ page, sort }),
})</pre>
            </div>

            <div class="composable-card">
              <div class="composable-card__header">
                <span class="composable-badge">useTableFilter</span>
                <span class="composable-desc-sm">多条件筛选</span>
              </div>
              <pre class="composable-code">const { conditions, addCondition,
  updateCondition, filterData, isActive,
} = useTableFilter({ columns })

// 与 useTable 组合使用：
const filtered = computed(() =>
  filterData(rawRows.value)
)
table.setData(filtered.value)</pre>
            </div>

            <div class="composable-card">
              <div class="composable-card__header">
                <span class="composable-badge">useTypewriter</span>
                <span class="composable-desc-sm">打字机效果</span>
              </div>
              <pre class="composable-code">const { displayText, isTyping,
  append, reset, flush
} = useTypewriter({ speed: 20 })

// 流式输出时逐字显示：
onChunk: (text) => append(text)

// 紧急停止时直接完成：
cancel: () => flush()</pre>
            </div>

            <div class="composable-card">
              <div class="composable-card__header">
                <span class="composable-badge">useMarkdown</span>
                <span class="composable-desc-sm">Markdown 渲染 + 代码高亮</span>
              </div>
              <pre class="composable-code">const { renderMarkdown } = useMarkdown({
  showCopyButton: true,
})

const html = renderMarkdown(markdownStr)
// 在模板中：
// &lt;div v-html="html" class="of-markdown" /&gt;</pre>
            </div>

            <div class="composable-card">
              <div class="composable-card__header">
                <span class="composable-badge">useBadge + ColorMap</span>
                <span class="composable-desc-sm">数据驱动徽章</span>
              </div>
              <pre class="composable-code">// 完全自定义状态映射：
const myStatusMap: ColorMap = {
  draft:    { text:'#64748B', bg:'#F1F5F9', label:'草稿' },
  review:   { text:'#7C3AED', bg:'#EDE9FE', label:'审核中' },
  published:{ text:'#22C55E', bg:'#DCFCE7', label:'已发布' },
}
// 传给任意组件：
// &lt;DataTable :status-color-map="myStatusMap" /&gt;
// &lt;KanbanBoard :status-color-map="myStatusMap" /&gt;</pre>
            </div>

          </div>
        </section>
      </template>

      <!-- ══════════════════════════════════════════════════════
           新原子组件（v2.0）
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'new-atoms'">

        <!-- Badge -->
        <section class="dev-section">
          <h2>Badge 徽章</h2>
          <p class="dev-desc">通用标签/徽章，支持 color 命名色、priority 优先级（P0-P3）、size 尺寸。未匹配 color 时自动降级为默认灰色。</p>
          <div class="dev-row" style="flex-wrap: wrap; gap: 8px; align-items: center;">
            <Badge color="blue">进行中</Badge>
            <Badge color="green">已完成</Badge>
            <Badge color="orange">已阻塞</Badge>
            <Badge color="red">失败</Badge>
            <Badge color="purple">审核中</Badge>
            <Badge>默认</Badge>
          </div>
          <div class="dev-row" style="flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 12px;">
            <span style="font-size: 12px; color: var(--of-color-text-tertiary);">优先级：</span>
            <Badge priority="P0">P0</Badge>
            <Badge priority="P1">P1</Badge>
            <Badge priority="P2">P2</Badge>
            <Badge priority="P3">P3</Badge>
          </div>
          <div class="dev-row" style="flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 12px;">
            <span style="font-size: 12px; color: var(--of-color-text-tertiary);">尺寸：</span>
            <Badge color="blue" size="sm">小</Badge>
            <Badge color="blue" size="md">中（默认）</Badge>
          </div>
        </section>

        <!-- ProgressBar -->
        <section class="dev-section">
          <h2>ProgressBar 进度条</h2>
          <p class="dev-desc">线性进度条，value=100 时自动变绿表示完成，支持自定义颜色、高度、圆角。</p>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <div style="font-size: 13px; color: var(--of-color-text-secondary); margin-bottom: 6px;">普通进度 60%</div>
              <ProgressBar :value="60" :show-label="true" />
            </div>
            <div>
              <div style="font-size: 13px; color: var(--of-color-text-secondary); margin-bottom: 6px;">完成状态 100%（自动变绿）</div>
              <ProgressBar :value="100" :show-label="true" />
            </div>
            <div>
              <div style="font-size: 13px; color: var(--of-color-text-secondary); margin-bottom: 6px;">自定义颜色 + 高度</div>
              <ProgressBar :value="75" color="var(--of-badge-purple-text)" :height="10" />
            </div>
            <div>
              <div style="font-size: 13px; color: var(--of-color-text-secondary); margin-bottom: 6px;">动态控制（当前：{{ progressVal }}%）</div>
              <ProgressBar :value="progressVal" :show-label="true" />
              <div class="dev-row" style="margin-top: 8px; gap: 8px;">
                <button class="dev-btn" @click="progressVal = Math.max(0, progressVal - 10)">-10%</button>
                <button class="dev-btn" @click="progressVal = Math.min(100, progressVal + 10)">+10%</button>
                <button class="dev-btn" @click="progressVal = 100">完成</button>
                <button class="dev-btn" style="background:var(--of-color-gray-100);color:var(--of-color-text-secondary)" @click="progressVal = 0">重置</button>
              </div>
            </div>
          </div>
        </section>

        <!-- StatusIndicator -->
        <section class="dev-section">
          <h2>StatusIndicator 状态指示灯</h2>
          <p class="dev-desc">点 + 标签的状态指示，通过 statusColorMap 完全自定义颜色映射，支持自定义 unknown 状态。</p>
          <div class="dev-row" style="flex-wrap: wrap; gap: 16px; align-items: center;">
            <StatusIndicator status="in_progress" label="进行中" />
            <StatusIndicator status="completed" label="已完成" />
            <StatusIndicator status="blocked" label="已阻塞" />
            <StatusIndicator status="reviewing" label="审核中" />
            <StatusIndicator status="idle" label="空闲" />
            <StatusIndicator status="open" label="待处理" />
            <StatusIndicator status="unknown-xyz" label="未知状态" />
          </div>
        </section>

        <!-- Switch -->
        <section class="dev-section">
          <h2>Switch 开关</h2>
          <p class="dev-desc">无障碍开关，role="switch" + aria-checked，支持键盘空格键切换、加载状态、禁用状态、自定义颜色。</p>
          <div class="dev-row" style="flex-wrap: wrap; gap: 20px; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <OneSwitch v-model="switchVal" />
              <span style="font-size: 14px; color: var(--of-color-text-primary);">{{ switchVal ? '已开启' : '已关闭' }}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <OneSwitch :model-value="true" :loading="true" />
              <span style="font-size: 13px; color: var(--of-color-text-secondary);">加载中</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <OneSwitch :model-value="false" :disabled="true" />
              <span style="font-size: 13px; color: var(--of-color-text-secondary);">禁用（关）</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <OneSwitch :model-value="true" :disabled="true" />
              <span style="font-size: 13px; color: var(--of-color-text-secondary);">禁用（开）</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <OneSwitch :model-value="true" active-color="var(--of-badge-purple-text)" />
              <span style="font-size: 13px; color: var(--of-color-text-secondary);">自定义颜色</span>
            </div>
          </div>
        </section>

        <!-- Stepper -->
        <section class="dev-section">
          <h2>Stepper 步骤条</h2>
          <p class="dev-desc">水平/垂直步骤条，当前步骤高亮，已完成步骤显示勾号，支持键盘控制（演示用）。</p>
          <div style="margin-bottom: 20px;">
            <Stepper :steps="stepperItems" :current="stepperCurrent" />
          </div>
          <div class="dev-row" style="gap: 8px;">
            <button class="dev-btn" :disabled="stepperCurrent <= 0" @click="stepperCurrent--">← 上一步</button>
            <button class="dev-btn" :disabled="stepperCurrent >= stepperItems.length - 1" @click="stepperCurrent++">下一步 →</button>
            <button class="dev-btn" style="background:var(--of-color-gray-100);color:var(--of-color-text-secondary)" @click="stepperCurrent = 0">重置</button>
          </div>
          <div style="margin-top: 24px;">
            <div style="font-size: 13px; color: var(--of-color-text-secondary); margin-bottom: 12px;">垂直方向：</div>
            <Stepper :steps="stepperItems" :current="stepperCurrent" direction="vertical" />
          </div>
        </section>

        <!-- Accordion -->
        <section class="dev-section">
          <h2>Accordion 手风琴</h2>
          <p class="dev-desc">默认 v-show 保持内容（keepAlive），lazy=true 时用 v-if 按需渲染。multiple=true 允许多项同时展开。</p>
          <div style="margin-bottom: 24px;">
            <div style="font-size: 13px; color: var(--of-color-text-secondary); margin-bottom: 8px;">单选（默认）：</div>
            <Accordion v-model="accordionVal" :items="accordionItems">
              <template #default="{ item }">
                <div style="padding: 12px 16px; font-size: 14px; color: var(--of-color-text-primary); line-height: 1.7;">
                  {{ accordionContents[item.key] }}
                </div>
              </template>
            </Accordion>
          </div>
          <div>
            <div style="font-size: 13px; color: var(--of-color-text-secondary); margin-bottom: 8px;">多选（multiple=true）：</div>
            <Accordion v-model="accordionMultiVal" :items="accordionItems" :multiple="true">
              <template #default="{ item }">
                <div style="padding: 12px 16px; font-size: 14px; color: var(--of-color-text-primary); line-height: 1.7;">
                  {{ accordionContents[item.key] }}
                </div>
              </template>
            </Accordion>
          </div>
        </section>

        <!-- Drawer + SidePanel -->
        <section class="dev-section">
          <h2>Drawer 内联抽屉 & SidePanel 侧边面板</h2>
          <p class="dev-desc">
            <strong>Drawer</strong>：推挤内容的内联元素，适合布局级侧边栏。
            <strong>SidePanel</strong>：Teleport 到 body，浮层叠加，适合临时信息面板。
          </p>
          <div class="dev-row" style="gap: 12px; margin-bottom: 16px;">
            <button class="dev-btn" @click="drawerOpen = !drawerOpen">
              {{ drawerOpen ? '关闭 Drawer' : '打开 Drawer' }}
            </button>
            <button class="dev-btn" @click="sidePanelOpen = !sidePanelOpen">
              {{ sidePanelOpen ? '关闭 SidePanel' : '打开 SidePanel' }}
            </button>
          </div>

          <div style="display: flex; border: 1px solid var(--of-border-color); border-radius: 8px; overflow: hidden; min-height: 200px; position: relative;">
            <Drawer v-model="drawerOpen" title="Drawer 抽屉" :width="240">
              <div style="padding: 16px; font-size: 14px; color: var(--of-color-text-primary); line-height: 1.8;">
                <p>内联 Drawer 内容</p>
                <p style="color: var(--of-color-text-secondary); font-size: 13px;">与主内容并排显示，推挤而非覆盖。</p>
              </div>
            </Drawer>
            <div style="flex: 1; padding: 24px; font-size: 14px; color: var(--of-color-text-secondary);">
              主内容区域 — Drawer 打开时会被推挤到右侧
            </div>
          </div>

          <!-- SidePanel（Teleport 到 body） -->
          <SidePanel
            v-model="sidePanelOpen"
            title="SidePanel 侧边面板"
            :width="320"
          >
            <div style="padding: 16px; font-size: 14px; color: var(--of-color-text-primary); line-height: 1.8;">
              <p>SidePanel 通过 Teleport 挂载到 body。</p>
              <p style="color: var(--of-color-text-secondary); font-size: 13px;">适合临时弹出的详情、设置、过滤器等面板。</p>
              <p style="margin-top: 16px;">
                <strong>mode="lazy"</strong>：关闭后销毁 DOM（v-if）<br/>
                <strong>mode="persistent"</strong>：关闭后保留 DOM（v-show）
              </p>
            </div>
          </SidePanel>
        </section>

        <!-- ActivityTimeline -->
        <section class="dev-section">
          <h2>ActivityTimeline 活动时间线</h2>
          <p class="dev-desc">垂直时间线组件，支持 done/active/pending/error 四种状态，支持 avatar 头像或 icon 图标。</p>
          <ActivityTimeline :items="timelineItems" />
        </section>

      </template>

      <!-- ══════════════════════════════════════════════════════
           业务组件（v2.1）
      ════════════════════════════════════════════════════════ -->
      <template v-if="activeSection === 'biz-components'">

        <!-- RefTag -->
        <section class="dev-section">
          <h2>RefTag 引用标签</h2>
          <p class="dev-desc">用于引用 Spec / Wiki / Task 等资源的彩色标签，支持自定义图标和链接。</p>
          <div class="dev-row" style="flex-wrap: wrap; gap: 8px;">
            <RefTag type="spec">spec:arch:ARCH-001</RefTag>
            <RefTag type="wiki">wiki:ROLE-BE-001</RefTag>
            <RefTag type="task">task:ZHO-BE-010</RefTag>
            <RefTag type="spec" href="#">可点击的链接标签</RefTag>
          </div>
          <div class="dev-row" style="flex-wrap: wrap; gap: 8px; margin-top: 12px;">
            <span style="font-size: 12px; color: var(--of-color-text-tertiary);">自定义颜色：</span>
            <RefTag :color="'var(--of-badge-orange-text)'" bg="var(--of-color-warning-light)" icon="alert-triangle">warning:OPS-003</RefTag>
            <RefTag :color="'var(--of-badge-red-text)'" bg="var(--of-color-error-light)" icon="bug">bug:FAPI-042</RefTag>
          </div>
        </section>

        <!-- Avatar -->
        <section class="dev-section">
          <h2>Avatar 角色头像</h2>
          <p class="dev-desc">根据 role 自动分配颜色的圆形头像，支持自定义大小和颜色。无 role 时根据 name 哈希选色。</p>
          <div class="dev-row" style="gap: 12px; align-items: center;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <Avatar name="Backend" role="BE" />
              <span style="font-size: 11px; color: var(--of-color-text-secondary);">BE</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <Avatar name="Frontend" role="FE" />
              <span style="font-size: 11px; color: var(--of-color-text-secondary);">FE</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <Avatar name="PM" role="PM" />
              <span style="font-size: 11px; color: var(--of-color-text-secondary);">PM</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <Avatar name="DBA" role="DBA" />
              <span style="font-size: 11px; color: var(--of-color-text-secondary);">DBA</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <Avatar name="Architect" role="ARCH" />
              <span style="font-size: 11px; color: var(--of-color-text-secondary);">ARCH</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <Avatar name="Operations" role="OPM" />
              <span style="font-size: 11px; color: var(--of-color-text-secondary);">OPM</span>
            </div>
          </div>
          <div class="dev-row" style="gap: 12px; margin-top: 16px; align-items: center;">
            <span style="font-size: 12px; color: var(--of-color-text-tertiary);">不同尺寸：</span>
            <Avatar name="Alice" :size="20" />
            <Avatar name="Bob" :size="28" />
            <Avatar name="Charlie" :size="36" />
            <Avatar name="张三" :size="40" />
          </div>
        </section>

        <!-- SelectBadge -->
        <section class="dev-section">
          <h2>SelectBadge 选择徽章</h2>
          <p class="dev-desc">带下拉箭头的彩色徽章，适用于状态/优先级选择器的触发按钮。</p>
          <div class="dev-row" style="flex-wrap: wrap; gap: 8px;">
            <SelectBadge color="orange" :dot="true" :dot-color="'var(--of-badge-orange-text)'">Blocked</SelectBadge>
            <SelectBadge color="blue" :dot="true" :dot-color="'var(--of-badge-blue-text)'">In Progress</SelectBadge>
            <SelectBadge color="green" :dot="true" :dot-color="'var(--of-badge-green-text)'">Done</SelectBadge>
            <SelectBadge color="red">P0 紧急</SelectBadge>
            <SelectBadge color="purple">审核中</SelectBadge>
            <SelectBadge color="gray" :clickable="false">只读标签</SelectBadge>
          </div>
        </section>

        <!-- ChainItem -->
        <section class="dev-section">
          <h2>ChainItem 链路追踪项</h2>
          <p class="dev-desc">用于展示 AI 推理链路中的源数据查询和结果返回，支持 source（紫色）和 result（绿色）两种预设。</p>
          <div style="display: flex; flex-direction: column; gap: 12px; max-width: 600px;">
            <ChainItem
              type="source"
              title="用户查询上下文"
              description="role: BE-Agent, project: ZHO, scope: full, limit: 20"
            />
            <ChainItem
              type="result"
              title="内存查询成功"
              description="获取了 6 条相关任务记录、12 条决策记录"
              duration="280ms"
            />
            <ChainItem
              type="source"
              title="检索知识库"
              description="index: architecture-docs, query: 认证中间件重构方案"
            />
            <ChainItem
              type="result"
              title="文档匹配完成"
              description="匹配到 3 篇相关文档，相关性分数: 0.92, 0.87, 0.71"
              duration="150ms"
            />
          </div>
        </section>

        <!-- DescBlock -->
        <section class="dev-section">
          <h2>DescBlock 描述块</h2>
          <p class="dev-desc">灰底圆角描述容器，用于任务详情、备注等段落文本区域。</p>
          <div style="max-width: 600px;">
            <DescBlock>
              <p style="margin: 0; color: var(--of-color-text-primary);">重构现有认证中间件，支持 JWT + Session 双模式认证。需要兼容现有 API 调用方式，同时为新的 Agent 认证流程提供扩展点。</p>
              <p style="margin: 0; color: var(--of-color-warning);">当前阻塞原因：等待 /api/auth/token 接口完成，该接口由 ZHO-BE-010 任务负责。</p>
            </DescBlock>
          </div>
        </section>

        <!-- ViewModeGroup -->
        <section class="dev-section">
          <h2>ViewModeGroup 视图模式切换</h2>
          <p class="dev-desc">图标按钮组，用于切换详情的展示模式（侧边面板 / 弹窗 / 全屏）。</p>
          <div class="dev-row" style="gap: 16px; align-items: center;">
            <ViewModeGroup v-model="viewModeVal" />
            <span style="font-size: 13px; color: var(--of-color-text-secondary);">当前模式：<strong>{{ viewModeVal }}</strong></span>
          </div>
          <div class="dev-row" style="gap: 16px; align-items: center; margin-top: 16px;">
            <span style="font-size: 12px; color: var(--of-color-text-tertiary);">自定义选项：</span>
            <ViewModeGroup
              v-model="viewModeVal"
              :options="[
                { value: 'list', icon: 'list', label: '列表' },
                { value: 'grid', icon: 'grid-3x3', label: '网格' },
                { value: 'compact', icon: 'align-justify', label: '紧凑' },
              ]"
            />
          </div>
        </section>

        <!-- ViewSwitcher -->
        <section class="dev-section">
          <h2>ViewSwitcher 视图切换工具栏</h2>
          <p class="dev-desc">完整的 Notion 风格视图切换工具栏，包含视图标签、筛选/分组/排序按钮和搜索框。</p>
          <div style="border: 1px solid var(--of-border-color); border-radius: 8px; overflow: hidden;">
            <ViewSwitcher
              v-model="viewSwitcherTab"
              @filter="toast.info('点击了筛选')"
              @group="toast.info('点击了分组')"
              @sort="toast.info('点击了排序')"
              @search="(q: string) => toast.info(`搜索: ${q}`)"
            />
            <div style="padding: 40px; text-align: center; color: var(--of-color-text-tertiary); font-size: 14px;">
              当前视图：<strong style="color: var(--of-color-text-primary);">{{ viewSwitcherTab }}</strong>
            </div>
          </div>
          <div style="margin-top: 16px; border: 1px solid var(--of-border-color); border-radius: 8px; overflow: hidden;">
            <ViewSwitcher
              v-model="viewSwitcherTab"
              :tabs="[
                { value: 'all', label: '全部', icon: 'inbox' },
                { value: 'mine', label: '我的', icon: 'user' },
                { value: 'starred', label: '收藏', icon: 'star' },
              ]"
              :show-group="false"
              filter-label="过滤"
              sort-label="排序"
              search-placeholder="搜索任务..."
            />
            <div style="padding: 40px; text-align: center; color: var(--of-color-text-tertiary); font-size: 14px;">
              自定义标签 + 隐藏分组按钮
            </div>
          </div>
        </section>

      </template>

      <!-- ══ v3 信息组件 ══ -->
      <template v-if="activeSection === 'v3-components'">

        <!-- SectionBlock -->
        <section class="dev-section">
          <h2>SectionBlock 章节块</h2>
          <p class="dev-desc">可折叠的内容章节，支持 pending/updating/done/editing 四种状态，适用于文档章节、配置面板。</p>
          <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
            <button v-for="s in ['pending','updating','done','editing']" :key="s"
              @click="sectionStatus = s as any"
              :style="{ padding: '4px 12px', borderRadius: '6px', border: sectionStatus === s ? '1px solid var(--of-color-primary-500)' : '1px solid var(--of-border-color)', background: sectionStatus === s ? 'var(--of-color-primary-50)' : 'var(--of-color-bg-elevated)', color: sectionStatus === s ? 'var(--of-color-primary-500)' : 'var(--of-color-text-secondary)', fontSize: '12px', cursor: 'pointer' }">
              {{ s }}
            </button>
          </div>
          <div style="max-width: 600px;">
            <SectionBlock
              title="市场分析"
              icon="📊"
              :status="sectionStatus"
              v-model:collapsed="sectionCollapsed"
              :editable="true"
              @edit="sectionStatus = 'editing'"
              @save="sectionStatus = 'done'"
            >
              <p style="margin: 0; font-size: 13px; color: var(--of-color-text-primary); line-height: 1.8;">
                当前市场规模约 <strong>120亿</strong>，年增长率 15%。核心竞品包括 A（市占率 35%）、B（22%）、C（18%）。
                目标用户群体以 25-40 岁城市白领为主，对品质和效率有较高需求。
              </p>
              <template #editor>
                <textarea style="width: 100%; border: none; outline: none; background: var(--of-color-warning-light); resize: none; font-size: 12px; line-height: 1.8; padding: 4px; min-height: 80px; font-family: inherit;">当前市场规模约 120亿，年增长率 15%。核心竞品包括 A（市占率 35%）、B（22%）、C（18%）。</textarea>
              </template>
            </SectionBlock>
          </div>
        </section>

        <!-- MonitorItem -->
        <section class="dev-section">
          <h2>MonitorItem 监控进度行</h2>
          <p class="dev-desc">紧凑的项目监控行，用于仪表盘顶部展示执行中的项目/任务进度。</p>
          <div style="max-width: 700px; background: var(--of-color-bg-elevated); border: 1px solid var(--of-border-color); border-radius: 8px; overflow: hidden;">
            <div style="padding: 8px 14px; font-size: 11px; font-weight: 600; color: var(--of-color-text-secondary); border-bottom: 1px solid var(--of-color-gray-200);">
              ⚡ 执行中 3 个
            </div>
            <MonitorItem label="用户认证系统重构" subtitle="flowapi / main" :value="75" count="6/8" :clickable="true" />
            <MonitorItem label="前端组件库升级" subtitle="oneui / develop" :value="45" count="3/7" :clickable="true" />
            <MonitorItem label="数据库迁移方案" subtitle="flowapi / main" :value="100" count="5/5" :clickable="true" />
          </div>
        </section>

        <!-- StatusSummary -->
        <section class="dev-section">
          <h2>StatusSummary 状态摘要条</h2>
          <p class="dev-desc">水平排列的状态计数条，用于表格/列表上方的快速状态概览。</p>
          <div style="max-width: 700px; background: var(--of-color-bg-elevated); border: 1px solid var(--of-border-color); border-radius: 8px; overflow: hidden;">
            <StatusSummary :items="[
              { key: 'pending', label: '待处理', count: 5, color: 'var(--of-color-gray-300)' },
              { key: 'progress', label: '执行中', count: 3, color: 'var(--of-color-info)', highlight: true },
              { key: 'done', label: '已完成', count: 12, color: 'var(--of-color-success)' },
              { key: 'blocked', label: '阻塞', count: 1, color: 'var(--of-color-error)', highlight: true },
            ]">
              <template #extra>
                <span style="color: var(--of-color-warning); font-size: 11px;">⚠ 停滞 2</span>
              </template>
            </StatusSummary>
            <div style="padding: 30px; text-align: center; color: var(--of-color-text-tertiary); font-size: 12px;">表格内容区域</div>
          </div>
        </section>

        <!-- InfoCard -->
        <section class="dev-section">
          <h2>InfoCard 信息卡片</h2>
          <p class="dev-desc">三合一信息卡，通过 variant 切换 memo（备忘录）、notify（通知）、history（历史记录）三种形态。</p>

          <h3 style="font-size: 13px; color: var(--of-color-text-secondary); margin: 16px 0 8px;">variant="memo"</h3>
          <div style="max-width: 500px; display: flex; flex-direction: column; gap: 8px;">
            <InfoCard
              variant="memo"
              title="认证中间件重构方案已确认"
              content="经过评审，决定采用 JWT + refresh token 的双层认证架构。核心改动涉及 auth_middleware.py、token_service.py 和 session_store.py 三个模块。"
              :tags="['架构决策', '认证']"
              author="PM-Agent"
              date="2026-03-14"
            />
            <InfoCard
              variant="memo"
              title="紧急：生产环境 Token 过期问题"
              content="发现 refresh token 在高并发场景下存在竞态条件，需要尽快修复。"
              importance="high"
              :tags="['紧急', 'Bug']"
              author="OPS"
              date="2026-03-15"
            />
          </div>

          <h3 style="font-size: 13px; color: var(--of-color-text-secondary); margin: 16px 0 8px;">variant="notify"</h3>
          <div style="max-width: 500px; background: var(--of-color-bg-elevated); border: 1px solid var(--of-border-color); border-radius: 8px; overflow: hidden;">
            <InfoCard variant="notify" title="Plan FAPI-042 已进入执行阶段" content="认证系统重构方案已批准，共 8 个任务已创建" :unread="true" meta="system · 3分钟前" />
            <InfoCard variant="notify" title="Task FAPI-042-003 已完成" content="JWT 签发模块开发完毕，测试通过" :unread="true" meta="BE-Agent · 1小时前" />
            <InfoCard variant="notify" title="代码评审通过" content="PR #127 已合并到 main 分支" :unread="false" meta="QA · 昨天" />
          </div>

          <h3 style="font-size: 13px; color: var(--of-color-text-secondary); margin: 16px 0 8px;">variant="history"</h3>
          <div style="max-width: 500px; display: flex; flex-direction: column; gap: 8px;">
            <InfoCard variant="history" title="小红书冷启动推广方案" subtitle="5人 · 8章节 · 2轮" type="模板" type-color="var(--of-color-primary-500)" date="2026-03-12">
              <template #actions>
                <button style="font-size: 11px; padding: 3px 10px; border-radius: 6px; background: var(--of-color-primary-50); color: var(--of-color-primary-500); border: none; cursor: pointer;">使用</button>
              </template>
            </InfoCard>
            <InfoCard variant="history" title="季度定价策略讨论" subtitle="AI协作 · 6/8 章节完成" type="会话" type-color="var(--of-color-success)" date="2026-03-10">
              <template #actions>
                <button style="font-size: 11px; padding: 3px 10px; border-radius: 6px; background: var(--of-color-success-light); color: var(--of-color-success); border: none; cursor: pointer;">恢复</button>
              </template>
            </InfoCard>
          </div>
        </section>

        <!-- PersonaCard -->
        <section class="dev-section">
          <h2>PersonaCard 角色卡片</h2>
          <p class="dev-desc">角色/人物卡片，支持 emoji 方形头像、标签、展开详情。适用于团队成员、Agent 角色、评审人员展示。</p>
          <div style="max-width: 500px; display: flex; flex-direction: column; gap: 8px;">
            <PersonaCard
              name="策略大师"
              title="首席策略师"
              icon="🎯"
              color="var(--of-color-primary-500)"
              subtitle="整合全局，把控从洞察到转化的完整链路"
              :tags="['策略', '全局统筹']"
              v-model:expanded="personaExpanded"
            >
              <div style="font-size: 12px; color: var(--of-color-text-secondary); line-height: 1.8;">
                <p style="margin: 0 0 8px;">专注方向：统筹全局，确保各模块协同一致</p>
                <p style="margin: 0;">输出到章节：📋 执行路径</p>
              </div>
            </PersonaCard>
            <PersonaCard
              name="洞察研究员"
              title="市场研究专家"
              icon="🔍"
              color="var(--of-color-success)"
              subtitle="挖掘目标受众的情感裂缝和反常识切入视角"
              :tags="['用户洞察', '竞品分析']"
              v-model:expanded="persona2Expanded"
            >
              <div style="font-size: 12px; color: var(--of-color-text-secondary); line-height: 1.8;">
                <p style="margin: 0;">负责深度用户画像分析和市场趋势研究</p>
              </div>
            </PersonaCard>
            <PersonaCard name="内容弧线师" title="内容策划" icon="✍️" color="var(--of-color-warning)" :active="true" />
            <PersonaCard name="账号搭建师" title="运营专家" icon="🏗️" color="#ec4899" :done="true" />
            <PersonaCard name="离线成员" title="数据分析师" icon="📈" color="var(--of-badge-purple-text)" :disabled="true" />
          </div>
        </section>

      </template>

    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--of-color-bg-canvas);
}

/* CSS 变量 */
:root {
  --of-color-primary: #7c3aed;
  --of-color-primary-50: #f5f3ff;
  --of-color-primary-100: #ede9fe;
  --of-color-primary-200: #ddd6fe;
  --of-color-primary-300: #c4b5fd;
  --of-color-primary-400: #a78bfa;
  --of-color-primary-500: #7c3aed;
  --of-color-primary-600: #7c3aed;
  --of-color-primary-700: #6d28d9;
  --of-color-primary-foreground: #fff;
  --of-color-text: #111827;
  --of-color-text-secondary: #6b7280;
  --of-color-bg-canvas: #f8fafc;
  --of-color-bg-elevated: #ffffff;
  --of-color-gray-50: #f9fafb;
  --of-color-gray-100: #f3f4f6;
  --of-color-gray-200: #e5e7eb;
  --of-color-gray-300: #d1d5db;
  --of-color-gray-400: #9ca3af;
  --of-color-gray-500: #6b7280;
  --of-color-gray-600: #4b5563;
  --of-color-gray-700: #374151;
  --of-color-gray-800: #1f2937;
  --of-color-gray-900: #111827;
  --of-color-blue-50: #eff6ff;
  --of-color-blue-100: #dbeafe;
  --of-color-blue-200: #bfdbfe;
  --of-color-blue-500: #3b82f6;
  --of-color-blue-600: #2563eb;
  --of-color-green-50: #f0fdf4;
  --of-color-green-200: #bbf7d0;
  --of-color-green-500: #22c55e;
  --of-color-green-600: #16a34a;
  --of-color-orange-50: #fff7ed;
  --of-color-orange-200: #fed7aa;
  --of-color-orange-500: #f97316;
  --of-color-orange-600: #ea580c;
  --of-color-red-50: #fef2f2;
  --of-color-red-200: #fecaca;
  --of-color-red-500: #ef4444;
  --of-color-red-600: #dc2626;
  --of-color-red-700: #b91c1c;
  --of-color-purple-50: #faf5ff;
  --of-color-purple-600: #9333ea;
  --of-color-yellow-50: #fffbeb;
  --of-color-yellow-500: #f59e0b;
  --of-color-success: #22c55e;
  --of-color-warning: #f59e0b;
  --of-color-error: #ef4444;
  --of-spacing-1: 4px;
  --of-spacing-2: 8px;
  --of-spacing-3: 12px;
  --of-spacing-4: 16px;
  --of-spacing-5: 20px;
  --of-spacing-6: 24px;
  --of-spacing-8: 32px;
  --of-radius-sm: 4px;
  --of-radius-md: 6px;
  --of-radius-lg: 8px;
  --of-radius-xl: 12px;
  --of-radius-full: 9999px;
  --of-transition-fast: all 0.15s ease;
  --of-transition-normal: all 0.2s ease;
  --of-border: 1px solid #e5e7eb;
  --of-navbar-height: 52px;
  --of-sidebar-width: 220px;
  --of-statusbar-height: 32px;
  --of-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --of-font-mono: "JetBrains Mono", "Fira Code", monospace;
}

.dev-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dev-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--of-color-bg-elevated);
  border-bottom: 1px solid var(--of-border-color);
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  height: 52px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.dev-header__logo {
  font-weight: 700;
  font-size: 16px;
  color: var(--of-color-primary-500);
  white-space: nowrap;
}
.dev-header__nav {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.dev-nav-btn {
  padding: 5px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  color: var(--of-color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}
.dev-nav-btn:hover {
  background: var(--of-color-bg-hover);
  color: var(--of-color-text-primary);
}
.dev-nav-btn.active {
  background: var(--of-color-bg-active);
  color: var(--of-color-primary-500);
  font-weight: 600;
}

.dev-main {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.dev-section {
  background: var(--of-color-bg-elevated);
  border: 1px solid var(--of-border-color);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}
.dev-section h2 {
  font-size: 15px;
  font-weight: 600;
  color: var(--of-color-text-primary);
  margin: 0 0 6px 0;
  padding-bottom: 0;
  border-bottom: none;
}
.dev-desc {
  font-size: 13px;
  color: var(--of-color-text-secondary);
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--of-color-gray-100);
  line-height: 1.5;
}

.dev-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.dev-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: var(--of-color-primary-500);
  color: var(--of-color-text-inverse);
  transition: all 0.15s;
}
.dev-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.dev-btn:hover:not(:disabled) {
  background: var(--of-color-primary-700);
}
.dev-btn--info {
  background: var(--of-color-info);
}
.dev-btn--info:hover:not(:disabled) {
  background: var(--of-color-primary-600);
}
.dev-btn--success {
  background: var(--of-color-success);
}
.dev-btn--success:hover:not(:disabled) {
  background: var(--of-badge-green-text);
}
.dev-btn--warning {
  background: var(--of-color-warning);
}
.dev-btn--warning:hover:not(:disabled) {
  background: var(--of-badge-orange-text);
}
.dev-btn--error {
  background: var(--of-color-error);
}
.dev-btn--error:hover:not(:disabled) {
  background: var(--of-color-error);
}

/* ── 徽章样式 ── */
.of-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
}

.dev-json-preview {
  margin-top: 12px;
  background: var(--of-color-bg-code);
  color: var(--of-color-gray-300);
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
}

.demo-table {
  width: 100%;
  border-collapse: collapse;
}
.demo-table th,
.demo-table td {
  border: 1px solid var(--of-border-color);
}
.demo-table th {
  background: var(--of-color-bg-hover);
  color: var(--of-color-text-primary);
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  padding: 8px 10px;
}

/* ── Composables 卡片 ── */
.composable-card {
  background: var(--of-color-bg-elevated);
  border: 1px solid var(--of-border-color);
  border-radius: 10px;
  overflow: hidden;
}
.composable-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--of-color-gray-200);
  background: var(--of-color-bg-hover);
}
.composable-badge {
  display: inline-block;
  padding: 2px 10px;
  background: var(--of-color-primary-100);
  color: var(--of-color-primary-500);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  font-family: "JetBrains Mono", monospace;
}
.composable-desc-sm {
  font-size: 12px;
  color: var(--of-color-text-secondary);
}
.composable-code {
  margin: 0;
  padding: 14px 16px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--of-color-text-primary);
  background: var(--of-color-bg-canvas);
  font-family: "JetBrains Mono", "Fira Code", monospace;
  white-space: pre;
  overflow-x: auto;
}
</style>
