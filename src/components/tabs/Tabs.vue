<script setup lang="ts">
import { ref, computed, provide } from "vue";
import type { Component } from "vue";
import { resolveIcon } from "../../utils/icon";

/**
 * TabItem 接口 - 单个标签页定义
 */
export interface TabItem {
  /** 唯一标识符，对应 TabPanel 的 name */
  key: string;
  /** 显示文字 */
  label: string;
  /** 图标：lucide icon name（kebab-case）或 Vue 组件 */
  icon?: string | Component;
  /** 是否禁用 */
  disabled?: boolean;
  /** 角标，如未读数 */
  badge?: string | number;
}

/**
 * Tabs 组件 - 标签页切换
 *
 * @example
 * <Tabs v-model="activeTab" :tabs="tabs" variant="line">
 *   <TabPanel name="tab1">内容1</TabPanel>
 *   <TabPanel name="tab2">内容2</TabPanel>
 * </Tabs>
 */

const props = defineProps<{
  /** 当前激活的 tab key（v-model 受控模式） */
  modelValue?: string;
  /** 初始激活的 tab key（非受控模式） */
  defaultValue?: string;
  /** 变体：line 下划线 | card 卡片 */
  variant?: "line" | "card";
  /** 尺寸 */
  size?: "sm" | "md" | "lg";
  /** tab 列表配置 */
  tabs: TabItem[];
}>();

const emit = defineEmits<{
  /** v-model 更新 */
  "update:modelValue": [key: string];
  /** tab 切换事件 */
  change: [key: string];
}>();

// 非受控模式内部状态
const internalValue = ref<string>(props.defaultValue || props.tabs[0]?.key || "");

// 支持受控/非受控两种模式
const activeTab = computed<string>({
  get: () => props.modelValue ?? internalValue.value,
  set: (val: string) => {
    internalValue.value = val;
    emit("update:modelValue", val);
    emit("change", val);
  },
});

/**
 * 切换激活 tab
 */
function setActiveTab(key: string) {
  activeTab.value = key;
}

/**
 * tab 键盘导航（方向键切换）
 */
function onTabKeydown(e: KeyboardEvent, key: string) {
  const enabledTabs = props.tabs.filter((t) => !t.disabled);
  const currentIdx = enabledTabs.findIndex((t) => t.key === key);

  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    e.preventDefault();
    const next = enabledTabs[(currentIdx + 1) % enabledTabs.length];
    if (next) setActiveTab(next.key);
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    e.preventDefault();
    const prev = enabledTabs[(currentIdx - 1 + enabledTabs.length) % enabledTabs.length];
    if (prev) setActiveTab(prev.key);
  } else if (e.key === "Home") {
    e.preventDefault();
    const first = enabledTabs[0];
    if (first) setActiveTab(first.key);
  } else if (e.key === "End") {
    e.preventDefault();
    const last = enabledTabs[enabledTabs.length - 1];
    if (last) setActiveTab(last.key);
  }
}

// provide 给子 TabPanel
provide("of-tabs-active", activeTab);
provide("of-tabs-set", setActiveTab);
</script>

<template>
  <div class="of-tabs" :class="[`of-tabs--${variant || 'line'}`, `of-tabs--${size || 'md'}`]">
    <!-- Tab 导航栏 -->
    <div class="of-tabs__nav" role="tablist" aria-label="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="of-tabs__tab"
        :class="{
          'of-tabs__tab--active': activeTab === tab.key,
          'of-tabs__tab--disabled': tab.disabled,
        }"
        :disabled="tab.disabled"
        role="tab"
        :id="`of-tab-${tab.key}`"
        :aria-selected="activeTab === tab.key"
        :aria-controls="`of-panel-${tab.key}`"
        :aria-disabled="tab.disabled"
        :tabindex="activeTab === tab.key ? 0 : -1"
        @click="!tab.disabled && setActiveTab(tab.key)"
        @keydown="onTabKeydown($event, tab.key)"
      >
        <!-- 图标 -->
        <component v-if="tab.icon" :is="resolveIcon(tab.icon)" class="of-tabs__tab-icon" />
        <!-- 标签文字 -->
        <span class="of-tabs__tab-label">{{ tab.label }}</span>
        <!-- 角标 -->
        <span v-if="tab.badge != null" class="of-tabs__badge">
          {{ tab.badge }}
        </span>
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="of-tabs__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
   CSS 自定义属性（回退值）
   ============================================================ */
