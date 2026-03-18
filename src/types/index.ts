// ─── Layout Density ─────────────────────────────────────────────────────────

export type Density = "comfortable" | "compact";

// ─── Common Types ───────────────────────────────────────────────────────────

// Priority 和 TaskStatus 是开放字符串，不限定固定枚举值
// 实际业务中可以是 'P0'|'P1' 也可以是 'urgent'|'high'|'low' 等任意值
export type Priority = string;
export type TaskStatus = string;
export type ViewType = "table" | "kanban" | "gallery" | "timeline" | "detail";

// ─── Badge / Color Map ───────────────────────────────────────────────────────

/**
 * 单条徽章的样式配置
 * - text: 文字颜色
 * - bg:   背景色
 * - label: 显示文字（不传则直接显示原始值）
 * - dot:  左侧圆点颜色（不传则不显示圆点）
 */
export interface BadgeConfig {
  text: string;
  bg: string;
  label?: string;
  dot?: string;
}

/**
 * 颜色映射表 —— key 为字段的原始值（如 'P0'、'in_progress'、'urgent'）
 * 组件内置默认映射，外部传入时会深度合并（外部优先）
 */
export type ColorMap = Record<string, BadgeConfig>;

// ─── Task ────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description?: string;
  /** 状态值，具体枚举由业务方决定，通过 statusColorMap 配置显示 */
  status: TaskStatus;
  /** 优先级值，具体枚举由业务方决定，通过 priorityColorMap 配置显示 */
  priority: Priority;
  role?: string;
  assignee?: string;
  createdAt?: string;
  updatedAt?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

// ─── ViewTab ─────────────────────────────────────────────────────────────────

export interface ViewTabItem {
  key: ViewType;
  label: string;
  icon: string;
}

// ─── Table ───────────────────────────────────────────────────────────────────

export interface TableColumn {
  key: string;
  label: string;
  width?: number | "fill";
  minWidth?: number;
  align?: "left" | "center" | "right";
  /** 列数据类型，用于筛选面板选择对应的操作符 */
  type?: "string" | "number" | "date" | "status" | "priority";
  /** 是否隐藏该列（列管理器控制） */
  hidden?: boolean;
}

/**
 * DataTable 组件的 Props 类型定义（与 DataTable.vue 中 defineProps 保持同步）
 */
export interface DataTableProps {
  tasks?: Task[];
  records?: DataRecord[];
  schema?: TableSchema;
  view?: ViewConfig;
  columns?: TableColumn[];
  rowKey?: string;
  selectable?: boolean;
  addable?: boolean;
  priorityColorMap?: ColorMap;
  statusColorMap?: ColorMap;
  groupBy?: string;
  groupColorMap?: ColorMap;
  /** 手动强制开关虚拟滚动；undefined 表示自动判断 */
  virtual?: boolean;
  /**
   * 自动启用虚拟滚动的行数阈值（默认 100）。
   * 仅在 `virtual` prop 未传时生效。
   */
  virtualThreshold?: number;
}

// ─── Kanban ──────────────────────────────────────────────────────────────────

