<script setup lang="ts">
import { computed, ref } from "vue";
import {
  DataTable,
  DetailLayout,
  EmptyState,
  GalleryView,
  GanttTimeline,
  KanbanBoard,
  TableToolbar,
} from "../../../index";
import DatabaseEnterpriseDemo from "./DatabaseEnterpriseDemo.vue";
import DatabasePresetDemo from "./DatabasePresetDemo.vue";
import type {
  CommentData,
  DataRecord,
  FilterCondition,
  FilterLogic,
  PropItem,
  TableColumn,
  TableSchema,
  Task,
  ViewConfig,
} from "../../../index";

defineOptions({ name: "DatabaseViewDemo" });

type DatabaseDemoScenario = "normal" | "loading" | "empty" | "error";
type DatabaseDemoMode = "local" | "provider";
type DatabaseDemoViewMode = "table" | "kanban" | "gallery" | "timeline";

const themeSwatches = {
  selected: "var(--of-surface-selected)",
  accent: "var(--of-accent-default)",
  textPrimary: "var(--of-text-primary)",
  textSecondary: "var(--of-text-secondary)",
  muted: "var(--of-surface-muted)",
  panel: "var(--of-surface-panel)",
  accentSoft: "var(--of-accent-soft)",
};

const databaseDemoScenario = ref<DatabaseDemoScenario>("normal");
const databaseDemoMode = ref<DatabaseDemoMode>("provider");
const databaseDemoViewMode = ref<DatabaseDemoViewMode>("table");
const databaseDemoSearchKeyword = ref("");
const databaseDemoFilterConditions = ref<FilterCondition[]>([]);
const databaseDemoFilterLogic = ref<FilterLogic>("and");
const databaseDemoGroupField = ref("");
const databaseDemoSort = ref<{ field: string | null; order: "asc" | "desc" | null }>({
  field: "startDate",
  order: "asc",
});
const databaseDemoActionLog = ref<string[]>(["DatabaseView 页面级 shell 已就绪"]);

const databaseDemoDefaultColumns: TableColumn[] = [
  { key: "title", label: "标题", width: 220 },
  { key: "status", label: "状态", width: 110, type: "status" },
  { key: "priority", label: "优先级", width: 100, type: "priority" },
  { key: "assignee", label: "负责人", width: 120 },
  { key: "startDate", label: "开始日期", width: 120, type: "date" },
  { key: "endDate", label: "结束日期", width: 120, type: "date" },
  { key: "summary", label: "摘要", width: "fill" },
  { key: "coverUrl", label: "封面", width: 120 },
];

const databaseDemoColumns = ref<TableColumn[]>(
  databaseDemoDefaultColumns.map((column) => ({ ...column })),
);

const databaseDemoViewTabs = [
  { value: "table", label: "表格", icon: "table-2" },
  { value: "kanban", label: "看板", icon: "layout-grid" },
  { value: "gallery", label: "画廊", icon: "image" },
  { value: "timeline", label: "时间线", icon: "gantt-chart" },
];

const databaseDemoViewPresets: ViewConfig[] = [
  {
    viewId: "database-table",
    viewType: "table",
    name: "页面表格",
    visibleFields: ["title", "status", "priority", "assignee", "startDate", "endDate", "summary"],
    sorts: [{ fieldId: "startDate", direction: "asc" }],
  },
  {
    viewId: "database-kanban",
    viewType: "kanban",
    name: "页面看板",
    visibleFields: ["title", "status", "priority", "assignee", "summary"],
    kanbanFieldId: "status",
  },
  {
    viewId: "database-gallery",
    viewType: "gallery",
    name: "页面画廊",
    visibleFields: ["title", "status", "priority", "assignee", "coverUrl", "summary"],
    galleryCoverFieldId: "coverUrl",
    galleryCardFields: ["status", "priority", "assignee"],
  },
  {
    viewId: "database-timeline",
    viewType: "timeline",
    name: "页面时间线",
    visibleFields: ["title", "status", "priority", "assignee", "startDate", "endDate"],
    sorts: [{ fieldId: "startDate", direction: "asc" }],
  },
];

const databaseDemoSchema: TableSchema = {
  tableId: "database-demo",
  name: "DatabaseView 页面级方案",
  fields: [
    { id: "title", name: "标题", type: "text", width: 220 },
    {
      id: "status",
      name: "状态",
      type: "select",
      width: 120,
      options: [
        { value: "todo", label: "待处理" },
        { value: "doing", label: "进行中" },
        { value: "done", label: "已完成" },
        { value: "blocked", label: "已阻塞" },
      ],
    },
    {
      id: "priority",
      name: "优先级",
      type: "select",
      width: 100,
      options: [
        { value: "P0", label: "P0" },
        { value: "P1", label: "P1" },
        { value: "P2", label: "P2" },
        { value: "P3", label: "P3" },
      ],
    },
    { id: "assignee", name: "负责人", type: "user", width: 120 },
    { id: "startDate", name: "开始日期", type: "date", width: 120 },
    { id: "endDate", name: "结束日期", type: "date", width: 120 },
    { id: "summary", name: "摘要", type: "richtext", width: 320 },
    { id: "coverUrl", name: "封面", type: "url", width: 120 },
  ],
  views: databaseDemoViewPresets,
};

