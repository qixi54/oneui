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
  P0: { text: "var(--of-priority-p0-text)", bg: "var(--of-priority-p0-bg)", label: "P0" },
  P1: { text: "var(--of-priority-p1-text)", bg: "var(--of-priority-p1-bg)", label: "P1" },
  P2: { text: "var(--of-priority-p2-text)", bg: "var(--of-priority-p2-bg)", label: "P2" },
  P3: { text: "var(--of-priority-p3-text)", bg: "var(--of-priority-p3-bg)", label: "P3" },
};

// ─── 内置默认状态映射（兼容常见英文 key）────────────────────────────────────

export const DEFAULT_STATUS_MAP: ColorMap = {
  todo: { text: "var(--of-status-todo-text)", bg: "var(--of-status-todo-bg)", label: "待处理" },
  in_progress: { text: "var(--of-status-in-progress-text)", bg: "var(--of-status-in-progress-bg)", label: "进行中" },
  blocked: { text: "var(--of-status-blocked-text)", bg: "var(--of-status-blocked-bg)", label: "已阻塞", dot: "var(--of-status-blocked-text)" },
  done: { text: "var(--of-status-done-text)", bg: "var(--of-status-done-bg)", label: "已完成" },
  // 常见英文别名
  pending: { text: "var(--of-status-todo-text)", bg: "var(--of-status-todo-bg)", label: "Pending" },
  open: { text: "var(--of-status-in-progress-text)", bg: "var(--of-status-in-progress-bg)", label: "Open" },
  closed: { text: "var(--of-status-done-text)", bg: "var(--of-status-done-bg)", label: "Closed" },
  cancelled: { text: "var(--of-status-cancelled-text)", bg: "var(--of-status-cancelled-bg)", label: "Cancelled" },
  // 常见中文 key
  待处理: { text: "var(--of-status-todo-text)", bg: "var(--of-status-todo-bg)", label: "待处理" },
  进行中: { text: "var(--of-status-in-progress-text)", bg: "var(--of-status-in-progress-bg)", label: "进行中" },
  已阻塞: { text: "var(--of-status-blocked-text)", bg: "var(--of-status-blocked-bg)", label: "已阻塞", dot: "var(--of-status-blocked-text)" },
  已完成: { text: "var(--of-status-done-text)", bg: "var(--of-status-done-bg)", label: "已完成" },
};

// ─── 兜底样式（value 不在 map 中时使用）─────────────────────────────────────

const FALLBACK: BadgeConfig = {
  text: "var(--of-badge-gray-text)",
  bg: "var(--of-badge-gray-bg)",
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