export interface KanbanColumnData {
  id: string;
  title: string;
  color?: string;
  tasks: Task[];
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

export interface GalleryItem extends Task {
  bannerColor?: string;
  cover?: string;
  extraProps?: { key: string; value: string; icon?: string }[];
}

// ─── Timeline / Gantt ────────────────────────────────────────────────────────

export interface GanttItem extends Task {
  startDate: string;
  endDate: string;
  barColor?: string;
}

// ─── Properties ──────────────────────────────────────────────────────────────

export interface PropItem {
  key: string;
  value: string;
  valueColor?: string;
  valueBg?: string;
  dotColor?: string;
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface CommentData {
  id: string;
  author: string;
  authorInitial: string;
  avatarColor?: string;
  action?: string;
  content: string;
  time: string;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
  badge?: string | number;
  children?: SidebarItem[];
}

// ─── 字段系统（新三层模型）────────────────────────────────────────────────────

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "datetime"
  | "checkbox"
  | "url"
  | "email"
  | "phone"
  | "rating"
  | "user"
  | "attachment"
  | "relation"
  | "formula"
  | "currency"
  | "richtext"
  | "auto_number"
  | "creator"
  | "progress";

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

export interface FieldDefBase {
  id: string;
  name: string;
  required?: boolean;
  hidden?: boolean;
  width?: number;
}

export interface TextFieldDef extends FieldDefBase {
  type: "text";
}

export interface NumberFieldDef extends FieldDefBase {
  type: "number";
  min?: number;
  max?: number;
}

export interface SelectFieldDef extends FieldDefBase {
  type: "select" | "multi_select";
  options: SelectOption[];
}

export interface DateFieldDef extends FieldDefBase {
  type: "date" | "datetime";
}

export interface CheckboxFieldDef extends FieldDefBase {
  type: "checkbox";
}

export interface ContactFieldDef extends FieldDefBase {
  type: "url" | "email" | "phone";
}

export interface RatingFieldDef extends FieldDefBase {
  type: "rating";
  max?: number;
}

export interface UserFieldDef extends FieldDefBase {
  type: "user";
}

export interface AttachmentFieldDef extends FieldDefBase {
  type: "attachment";
}

export interface RelationFieldDef extends FieldDefBase {
  type: "relation";
  targetTableId?: string;
  /** Field ID to display from the target table (e.g. "title") */
  displayFieldId?: string;
  /** Filter conditions applied when selecting related records */
  filterConfig?: FilterCondition[];
  /** Relation cardinality */
  relationMode?: "one_to_many" | "many_to_many";
  /** Schema of the target table for inline rendering */
  targetSchema?: TableSchema;
}

export interface FormulaFieldDef extends FieldDefBase {
  type: "formula";
  formula: string;
  /** Type of the computed result */
  resultType?: "string" | "number" | "date" | "boolean";
  /** Field IDs this formula depends on (for recalculation) */
  dependencies?: string[];
}

export interface CurrencyFieldDef extends FieldDefBase {
  type: "currency";
  /** ISO 4217 currency code, e.g. 'USD', 'CNY' */
  currencyCode?: string;
  /** Decimal precision, default 2 */
  precision?: number;
}

export interface RichTextFieldDef extends FieldDefBase {
  type: "richtext";
}

export interface AutoNumberFieldDef extends FieldDefBase {
  type: "auto_number";
  /** Prefix for the auto number, e.g. 'TASK-' */
  prefix?: string;
}

export interface CreatorFieldDef extends FieldDefBase {
  type: "creator";
}

export interface ProgressFieldDef extends FieldDefBase {
  type: "progress";
  min?: number;
  max?: number;
}

export type FieldDef =
  | TextFieldDef
  | NumberFieldDef
  | SelectFieldDef
  | DateFieldDef
  | CheckboxFieldDef
  | ContactFieldDef
  | RatingFieldDef
  | UserFieldDef
  | AttachmentFieldDef
  | RelationFieldDef
  | FormulaFieldDef
  | CurrencyFieldDef
  | RichTextFieldDef
  | AutoNumberFieldDef
  | CreatorFieldDef
  | ProgressFieldDef;

export function isSelectField(field: FieldDef): field is SelectFieldDef {
  return field.type === "select" || field.type === "multi_select";
}

export function isFormulaField(field: FieldDef): field is FormulaFieldDef {
  return field.type === "formula";
}

// ─── 数据行 ───────────────────────────────────────────────────────────────────

export type CellValue = string | number | boolean | string[] | null;

// ─── Active Cell (Keyboard Navigation) ──────────────────────────────────────

export interface ActiveCell {
  rowId: string;
  colKey: string;
}

// ─── Aggregation ────────────────────────────────────────────────────────────

export type AggregationFn = "sum" | "avg" | "count" | "min" | "max";

export interface AggregationConfig {
  fieldId: string;
  fn: AggregationFn;
}

// ─── Draft Row State ────────────────────────────────────────────────────────

export interface DraftRowState {
  draftId: string;
  fields: Record<string, CellValue>;
  dirtyFields: Set<string>;
  validationErrors: Map<string, string>;
  groupFieldValue?: CellValue;
}

export interface DataRecord {
  id: string;
  fields: Record<string, CellValue>;
  createdAt?: string;
  updatedAt?: string;
}

// ─── 视图配置 ─────────────────────────────────────────────────────────────────

export interface SortConfig {
  fieldId: string;
  direction: "asc" | "desc";
}

export interface GroupConfig {
  fieldId: string;
}

export interface FilterCondition {
  fieldId: string;
  operator: "eq" | "neq" | "contains" | "gt" | "lt" | "is_empty" | "is_not_empty";
  value?: CellValue;
}

export interface ViewConfig {
  viewId: string;
  viewType: ViewType;
  name: string;
  visibleFields: string[];
  sorts?: SortConfig[];
  groups?: GroupConfig[];
  filters?: FilterCondition[];
  kanbanFieldId?: string;
  galleryCoverFieldId?: string;
  galleryCardFields?: string[];
  /** Aggregation configs shown in group headers/footers */
  aggregations?: AggregationConfig[];
  /** Column keys to pin on the left side */
  fixedColumns?: string[];
}

// ─── 表结构 ───────────────────────────────────────────────────────────────────

export interface TableSchema {
  tableId: string;
  name: string;
  fields: FieldDef[];
  views: ViewConfig[];
}

// ─── 向后兼容 Adapter ─────────────────────────────────────────────────────────

export function taskToDataRecord(task: Task): DataRecord {
  return {
    id: task.id,
    fields: {
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      assignee: task.assignee ?? "",
      startDate: task.startDate ?? "",
      endDate: task.endDate ?? "",
      tags: task.tags ?? [],
    },
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export function dataRecordToTask(record: DataRecord): Task {
  const status = record.fields.status;
  const priority = record.fields.priority;
  const title = record.fields.title;
  const description = record.fields.description;
  const assignee = record.fields.assignee;
  const tags = record.fields.tags;
  const startDate = record.fields.startDate;
  const endDate = record.fields.endDate;
  return {
    id: record.id,
    title: typeof title === "string" && title ? title : record.id,
    description: typeof description === "string" ? description : undefined,
    status: typeof status === "string" && status ? status : "todo",
    priority: typeof priority === "string" && priority ? priority : "P3",
    assignee: typeof assignee === "string" ? assignee : undefined,
    tags: Array.isArray(tags) ? tags.filter((t): t is string => typeof t === "string") : undefined,
    startDate: typeof startDate === "string" ? startDate : undefined,
    endDate: typeof endDate === "string" ? endDate : undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function buildKanbanColumns(
  records: DataRecord[],
  options: {
    kanbanFieldId?: string;
    laneOrder?: string[];
    laneTitles?: Record<string, string>;
  } = {},
): KanbanColumnData[] {
  const kanbanFieldId = options.kanbanFieldId ?? "status";
  const groups = new Map<string, Task[]>();
  for (const record of records) {
    const raw = record.fields[kanbanFieldId];
    const lane = typeof raw === "string" && raw ? raw : "unassigned";
    const list = groups.get(lane) ?? [];
    list.push(dataRecordToTask(record));
    groups.set(lane, list);
  }
  const laneKeys =
    options.laneOrder && options.laneOrder.length > 0
      ? options.laneOrder
      : Array.from(groups.keys());
  return laneKeys.map((key) => ({
    id: key,
    title: options.laneTitles?.[key] ?? key,
    tasks: groups.get(key) ?? [],
  }));
}

export function buildGalleryItems(
  records: DataRecord[],
  options: {
    coverFieldId?: string;
    cardFieldIds?: string[];
  } = {},
): GalleryItem[] {
  const coverFieldId = options.coverFieldId;
  const cardFieldIds = options.cardFieldIds ?? [];
  return records.map((record) => {
    const task = dataRecordToTask(record);
    const rawCover = coverFieldId ? record.fields[coverFieldId] : null;
    const cover = typeof rawCover === "string" && rawCover ? rawCover : undefined;
    const extraProps = cardFieldIds
      .map((fieldId) => {
        const value = record.fields[fieldId];
        if (value == null || fieldId === coverFieldId) return null;
        if (Array.isArray(value)) return { key: fieldId, value: value.join(", ") };
        return { key: fieldId, value: String(value) };
      })
      .filter((item): item is { key: string; value: string } => item !== null);
    return {
      ...task,
      cover,
      bannerColor: cover?.startsWith("#") ? cover : undefined,
      extraProps: extraProps.length > 0 ? extraProps : undefined,
    };
  });
}

export function buildGanttItems(
  records: DataRecord[],
  options: {
    startFieldId?: string;
    endFieldId?: string;
    labelFieldId?: string;
    barColorFieldId?: string;
  } = {},
): GanttItem[] {
  const startFid = options.startFieldId ?? "startDate";
  const endFid = options.endFieldId ?? "endDate";
  const labelFid = options.labelFieldId ?? "title";

  const result: GanttItem[] = [];
  for (const record of records) {
    const task = dataRecordToTask(record);
    const startDate = record.fields[startFid];
    const endDate = record.fields[endFid];

    // 跳过没有日期的记录
    if (!startDate || !endDate) continue;

    const label = record.fields[labelFid];

    result.push({
      ...task,
      title: typeof label === "string" && label ? label : task.title,
      startDate: String(startDate),
      endDate: String(endDate),
      barColor: options.barColorFieldId
        ? String(record.fields[options.barColorFieldId] ?? "")
        : undefined,
    });
  }
  return result;
}

export const DEFAULT_TABLE_SCHEMA: TableSchema = {
  tableId: "default",
  name: "任务表",
  fields: [
    { id: "title", name: "标题", type: "text", required: true },
    {
      id: "status",
      name: "状态",
      type: "select",
      options: [
        { value: "todo", label: "待办", color: "#94a3b8" },
        { value: "in_progress", label: "进行中", color: "#6366f1" },
        { value: "done", label: "完成", color: "#22c55e" },
      ],
    },
    {
      id: "priority",
      name: "优先级",
      type: "select",
      options: [
        { value: "P0", label: "P0", color: "#ef4444" },
        { value: "P1", label: "P1", color: "#f97316" },
        { value: "P2", label: "P2", color: "#94a3b8" },
      ],
    },
    { id: "assignee", name: "负责人", type: "user" },
    { id: "startDate", name: "开始日期", type: "date" },
    { id: "endDate", name: "截止日期", type: "date" },
    { id: "description", name: "描述", type: "text" },
    { id: "tags", name: "标签", type: "multi_select", options: [] },
  ],
  views: [],
};