const databaseDemoSavedViews = [
  { id: "table", name: "表格视图" },
  { id: "kanban", name: "看板视图" },
  { id: "gallery", name: "画廊视图" },
  { id: "timeline", name: "时间线视图" },
];

const databaseDemoSupportedCapabilities = [
  {
    title: "DatabaseView/useDatabaseView 接入形态",
    description: "页面级方案按 shell + composable 的方式组织，方便后续替换成正式导出。",
  },
  {
    title: "detailPresentation 页面契约",
    description: "桌面端默认 right-side workspace，移动端保留 sheet fallback，页面层统一 detail state。",
  },
  {
    title: "density 页面契约",
    description: "compact / standard / comfortable 作为页面与表格共享密度语义，统一行高与视觉密度。",
  },
  {
    title: "local / provider 双模式",
    description: "local 直接消费 schema + records；provider 预留 fetch / refresh / mutation 入口。",
  },
  {
    title: "页面状态透传",
    description: "normal、loading、empty、error 四态都可以在页面壳层统一处理。",
  },
  {
    title: "视图与工具栏编排",
    description: "table / kanban / gallery / timeline 与 search / filter / sort / group / save-view 联动。",
  },
  {
    title: "schema + records + viewConfig",
    description: "当前 Demo 证明页面级方案可以被数据模型驱动，而不是只靠单个组件拼接。",
  },
];

const databaseDemoPendingCapabilities = [
  {
    title: "真实 provider 数据闭环",
    description: "当前 Demo 只证明接入口，真实 fetch / refresh / mutation 仍需上层业务接管。",
  },
  {
    title: "持久化与权限",
    description: "视图保存、字段可见性、操作权限、ACL 还不应在组件层硬编码。",
  },
  {
    title: "写操作编排",
    description: "create / update / delete / schema change 需要依赖具体应用的数据源和策略。",
  },
  {
    title: "完整详情工作区",
    description: "更重的 record drawer / detail workspace 仍应由页面层继续扩展，不在这里假定完成。",
  },
];

const databaseDemoRecords: DataRecord[] = [
  {
    id: "db-1",
    fields: {
      title: "DatabaseView 页面壳",
      status: "doing",
      priority: "P1",
      assignee: "FE",
      startDate: "2026-03-18",
      endDate: "2026-03-22",
      summary: "把 local / provider 两种模式与 actions 契约收成一个页面级入口。",
      coverUrl: themeSwatches.selected,
    },
    updatedAt: "2026-03-19",
  },
  {
    id: "db-2",
    fields: {
      title: "Toolbar 契约接入",
      status: "todo",
      priority: "P2",
      assignee: "FE",
      startDate: "2026-03-20",
      endDate: "2026-03-24",
      summary: "将 TableToolbar、搜索、排序、字段管理与保存视图事件统一接入。",
      coverUrl: themeSwatches.accentSoft,
    },
    updatedAt: "2026-03-18",
  },
  {
    id: "db-3",
    fields: {
      title: "空态 / 错态 / 加载态",
      status: "blocked",
      priority: "P0",
      assignee: "QA",
      startDate: "2026-03-16",
      endDate: "2026-03-21",
      summary: "确保页面级方案能稳定透传 normal、loading、empty、error 四种状态。",
      coverUrl: themeSwatches.selected,
    },
    updatedAt: "2026-03-17",
  },
  {
    id: "db-4",
    fields: {
      title: "README 页面级方案章节",
      status: "done",
      priority: "P3",
      assignee: "DX",
      startDate: "2026-03-14",
      endDate: "2026-03-16",
      summary: "补充接入说明、模式说明和 actions 契约示例，和 dev demo 保持一致。",
      coverUrl: themeSwatches.panel,
    },
    updatedAt: "2026-03-16",
  },
];

const databaseDemoSelectedRecordId = ref(databaseDemoRecords[0]?.id ?? "");

function getDatabaseEntityId(value: unknown) {
  if (value && typeof value === "object") {
    const entity = value as { id?: unknown; sourceRecordId?: unknown };
    if (typeof entity.sourceRecordId === "string" && entity.sourceRecordId) return entity.sourceRecordId;
    if (typeof entity.id === "string" && entity.id) return entity.id;
  }
  return "";
}

const databaseDemoVisibleFields = computed(() =>
  databaseDemoColumns.value.filter((column) => !column.hidden).map((column) => column.key),
);

const databaseDemoCurrentView = computed<ViewConfig>(() => {
  const preset =
    databaseDemoViewPresets.find((view) => view.viewType === databaseDemoViewMode.value) ??
    databaseDemoViewPresets[0];

  return {
    ...preset,
    viewId: preset.viewId,
    viewType: databaseDemoViewMode.value,
    name: preset.name,
    visibleFields: databaseDemoVisibleFields.value,
    sorts:
      databaseDemoSort.value.field && databaseDemoSort.value.order
        ? [
            {
              fieldId: databaseDemoSort.value.field,
              direction: databaseDemoSort.value.order,
            },
          ]
        : preset.sorts,
    groups: databaseDemoGroupField.value ? [{ fieldId: databaseDemoGroupField.value }] : undefined,
  };
});

