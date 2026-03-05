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

  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
}

/* ============================================================
   导航栏
   ============================================================ */
.of-tabs__nav {
  display: flex !important;
  flex-wrap: nowrap !important;
  align-items: flex-end !important;
  gap: 0 !important;
  overflow-x: auto !important;
  scrollbar-width: none !important;
}

.of-tabs__nav::-webkit-scrollbar {
  display: none !important;
}

/* ============================================================
   Tab 按钮基础样式
   ============================================================ */
.of-tabs__tab {
  display: inline-flex !important;
  align-items: center !important;
  gap: var(--_spacing-1) !important;
  border: none !important;
  background: transparent !important;
  cursor: pointer !important;
  font-family: inherit !important;
  font-weight: 500 !important;
  color: var(--_color-text-muted) !important;
  white-space: nowrap !important;
  transition:
    color 200ms ease,
    background-color 200ms ease,
    border-color 200ms ease !important;
  outline: none !important;
  position: relative !important;
  flex-shrink: 0 !important;
}

.of-tabs__tab:focus-visible {
  outline: 2px solid var(--_color-primary) !important;
  outline-offset: -2px !important;
  border-radius: var(--_radius-sm) !important;
}

.of-tabs__tab:hover:not(.of-tabs__tab--disabled):not(.of-tabs__tab--active) {
  color: var(--_color-text) !important;
}

/* ============================================================
   Size 变体
   ============================================================ */
.of-tabs--sm .of-tabs__tab {
  padding: 6px 12px !important;
  font-size: 12px !important;
}

.of-tabs--md .of-tabs__tab {
  padding: 8px 16px !important;
  font-size: 14px !important;
}

.of-tabs--lg .of-tabs__tab {
  padding: 10px 20px !important;
  font-size: 16px !important;
}

/* ============================================================
   LINE 变体（默认，下划线风格）
   ============================================================ */
.of-tabs--line .of-tabs__nav {
  border-bottom: 1px solid var(--_color-border) !important;
}

.of-tabs--line .of-tabs__tab {
  border-bottom: 2px solid transparent !important;
  margin-bottom: -1px !important; /* 覆盖 nav border */
  border-radius: 0 !important;
}

.of-tabs--line .of-tabs__tab:hover:not(.of-tabs__tab--disabled):not(.of-tabs__tab--active) {
  border-bottom-color: var(--_color-border) !important;
}

.of-tabs--line .of-tabs__tab--active {
  color: var(--_color-primary) !important;
  border-bottom-color: var(--_color-primary) !important;
}

/* ============================================================
   CARD 变体（卡片/方块风格）
   ============================================================ */
.of-tabs--card .of-tabs__nav {
  border-bottom: 1px solid var(--_color-border) !important;
  gap: 4px !important;
  align-items: stretch !important;
  padding: 0 var(--_spacing-1) !important;
  padding-top: var(--_spacing-2) !important;
}

.of-tabs--card .of-tabs__tab {
  background-color: var(--_color-bg-hover) !important;
  border: 1px solid transparent !important;
  border-bottom: none !important;
  border-radius: var(--_radius-md) var(--_radius-md) 0 0 !important;
  margin-bottom: -1px !important;
  color: var(--_color-text-muted) !important;
}

.of-tabs--card .of-tabs__tab:hover:not(.of-tabs__tab--disabled):not(.of-tabs__tab--active) {
  background-color: var(--_color-surface) !important;
  border-color: var(--_color-border) !important;
  color: var(--_color-text) !important;
}

.of-tabs--card .of-tabs__tab--active {
  background-color: var(--_color-surface) !important;
  border-color: var(--_color-border) !important;
  border-bottom-color: var(--_color-surface) !important;
  color: var(--_color-text) !important;
  font-weight: 600 !important;
}

/* ============================================================
   禁用状态
   ============================================================ */
.of-tabs__tab--disabled {
  opacity: 0.45 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
}

/* ============================================================
   图标
   ============================================================ */
.of-tabs__tab-icon {
  width: 16px !important;
  height: 16px !important;
  flex-shrink: 0 !important;
}

.of-tabs--sm .of-tabs__tab-icon {
  width: 14px !important;
  height: 14px !important;
}

.of-tabs--lg .of-tabs__tab-icon {
  width: 18px !important;
  height: 18px !important;
}

/* ============================================================
   角标
   ============================================================ */
.of-tabs__badge {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 18px !important;
  height: 18px !important;
  padding: 0 5px !important;
  background-color: var(--_color-badge-bg) !important;
  color: var(--_color-badge-text) !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  border-radius: 9999px !important;
  flex-shrink: 0 !important;
}

/* ============================================================
   内容区域
   ============================================================ */
.of-tabs__content {
  padding-top: var(--_spacing-4) !important;
  width: 100% !important;
  flex: 1 !important;
}
</style>
