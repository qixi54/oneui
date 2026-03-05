/**
 * useBadge — 徽章颜色解析 composable
 *
 * 提供两套内置默认映射（优先级 / 状态），以及合并解析函数。
 * 所有显示徽章的组件均使用此 composable，保证逻辑集中。
 *
 * 用法：
 *   const { resolveBadge, DEFAULT_PRIORITY_MAP, DEFAULT_STATUS_MAP } = useBadge()
 *
 *   // 组件接受外部 colorMap prop，与默认 merge 后使用
 *   const priorityStyle = computed(() =>
 *     resolveBadge(task.priority, { ...DEFAULT_PRIORITY_MAP, ...props.priorityColorMap })
 *   )
 */

import type { BadgeConfig, ColorMap } from "../types";

// ─── 内置默认优先级映射（兼容 P0/P1/P2/P3 风格）───────────────────────────

export const DEFAULT_PRIORITY_MAP: ColorMap = {
  P0: { text: "#DC2626", bg: "#FEE2E2", label: "P0" },
  P1: { text: "#D97706", bg: "#FEF3C7", label: "P1" },
  P2: { text: "#2563EB", bg: "#DBEAFE", label: "P2" },
  P3: { text: "#64748B", bg: "#F1F5F9", label: "P3" },
};

// ─── 内置默认状态映射（兼容常见英文 key）────────────────────────────────────

export const DEFAULT_STATUS_MAP: ColorMap = {
  todo: { text: "#64748B", bg: "#F1F5F9", label: "待处理" },
  in_progress: { text: "#2563EB", bg: "#DBEAFE", label: "进行中" },
  blocked: { text: "#D97706", bg: "#FEF3C7", label: "已阻塞", dot: "#D97706" },
  done: { text: "#22C55E", bg: "#DCFCE7", label: "已完成" },
  // 常见英文别名
  pending: { text: "#64748B", bg: "#F1F5F9", label: "Pending" },
  open: { text: "#2563EB", bg: "#DBEAFE", label: "Open" },
  closed: { text: "#22C55E", bg: "#DCFCE7", label: "Closed" },
  cancelled: { text: "#94A3B8", bg: "#F8FAFC", label: "Cancelled" },
  // 常见中文 key
  待处理: { text: "#64748B", bg: "#F1F5F9", label: "待处理" },
  进行中: { text: "#2563EB", bg: "#DBEAFE", label: "进行中" },
  已阻塞: { text: "#D97706", bg: "#FEF3C7", label: "已阻塞", dot: "#D97706" },
  已完成: { text: "#22C55E", bg: "#DCFCE7", label: "已完成" },
};

// ─── 兜底样式（value 不在 map 中时使用）─────────────────────────────────────

const FALLBACK: BadgeConfig = {
  text: "#64748B",
  bg: "#F1F5F9",
};

// ─── 解析函数 ────────────────────────────────────────────────────────────────

export interface ResolvedBadge {
  style: { color: string; background: string };
  label: string;
  dot?: string;
}

/**
 * 从 colorMap 中查找 value 对应的徽章配置。
 * - 找到：使用 map 中的配置（label 不存在时回退到 value 本身）
 * - 找不到：使用灰色兜底，label = value 原始值
 */
export function resolveBadge(value: string, colorMap: ColorMap): ResolvedBadge {
  const config = colorMap[value] ?? FALLBACK;
  return {
    style: { color: config.text, background: config.bg },
    label: config.label ?? value,
    dot: config.dot,
  };
}

/**
 * 合并外部传入的 colorMap 与默认 map（外部优先）
 */
export function mergeColorMap(defaultMap: ColorMap, overrides?: ColorMap): ColorMap {
  if (!overrides) return defaultMap;
  return { ...defaultMap, ...overrides };
}

export function useBadge() {
  return {
    DEFAULT_PRIORITY_MAP,
    DEFAULT_STATUS_MAP,
    resolveBadge,
    mergeColorMap,
  };
}