function pushDatabaseDemoLog(message: string) {
  databaseDemoActionLog.value = [message, ...databaseDemoActionLog.value].slice(0, 6);
}

function getDatabaseRecordText(record: DataRecord, fieldId: string) {
  const value = record.fields[fieldId];
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "";
  return String(value);
}

function getDatabaseEntityLabel(value: unknown) {
  if (value && typeof value === "object") {
    const entity = value as { title?: unknown; id?: unknown; fields?: Record<string, unknown> };
    if (typeof entity.title === "string" && entity.title) return entity.title;
    if (entity.fields && typeof entity.fields.title === "string" && entity.fields.title) {
      return entity.fields.title;
    }
    if (typeof entity.id === "string" && entity.id) return entity.id;
  }
  return "record";
}

function matchesDatabaseFilter(value: unknown, condition: FilterCondition) {
  const text = Array.isArray(value) ? value.join(", ").toLowerCase() : String(value ?? "").toLowerCase();
  const needle = condition.value.trim().toLowerCase();

  switch (condition.operator) {
    case "equals":
      return text === needle;
    case "not_equals":
      return text !== needle;
    case "contains":
      return text.includes(needle);
    case "not_contains":
      return !text.includes(needle);
    case "starts_with":
      return text.startsWith(needle);
    case "ends_with":
      return text.endsWith(needle);
    case "gt":
      return Number(value) > Number(condition.value);
    case "gte":
      return Number(value) >= Number(condition.value);
    case "lt":
      return Number(value) < Number(condition.value);
    case "lte":
      return Number(value) <= Number(condition.value);
    case "is_empty":
      return text === "";
    case "is_not_empty":
      return text !== "";
    default:
      return true;
  }
}

const databaseDemoVisibleRecords = computed(() => {
  const keyword = databaseDemoSearchKeyword.value.trim().toLowerCase();
  const sortField = databaseDemoSort.value.field;
  const sortOrder = databaseDemoSort.value.order;

  const filtered = databaseDemoRecords.filter((record) => {
    const matchesKeyword =
      !keyword ||
      ["title", "status", "priority", "assignee", "summary"].some((fieldId) =>
        getDatabaseRecordText(record, fieldId).toLowerCase().includes(keyword),
      );

    const matchesFilters =
      databaseDemoFilterConditions.value.length === 0
        ? true
        : databaseDemoFilterLogic.value === "and"
          ? databaseDemoFilterConditions.value.every((condition) =>
              matchesDatabaseFilter(record.fields[condition.field], condition),
            )
          : databaseDemoFilterConditions.value.some((condition) =>
              matchesDatabaseFilter(record.fields[condition.field], condition),
            );

    return matchesKeyword && matchesFilters;
  });

  if (!sortField || !sortOrder) return filtered;

  return [...filtered].sort((left, right) => {
    const a = getDatabaseRecordText(left, sortField);
    const b = getDatabaseRecordText(right, sortField);
    const compare = a.localeCompare(b, "zh-Hans-CN");
    return sortOrder === "desc" ? -compare : compare;
  });
});

const databaseDemoSelectedRecord = computed(() => {
  const selectedId = databaseDemoSelectedRecordId.value;
  const recordById =
    databaseDemoRecords.find((record) => record.id === selectedId) ??
    databaseDemoVisibleRecords.value.find((record) => record.id === selectedId);
  return (
    recordById ??
    databaseDemoVisibleRecords.value[0] ??
    databaseDemoRecords[0] ??
    null
  );
});

function databaseRecordToTask(record: DataRecord): Task {
  return {
    id: record.id,
    title: getDatabaseRecordText(record, "title") || record.id,
    description: getDatabaseRecordText(record, "summary"),
    status: getDatabaseRecordText(record, "status") || "todo",
    priority: getDatabaseRecordText(record, "priority") || "P3",
    assignee: getDatabaseRecordText(record, "assignee") || undefined,
    startDate: getDatabaseRecordText(record, "startDate") || undefined,
    endDate: getDatabaseRecordText(record, "endDate") || undefined,
  };
}

const databaseDemoSelectedTask = computed<Task | null>(() =>
  databaseDemoSelectedRecord.value ? databaseRecordToTask(databaseDemoSelectedRecord.value) : null,
);

