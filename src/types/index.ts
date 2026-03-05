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
  align?: "left" | "center" | "right";
  /** 列数据类型，用于筛选面板选择对应的操作符 */
  type?: "string" | "number" | "date" | "status" | "priority";
  /** 是否隐藏该列（列管理器控制） */
  hidden?: boolean;
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
  | 'text' | 'number' | 'select' | 'multi_select'
  | 'date' | 'datetime' | 'checkbox' | 'url'
  | 'email' | 'phone' | 'rating' | 'user'
  | 'attachment' | 'relation' | 'formula'

export interface SelectOption {
  value: string
  label: string
  color?: string
}

export interface FieldDef {
  id: string
  name: string
  type: FieldType
  required?: boolean
  hidden?: boolean
  width?: number
  options?: SelectOption[]
  formula?: string
}

// ─── 数据行 ───────────────────────────────────────────────────────────────────

export type CellValue = string | number | boolean | string[] | null

export interface DataRecord {
  id: string
  fields: Record<string, CellValue>
  createdAt?: string
  updatedAt?: string
}

// ─── 视图配置 ─────────────────────────────────────────────────────────────────

export interface SortConfig {
  fieldId: string
  direction: 'asc' | 'desc'
}

export interface GroupConfig {
  fieldId: string
}

export interface FilterCondition {
  fieldId: string
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt' | 'is_empty' | 'is_not_empty'
  value?: CellValue
}

export interface ViewConfig {
  viewId: string
  viewType: ViewType
  name: string
  visibleFields: string[]
  sorts?: SortConfig[]
  groups?: GroupConfig[]
  filters?: FilterCondition[]
  kanbanFieldId?: string
  galleryCoverFieldId?: string
  galleryCardFields?: string[]
}

// ─── 表结构 ───────────────────────────────────────────────────────────────────

export interface TableSchema {
  tableId: string
  name: string
  fields: FieldDef[]
  views: ViewConfig[]
}

// ─── 向后兼容 Adapter ─────────────────────────────────────────────────────────

export function taskToDataRecord(task: Task): DataRecord {
  return {
    id: task.id,
    fields: {
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      assignee: task.assignee ?? '',
      startDate: task.startDate ?? '',
      endDate: task.endDate ?? '',
      tags: task.tags ?? []
    },
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  }
}

export function dataRecordToTask(record: DataRecord): Task {
  const status = record.fields.status
  const priority = record.fields.priority
  const title = record.fields.title
  const description = record.fields.description
  const assignee = record.fields.assignee
  const tags = record.fields.tags
  const startDate = record.fields.startDate
  const endDate = record.fields.endDate
  return {
    id: record.id,
    title: typeof title === 'string' && title ? title : record.id,
    description: typeof description === 'string' ? description : undefined,
    status: typeof status === 'string' && status ? status : 'todo',
    priority: typeof priority === 'string' && priority ? priority : 'P3',
    assignee: typeof assignee === 'string' ? assignee : undefined,
    tags: Array.isArray(tags) ? tags.filter((t): t is string => typeof t === 'string') : undefined,
    startDate: typeof startDate === 'string' ? startDate : undefined,
    endDate: typeof endDate === 'string' ? endDate : undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export function buildKanbanColumns(
  records: DataRecord[],
  options: {
    kanbanFieldId?: string
    laneOrder?: string[]
    laneTitles?: Record<string, string>
  } = {},
): KanbanColumnData[] {
  const kanbanFieldId = options.kanbanFieldId ?? 'status'
  const groups = new Map<string, Task[]>()
  for (const record of records) {
    const raw = record.fields[kanbanFieldId]
    const lane = typeof raw === 'string' && raw ? raw : 'unassigned'
    const list = groups.get(lane) ?? []
    list.push(dataRecordToTask(record))
    groups.set(lane, list)
  }
  const laneKeys = options.laneOrder && options.laneOrder.length > 0
    ? options.laneOrder
    : Array.from(groups.keys())
  return laneKeys.map((key) => ({
    id: key,
    title: options.laneTitles?.[key] ?? key,
    tasks: groups.get(key) ?? [],
  }))
}

export function buildGalleryItems(
  records: DataRecord[],
  options: {
    coverFieldId?: string
    cardFieldIds?: string[]
  } = {},
): GalleryItem[] {
  const coverFieldId = options.coverFieldId
  const cardFieldIds = options.cardFieldIds ?? []
  return records.map((record) => {
    const task = dataRecordToTask(record)
    const rawCover = coverFieldId ? record.fields[coverFieldId] : null
    const cover = typeof rawCover === 'string' && rawCover ? rawCover : undefined
    const extraProps = cardFieldIds
      .map((fieldId) => {
        const value = record.fields[fieldId]
        if (value == null || fieldId === coverFieldId) return null
        if (Array.isArray(value)) return { key: fieldId, value: value.join(', ') }
        return { key: fieldId, value: String(value) }
      })
      .filter((item): item is { key: string; value: string } => item !== null)
    return {
      ...task,
      cover,
      bannerColor: cover?.startsWith('#') ? cover : undefined,
      extraProps: extraProps.length > 0 ? extraProps : undefined,
    }
  })
}

export const DEFAULT_TABLE_SCHEMA: TableSchema = {
  tableId: 'default',
  name: '任务表',
  fields: [
    { id: 'title', name: '标题', type: 'text', required: true },
    { id: 'status', name: '状态', type: 'select', options: [
      { value: 'todo', label: '待办', color: '#94a3b8' },
      { value: 'in_progress', label: '进行中', color: '#6366f1' },
      { value: 'done', label: '完成', color: '#22c55e' }
    ]},
    { id: 'priority', name: '优先级', type: 'select', options: [
      { value: 'P0', label: 'P0', color: '#ef4444' },
      { value: 'P1', label: 'P1', color: '#f97316' },
      { value: 'P2', label: 'P2', color: '#94a3b8' }
    ]},
    { id: 'assignee', name: '负责人', type: 'user' },
    { id: 'startDate', name: '开始日期', type: 'date' },
    { id: 'endDate', name: '截止日期', type: 'date' },
    { id: 'description', name: '描述', type: 'text' },
    { id: 'tags', name: '标签', type: 'multi_select' }
  ],
  views: []
}
