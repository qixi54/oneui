import type { TableColumn } from "../types";

export const DEFAULT_TABLE_COLUMNS: TableColumn[] = [
  { key: "id", label: "任务ID", width: 100, align: "left" },
  { key: "title", label: "标题", width: "fill", minWidth: 220, align: "left" },
  { key: "status", label: "状态", width: 90, align: "left" },
  { key: "role", label: "负责角色", width: 90, align: "left" },
  { key: "priority", label: "优先级", width: 70, align: "left" },
  { key: "updatedAt", label: "更新时间", width: 100, align: "left" },
];