const databaseDemoSelectedPropItems = computed<PropItem[]>(() => {
  const record = databaseDemoSelectedRecord.value;
  if (!record) return [];

  return [
    { key: "记录 ID", value: record.id },
    {
      key: "状态",
      value: getDatabaseRecordText(record, "status") || "todo",
      valueColor: themeSwatches.accent,
      valueBg: themeSwatches.selected,
    },
    {
      key: "优先级",
      value: getDatabaseRecordText(record, "priority") || "P3",
      valueColor: themeSwatches.textPrimary,
      valueBg: themeSwatches.muted,
    },
    { key: "负责人", value: getDatabaseRecordText(record, "assignee") || "—" },
    { key: "视图模式", value: databaseDemoMode.value },
    { key: "当前视图", value: databaseDemoViewMode.value },
    { key: "最近更新", value: record.updatedAt ?? "—" },
  ];
});

const databaseDemoSelectedComments = computed<CommentData[]>(() => {
  const record = databaseDemoSelectedRecord.value;
  if (!record) return [];

  const title = getDatabaseRecordText(record, "title") || record.id;
  return [
    {
      id: `${record.id}-c1`,
      author: "Page Shell",
      authorInitial: "P",
      avatarColor: themeSwatches.accent,
      action: "selected record",
      content: `当前页面工作区选中的是「${title}」。切换视图或点击其他卡片会同步更新这里。`,
      time: "now",
    },
    {
      id: `${record.id}-c2`,
      author: "Provider",
      authorInitial: "D",
      avatarColor: themeSwatches.textSecondary,
      action: "workspace snapshot",
      content: `local/provider 都会把当前记录交给 detail workspace；真实保存、权限和回滚还要由上层实现。`,
      time: record.updatedAt ?? "—",
    },
  ];
});

const databaseDemoShellSnapshot = computed(() => ({
  mode: databaseDemoMode.value,
  scenario: databaseDemoScenario.value,
  selectedRecordId: databaseDemoSelectedRecordId.value || null,
  currentView: databaseDemoCurrentView.value,
  searchKeyword: databaseDemoSearchKeyword.value,
  filterLogic: databaseDemoFilterLogic.value,
  filters: databaseDemoFilterConditions.value,
  sort: databaseDemoSort.value,
  groupField: databaseDemoGroupField.value || null,
  visibleRecordCount: databaseDemoVisibleRecords.value.length,
  actionLog: databaseDemoActionLog.value,
}));

function handleDatabaseScenarioChange(scenario: DatabaseDemoScenario) {
  databaseDemoScenario.value = scenario;
  pushDatabaseDemoLog(`scenario -> ${scenario}`);
}

function handleDatabaseModeChange(mode: DatabaseDemoMode) {
  databaseDemoMode.value = mode;
  pushDatabaseDemoLog(`mode -> ${mode}`);
}

function handleDatabaseViewChange(view: string) {
  if (["table", "kanban", "gallery", "timeline"].includes(view)) {
    databaseDemoViewMode.value = view as DatabaseDemoViewMode;
  }
  pushDatabaseDemoLog(`view -> ${view}`);
}

function handleDatabaseColumnsUpdate(columns: TableColumn[]) {
  databaseDemoColumns.value = columns;
  pushDatabaseDemoLog(`update:columns -> ${columns.filter((column) => !column.hidden).length} visible`);
}

function handleDatabaseSearchUpdate(keyword: string) {
  databaseDemoSearchKeyword.value = keyword;
  pushDatabaseDemoLog(`update:searchKeyword -> ${keyword || "(empty)"}`);
}

function handleDatabaseAddFilter() {
  const condition: FilterCondition = {
    id: `filter-${Date.now().toString(36)}`,
    field: "status",
    operator: "equals",
    value: "doing",
  };
  databaseDemoFilterConditions.value = [...databaseDemoFilterConditions.value, condition];
  pushDatabaseDemoLog(`add-filter -> ${condition.field} ${condition.operator} ${condition.value}`);
}

function handleDatabaseRemoveFilter(id: string) {
  databaseDemoFilterConditions.value = databaseDemoFilterConditions.value.filter(
    (condition) => condition.id !== id,
  );
  pushDatabaseDemoLog(`remove-filter -> ${id}`);
}

function handleDatabaseUpdateFilter(id: string, update: Partial<FilterCondition>) {
  databaseDemoFilterConditions.value = databaseDemoFilterConditions.value.map((condition) =>
    condition.id === id ? { ...condition, ...update } : condition,
  );
  pushDatabaseDemoLog(`update-filter -> ${id}`);
}

function handleDatabaseClearFilters() {
  databaseDemoFilterConditions.value = [];
  pushDatabaseDemoLog("clear-filters");
}

function handleDatabaseFilterLogicUpdate(logic: FilterLogic) {
  databaseDemoFilterLogic.value = logic;
  pushDatabaseDemoLog(`update:filterLogic -> ${logic}`);
}

function handleDatabaseSort(field: string) {
  const nextOrder =
    databaseDemoSort.value.field === field && databaseDemoSort.value.order === "asc"
      ? "desc"
      : "asc";
  databaseDemoSort.value = { field, order: nextOrder };
  pushDatabaseDemoLog(`sort -> ${field}:${nextOrder}`);
}

function handleDatabaseGroup(field: string | null) {
  databaseDemoGroupField.value = field ?? "";
  pushDatabaseDemoLog(`group -> ${field ?? "none"}`);
}