.of-tabs {
  --_color-primary: var(--of-color-primary, #6366f1);
  --_color-primary-light: var(--of-color-primary-light, #eef2ff);
  --_color-text: var(--of-color-text, #1f2937);
  --_color-text-muted: var(--of-color-text-muted, #6b7280);
  --_color-border: var(--of-color-border, #e5e7eb);
  --_color-surface: var(--of-color-surface, #ffffff);
  --_color-bg-hover: var(--of-color-bg-hover, #f9fafb);
  --_color-badge-bg: var(--of-color-badge-bg, #ef4444);
  --_color-badge-text: var(--of-color-badge-text, #ffffff);
  --_radius-sm: var(--of-radius-sm, 4px);
  --_radius-md: var(--of-radius-md, 6px);
  --_radius-lg: var(--of-radius-lg, 8px);
  --_spacing-1: var(--of-spacing-1, 4px);
  --_spacing-2: var(--of-spacing-2, 8px);
  --_spacing-3: var(--of-spacing-3, 12px);
  --_spacing-4: var(--of-spacing-4, 16px);

  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ============================================================
   导航栏
   ============================================================ */
.of-tabs__nav {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.of-tabs__nav::-webkit-scrollbar {
  display: none;
}

/* ============================================================
   Tab 按钮基础样式
   ============================================================ */
.of-tabs__tab {
  display: inline-flex;
  align-items: center;
  gap: var(--_spacing-1);
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  color: var(--_color-text-muted);
  white-space: nowrap;
  transition:
    color 200ms ease,
    background-color 200ms ease,
    border-color 200ms ease;
  outline: none;
  position: relative;
  flex-shrink: 0;
}

.of-tabs__tab:focus-visible {
  outline: 2px solid var(--_color-primary);
  outline-offset: -2px;
  border-radius: var(--_radius-sm);
}

.of-tabs__tab:hover:not(.of-tabs__tab--disabled):not(.of-tabs__tab--active) {
  color: var(--_color-text);
}

/* ============================================================
   Size 变体
   ============================================================ */
.of-tabs--sm .of-tabs__tab {
  padding: 6px 12px;
  font-size: 12px;
}

.of-tabs--md .of-tabs__tab {
  padding: 8px 16px;
  font-size: 14px;
}

.of-tabs--lg .of-tabs__tab {
  padding: 10px 20px;
  font-size: 16px;
}

/* ============================================================
   LINE 变体（默认，下划线风格）
   ============================================================ */
.of-tabs--line .of-tabs__nav {
  border-bottom: 1px solid var(--_color-border);
}

.of-tabs--line .of-tabs__tab {
  border-bottom: 2px solid transparent;
  margin-bottom: -1px; /* 覆盖 nav border */
  border-radius: 0;
}

.of-tabs--line .of-tabs__tab:hover:not(.of-tabs__tab--disabled):not(.of-tabs__tab--active) {
  border-bottom-color: var(--_color-border);
}

.of-tabs--line .of-tabs__tab--active {
  color: var(--_color-primary);
  border-bottom-color: var(--_color-primary);
}

/* ============================================================
   CARD 变体（卡片/方块风格）
   ============================================================ */
.of-tabs--card .of-tabs__nav {
  border-bottom: 1px solid var(--_color-border);
  gap: 4px;
  align-items: stretch;
  padding: 0 var(--_spacing-1);
  padding-top: var(--_spacing-2);
}

.of-tabs--card .of-tabs__tab {
  background-color: var(--_color-bg-hover);
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: var(--_radius-md) var(--_radius-md) 0 0;
  margin-bottom: -1px;
  color: var(--_color-text-muted);
}

.of-tabs--card .of-tabs__tab:hover:not(.of-tabs__tab--disabled):not(.of-tabs__tab--active) {
  background-color: var(--_color-surface);
  border-color: var(--_color-border);
  color: var(--_color-text);
}

.of-tabs--card .of-tabs__tab--active {
  background-color: var(--_color-surface);
  border-color: var(--_color-border);
  border-bottom-color: var(--_color-surface);
  color: var(--_color-text);
  font-weight: 600;
}

/* ============================================================
   禁用状态
   ============================================================ */
.of-tabs__tab--disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

/* ============================================================
   图标
   ============================================================ */
.of-tabs__tab-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.of-tabs--sm .of-tabs__tab-icon {
  width: 14px;
  height: 14px;
}

.of-tabs--lg .of-tabs__tab-icon {
  width: 18px;
  height: 18px;
}

/* ============================================================
   角标
   ============================================================ */
.of-tabs__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background-color: var(--_color-badge-bg);
  color: var(--_color-badge-text);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  border-radius: 9999px;
  flex-shrink: 0;
}

/* ============================================================
   内容区域
   ============================================================ */
.of-tabs__content {
  padding-top: var(--_spacing-4);
  width: 100%;
  flex: 1;
}
</style>