function selectDatabaseRecord(recordId: string, source?: string) {
  if (!recordId) return;
  databaseDemoSelectedRecordId.value = recordId;
  pushDatabaseDemoLog(`selected-record -> ${recordId}${source ? ` (${source})` : ""}`);
}

function handleDatabaseSaveView(name: string) {
  pushDatabaseDemoLog(`save-view -> ${name}`);
}

function handleDatabaseLoadView(viewId: string) {
  if (["table", "kanban", "gallery", "timeline"].includes(viewId)) {
    databaseDemoViewMode.value = viewId as DatabaseDemoViewMode;
  }
  pushDatabaseDemoLog(`load-view -> ${viewId}`);
}

function handleDatabaseRetry() {
  databaseDemoScenario.value = "normal";
  pushDatabaseDemoLog("retry -> normal");
}

function restoreDatabaseDemo() {
  databaseDemoScenario.value = "normal";
  databaseDemoViewMode.value = "table";
  databaseDemoMode.value = "provider";
  databaseDemoSelectedRecordId.value = databaseDemoRecords[0]?.id ?? "";
  databaseDemoSearchKeyword.value = "";
  databaseDemoFilterConditions.value = [];
  databaseDemoFilterLogic.value = "and";
  databaseDemoGroupField.value = "";
  databaseDemoSort.value = { field: "startDate", order: "asc" };
  databaseDemoColumns.value = databaseDemoDefaultColumns.map((column) => ({ ...column }));
  pushDatabaseDemoLog("restore -> default shell state");
}

</script>

<template>
  <section class="database-view-demo">
    <div class="database-view-demo__card">
      <h2>DatabaseView 页面级方案证明</h2>
      <p class="dev-desc">
        这一段现在不再只是“未来接入形态”说明，而是用真实的 DatabaseView contract 去证明页面级工作区。
        local 模式直接使用 schema + records，provider 模式保留数据拉取与刷新入口；actions 只负责
        回传页面变更，不把业务逻辑锁死在组件内部。当前已经对齐的页面契约包括
        detailPresentation 与 density：桌面端默认右侧 workspace，移动端保留 sheet fallback；
        页面密度统一在 compact / standard / comfortable 三档里表达，行级操作也会沿着
        inline edit -> row action -> detail workspace 这条梯子继续升级。
      </p>

      <pre class="database-shell__code"><code>import { DatabaseView, useDatabaseView } from "@oneflowui/ui"

const view = useDatabaseView({
  mode: "provider",
  schemaSource: "remote-or-local-schema",
  dataSource: "records-provider",
  // page contract preview:
  // detailPresentation: "side-panel",
  // density: "standard",
  actions: {
    onFetch,
    onRefresh,
    onUpdateRecord,
    onCreateRecord,
    onDeleteRecord,
    onSaveView,
    onSchemaChange,
  },
})

            // dev app 现在保留显式 shell 控制条与观测面板，
            // 底层页面契约已经和 DatabaseView/useDatabaseView 对齐。</code></pre>

      <DatabaseEnterpriseDemo
        :schema="databaseDemoSchema"
        :records="databaseDemoRecords"
        :views="databaseDemoViewPresets"
      />

      <DatabasePresetDemo />

      <div class="database-shell">
        <div class="database-shell__bar">
          <div class="dev-row" style="gap: 8px">
            <span class="database-shell__label">source mode</span>
            <button
              class="dev-btn"
              :class="{ 'dev-btn--info': databaseDemoMode === 'local' }"
              style="padding: 6px 12px; font-size: 12px"
              @click="handleDatabaseModeChange('local')"
            >
              local
            </button>
            <button
              class="dev-btn"
              :class="{ 'dev-btn--info': databaseDemoMode === 'provider' }"
              style="padding: 6px 12px; font-size: 12px"
              @click="handleDatabaseModeChange('provider')"
            >
              provider
            </button>
          </div>

          <div class="dev-row" style="gap: 8px">
            <span class="database-shell__label">page state</span>
            <button
              class="dev-btn"
              :class="{ 'dev-btn--success': databaseDemoScenario === 'normal' }"
              style="padding: 6px 12px; font-size: 12px"
              @click="handleDatabaseScenarioChange('normal')"
            >
              normal
            </button>
            <button
              class="dev-btn"
              :class="{ 'dev-btn--warning': databaseDemoScenario === 'loading' }"
              style="padding: 6px 12px; font-size: 12px"
              @click="handleDatabaseScenarioChange('loading')"
            >
              loading
            </button>
            <button
              class="dev-btn"
              :class="{ 'dev-btn--success': databaseDemoScenario === 'empty' }"
              style="padding: 6px 12px; font-size: 12px"
              @click="handleDatabaseScenarioChange('empty')"
            >
              empty
            </button>
            <button
              class="dev-btn"
              :class="{ 'dev-btn--error': databaseDemoScenario === 'error' }"
              style="padding: 6px 12px; font-size: 12px"
              @click="handleDatabaseScenarioChange('error')"
            >
              error
            </button>
          </div>

          <div class="dev-row" style="gap: 8px">
            <span class="database-shell__label">current view</span>
            <button
              class="dev-btn"
              :class="{ 'dev-btn--info': databaseDemoViewMode === 'table' }"
              style="padding: 6px 12px; font-size: 12px"
              @click="handleDatabaseViewChange('table')"
            >
              table
            </button>
            <button
              class="dev-btn"
              :class="{ 'dev-btn--info': databaseDemoViewMode === 'kanban' }"
              style="padding: 6px 12px; font-size: 12px"
              @click="handleDatabaseViewChange('kanban')"
            >
              kanban
            </button>
            <button
              class="dev-btn"
              :class="{ 'dev-btn--info': databaseDemoViewMode === 'gallery' }"
              style="padding: 6px 12px; font-size: 12px"
              @click="handleDatabaseViewChange('gallery')"
            >
              gallery
            </button>
            <button
              class="dev-btn"
              :class="{ 'dev-btn--info': databaseDemoViewMode === 'timeline' }"
              style="padding: 6px 12px; font-size: 12px"
              @click="handleDatabaseViewChange('timeline')"
            >
              timeline
            </button>
            <button
              class="dev-btn"
              style="padding: 6px 12px; font-size: 12px; background: var(--of-color-gray-500)"
              @click="restoreDatabaseDemo"
            >
              restore default
            </button>
          </div>
        </div>

        <div class="database-shell__toolbar">
          <TableToolbar
            :columns="databaseDemoColumns"
            :current-view="databaseDemoViewMode"
            :view-tabs="databaseDemoViewTabs"
            :filter-conditions="databaseDemoFilterConditions"
            :filter-logic="databaseDemoFilterLogic"
            :filter-active="databaseDemoFilterConditions.length > 0"
            :current-sort="databaseDemoSort"
            :current-group="databaseDemoGroupField || undefined"
            :search-keyword="databaseDemoSearchKeyword"
            :show-view-switch="true"
            :show-filter="true"
            :show-sort="true"
            :show-group="true"
            :show-columns="true"
            :show-search="true"
            :saved-views="databaseDemoSavedViews"
            @update:currentView="handleDatabaseViewChange"
            @update:columns="handleDatabaseColumnsUpdate"
            @update:searchKeyword="handleDatabaseSearchUpdate"
            @add-filter="handleDatabaseAddFilter"
            @remove-filter="handleDatabaseRemoveFilter"
            @update-filter="handleDatabaseUpdateFilter"
            @clear-filters="handleDatabaseClearFilters"
            @update:filterLogic="handleDatabaseFilterLogicUpdate"
            @sort="handleDatabaseSort"
            @group="handleDatabaseGroup"
            @save-view="handleDatabaseSaveView"
            @load-view="handleDatabaseLoadView"
          />
        </div>

        <div class="database-shell__grid">
          <div class="database-shell__main">
            <div v-if="databaseDemoScenario === 'loading'" class="database-shell__state">
              <div class="database-shell__spinner" />
              <div>
                <div class="database-shell__state-title">页面级视图加载中</div>
                <div class="database-shell__state-desc">
                  provider 模式下可在这里挂载真实 fetch / refresh 过程。
                </div>
              </div>
            </div>

            <div v-else-if="databaseDemoScenario === 'error'" class="database-shell__state database-shell__state--error">
              <div class="database-shell__state-title">页面级视图出错</div>
              <div class="database-shell__state-desc">
                这里代表 provider 拉取失败、schema 未就绪或 actions 回调抛错后的统一错误面。
              </div>
              <button class="dev-btn dev-btn--error" @click="handleDatabaseRetry">retry</button>
            </div>

            <EmptyState
              v-else-if="databaseDemoScenario === 'empty'"
              icon="inbox"
              title="暂无记录"
              description="这是页面级方案需要透传的空态，建议由外层 shell 统一处理。"
              :action="{ label: '恢复演示数据', onClick: restoreDatabaseDemo }"
            />

            <template v-else>
              <div class="database-shell__view-meta">
                <span class="database-shell__badge">mode: {{ databaseDemoMode }}</span>
                <span class="database-shell__badge">view: {{ databaseDemoViewMode }}</span>
                <span class="database-shell__badge">
                  visible fields: {{ databaseDemoVisibleFields.length }}
                </span>
                <span class="database-shell__badge">
                  records: {{ databaseDemoVisibleRecords.length }}
                </span>
              </div>

              <DataTable
                v-if="databaseDemoViewMode === 'table'"
                :records="databaseDemoVisibleRecords"
                :schema="databaseDemoSchema"
                :view="databaseDemoCurrentView"
                :columns="databaseDemoColumns"
                :group-by="databaseDemoGroupField || undefined"
                @row-click="
                  (row) => {
                    const id = getDatabaseEntityId(row);
                    if (id) selectDatabaseRecord(id, 'table');
                    pushDatabaseDemoLog(`row-click -> ${getDatabaseEntityLabel(row)}`);
                  }
                "
              />
              <KanbanBoard
                v-else-if="databaseDemoViewMode === 'kanban'"
                :records="databaseDemoVisibleRecords"
                :schema="databaseDemoSchema"
                :view="databaseDemoCurrentView"
                @card-click="
                  (task) => {
                    const id = getDatabaseEntityId(task);
                    if (id) selectDatabaseRecord(id, 'kanban');
                    pushDatabaseDemoLog(`card-click -> ${getDatabaseEntityLabel(task)}`);
                  }
                "
              />
              <GalleryView
                v-else-if="databaseDemoViewMode === 'gallery'"
                :records="databaseDemoVisibleRecords"
                :schema="databaseDemoSchema"
                :view="databaseDemoCurrentView"
                :columns="2"
                :addable="false"
                @card-click="
                  (item) => {
                    const id = getDatabaseEntityId(item);
                    if (id) selectDatabaseRecord(id, 'gallery');
                    pushDatabaseDemoLog(`card-click -> ${getDatabaseEntityLabel(item)}`);
                  }
                "
              />
              <div v-else style="overflow-x: auto">
                <GanttTimeline
                  :records="databaseDemoVisibleRecords"
                  :schema="databaseDemoSchema"
                  :view-config="databaseDemoCurrentView"
                  :days="18"
                  @row-click="
                    (item) => {
                      const id = getDatabaseEntityId(item);
                      if (id) selectDatabaseRecord(id, 'timeline');
                      pushDatabaseDemoLog(`row-click -> ${getDatabaseEntityLabel(item)}`);
                    }
                  "
                />
              </div>
            </template>
          </div>

          <aside class="database-shell__aside">
            <div class="database-shell__aside-card">
              <div class="database-shell__aside-title">Actions Contract</div>
              <ul class="database-shell__list">
                <li>local: schema + records + viewConfig 直接驱动页面。</li>
                <li>provider: 保留 fetch / refresh / mutation 回调入口。</li>
                <li>actions: update / create / delete / save / schema 变更只回传结果。</li>
                <li>toolbar: currentView / columns / filters / sort / group 统一交给 shell。</li>
              </ul>
            </div>

            <div class="database-shell__aside-card">
              <div class="database-shell__aside-title">Now supported</div>
              <div class="database-shell__card-list">
                <div
                  v-for="item in databaseDemoSupportedCapabilities"
                  :key="item.title"
                  class="database-shell__card-item"
                >
                  <div class="database-shell__card-item-title">{{ item.title }}</div>
                  <div class="database-shell__card-item-desc">{{ item.description }}</div>
                </div>
              </div>
            </div>

            <div class="database-shell__aside-card">
              <div class="database-shell__aside-title">Pending</div>
              <div class="database-shell__card-list">
                <div
                  v-for="item in databaseDemoPendingCapabilities"
                  :key="item.title"
                  class="database-shell__card-item"
                >
                  <div class="database-shell__card-item-title">{{ item.title }}</div>
                  <div class="database-shell__card-item-desc">{{ item.description }}</div>
                </div>
              </div>
            </div>

            <div class="database-shell__aside-card">
              <div class="database-shell__aside-title">Recent actions</div>
              <div class="database-shell__log">
                <div
                  v-for="(item, index) in databaseDemoActionLog"
                  :key="`${index}-${item}`"
                  class="database-shell__log-item"
                >
                  {{ item }}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div class="database-shell__workspace">
          <div class="database-shell__workspace-head">
            <div>
              <div class="database-shell__aside-title">Selected record / detail workspace</div>
              <div class="database-shell__workspace-desc">
                这里证明页面级方案可以把当前选中记录和右侧工作区连起来，并为 detailPresentation
                和 density 这类页面契约预留统一承接位置。
              </div>
            </div>
            <div class="database-shell__workspace-meta">
              <span class="database-shell__badge">
                selected: {{ databaseDemoSelectedRecordId || "none" }}
              </span>
              <span class="database-shell__badge">detail: side-panel</span>
              <span class="database-shell__badge">density: standard</span>
              <span class="database-shell__badge">
                task title: {{ databaseDemoSelectedTask?.title || "—" }}
              </span>
            </div>
          </div>

          <div v-if="databaseDemoSelectedTask" class="database-shell__workspace-body">
            <DetailLayout
              :task="databaseDemoSelectedTask"
              :prop-items="databaseDemoSelectedPropItems"
              :comments="databaseDemoSelectedComments"
            />
          </div>
          <EmptyState
            v-else
            icon="inbox"
            title="未选中记录"
            description="点击任一记录后，detail workspace 会切换到对应任务。"
          />
        </div>

        <pre class="dev-json-preview">{{ JSON.stringify(databaseDemoShellSnapshot, null, 2) }}</pre>
      </div>
    </div>
  </section>
</template>

<style scoped>
.database-view-demo {
  margin: 24px 0 32px;
}

.database-view-demo__card {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-4);
}

.database-shell {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-4);
}

.database-shell__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--of-spacing-3);
  padding: var(--of-spacing-4);
  border: var(--of-shell-database-panel-border);
  border-radius: var(--of-shell-database-panel-radius);
  background: var(--of-shell-database-bar-bg);
}

.database-shell__label {
  font-size: var(--of-shell-database-label-size);
  font-weight: var(--of-shell-database-label-weight);
  letter-spacing: var(--of-shell-database-label-tracking);
  text-transform: uppercase;
  color: var(--of-color-text-tertiary);
}

.database-shell__toolbar {
  overflow-x: auto;
}

.database-shell__code {
  margin: var(--of-spacing-3) 0 0;
  padding: var(--of-spacing-3) var(--of-spacing-4);
  border: var(--of-shell-database-panel-border);
  border-radius: var(--of-shell-database-panel-radius);
  background: var(--of-color-bg-code);
  color: var(--of-shell-database-code-color, var(--of-shell-command-shortcut-color));
  font-size: var(--of-shell-database-code-size);
  line-height: var(--of-shell-database-code-line-height);
  overflow-x: auto;
  white-space: pre;
}

.database-shell__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: var(--of-spacing-4);
  align-items: start;
}

.database-shell__main {
  min-width: 0;
  min-height: var(--of-shell-database-main-min-height);
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-3);
  padding: var(--of-spacing-4);
  border: var(--of-shell-database-panel-border);
  border-radius: var(--of-shell-database-main-radius);
  background: var(--of-shell-database-main-bg);
}

.database-shell__aside {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-4);
}

.database-shell__workspace {
  margin-top: var(--of-spacing-4);
  padding: var(--of-spacing-4);
  border: var(--of-shell-database-panel-border);
  border-radius: var(--of-shell-database-panel-radius);
  background: var(--of-shell-database-panel-bg);
}

.database-shell__workspace-head {
  display: flex;
  justify-content: space-between;
  gap: var(--of-shell-panel-gap);
  align-items: flex-start;
  flex-wrap: wrap;
  margin-bottom: var(--of-spacing-3);
}

.database-shell__workspace-desc {
  margin-top: var(--of-spacing-1);
  font-size: var(--of-shell-database-label-size);
  color: var(--of-color-text-secondary);
}

.database-shell__workspace-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--of-spacing-2);
}

.database-shell__workspace-body {
  overflow-x: auto;
}

.database-shell__aside-card {
  padding: var(--of-spacing-4);
  border: var(--of-shell-database-panel-border);
  border-radius: var(--of-shell-database-panel-radius);
  background: var(--of-shell-database-panel-bg);
}

.database-shell__aside-title {
  margin-bottom: var(--of-spacing-3);
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-color-text-primary);
}

.database-shell__list {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-1);
  margin: 0;
  padding-left: var(--of-spacing-4);
  color: var(--of-color-text-secondary);
  font-size: var(--of-font-size-sm);
  line-height: 1.6;
}

.database-shell__log {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-2);
}

.database-shell__card-list {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-3);
}

.database-shell__card-item {
  padding: var(--of-spacing-2) var(--of-spacing-3);
  border: var(--of-shell-database-panel-border);
  border-radius: var(--of-shell-database-main-radius);
  background: var(--of-shell-database-card-bg);
}

.database-shell__card-item-title {
  font-size: var(--of-font-size-xs);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-color-text-primary);
}

.database-shell__card-item-desc {
  margin-top: var(--of-spacing-1);
  font-size: var(--of-font-size-xs);
  line-height: 1.5;
  color: var(--of-color-text-secondary);
}

.database-shell__log-item {
  padding: var(--of-spacing-2) var(--of-spacing-3);
  border: var(--of-shell-database-panel-border);
  border-radius: var(--of-shell-database-main-radius);
  background: var(--of-shell-database-card-bg);
  color: var(--of-color-text-secondary);
  font-size: var(--of-font-size-xs);
  line-height: 1.5;
}

.database-shell__view-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--of-spacing-2);
}

.database-shell__badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: var(--of-radius-full);
  background: var(--of-shell-database-badge-bg);
  color: var(--of-accent-default);
  font-size: var(--of-font-size-xs);
  font-weight: var(--of-font-weight-semibold);
}

.database-shell__state {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-3);
  min-height: 160px;
  padding: var(--of-spacing-5);
  border: var(--of-shell-database-state-border);
  border-radius: var(--of-shell-database-main-radius);
  background: var(--of-color-bg-hover);
}

.database-shell__state--error {
  flex-direction: column;
  align-items: flex-start;
  border-color: var(--of-color-red-200);
  background: var(--of-color-red-50);
}

.database-shell__spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--of-accent-soft);
  border-top-color: var(--of-accent-default);
  border-radius: 50%;
  animation: database-shell-spin 1s linear infinite;
}

.database-shell__state-title {
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-color-text-primary);
}

.database-shell__state-desc {
  margin-top: var(--of-spacing-1);
  color: var(--of-color-text-secondary);
  font-size: var(--of-font-size-xs);
  line-height: 1.6;
}

@keyframes database-shell-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 960px) {
  .database-shell__grid {
    grid-template-columns: 1fr;
  }
}
</style>
