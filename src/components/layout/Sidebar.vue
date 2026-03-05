<script setup lang="ts">
import { ref, type Component } from "vue";
import * as LucideIcons from "lucide-vue-next";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-vue-next";
import type { SidebarItem } from "../../types";

defineProps<{
  items: SidebarItem[];
}>();

const emit = defineEmits<{
  (e: "item-click", item: SidebarItem): void;
}>();

// 记录展开状态
const expandedIds = ref<Set<string>>(new Set());

function toPascalCase(name: string): string {
  return (
    name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("") + "Icon"
  );
}

function resolveIcon(name?: string): Component | undefined {
  if (!name) return undefined;
  const key = toPascalCase(name);
  return (LucideIcons as unknown as Record<string, Component>)[key];
}

function toggleExpand(item: SidebarItem) {
  if (expandedIds.value.has(item.id)) {
    expandedIds.value.delete(item.id);
  } else {
    expandedIds.value.add(item.id);
  }
}

function handleItemClick(item: SidebarItem) {
  if (item.children && item.children.length > 0) {
    toggleExpand(item);
  }
  emit("item-click", item);
}

function isExpanded(item: SidebarItem): boolean {
  return expandedIds.value.has(item.id);
}
</script>

<template>
  <div class="of-sidebar">
    <!-- 头部插槽 -->
    <div v-if="$slots.header" class="of-sidebar__header">
      <slot name="header" />
    </div>

    <!-- 导航项列表 -->
    <nav class="of-sidebar__nav">
      <template v-for="item in items" :key="item.id">
        <button
          class="of-sidebar__item"
          :class="{ 'of-sidebar__item--active': item.active }"
          @click="handleItemClick(item)"
        >
          <!-- 图标 -->
          <component
            :is="resolveIcon(item.icon)"
            v-if="item.icon"
            class="of-sidebar__item-icon"
            :size="15"
          />
          <!-- 标签文字 -->
          <span class="of-sidebar__item-label">{{ item.label }}</span>
          <!-- 徽标 -->
          <span v-if="item.badge !== undefined" class="of-sidebar__item-badge">
            {{ item.badge }}
          </span>
          <!-- 展开箭头 -->
          <component
            :is="isExpanded(item) ? ChevronDownIcon : ChevronRightIcon"
            v-if="item.children && item.children.length > 0"
            class="of-sidebar__item-chevron"
            :size="13"
          />
        </button>

        <!-- 子菜单 -->
        <div
          v-if="item.children && item.children.length > 0 && isExpanded(item)"
          class="of-sidebar__children"
        >
          <button
            v-for="child in item.children"
            :key="child.id"
            class="of-sidebar__item of-sidebar__item--child"
            :class="{ 'of-sidebar__item--active': child.active }"
            @click="emit('item-click', child)"
          >
            <component
              :is="resolveIcon(child.icon)"
              v-if="child.icon"
              class="of-sidebar__item-icon"
              :size="14"
            />
            <span class="of-sidebar__item-label">{{ child.label }}</span>
            <span v-if="child.badge !== undefined" class="of-sidebar__item-badge">
              {{ child.badge }}
            </span>
          </button>
        </div>
      </template>
    </nav>

    <!-- 底部插槽 -->
    <div v-if="$slots.footer" class="of-sidebar__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.of-sidebar {
  display: flex !important;
  flex-direction: column !important;
  width: var(--of-sidebar-width) !important;
  height: 100% !important;
  background: var(--of-color-bg-elevated) !important;
  border-right: var(--of-border) !important;
  padding: var(--of-spacing-4) var(--of-spacing-3) !important;
  gap: var(--of-spacing-2) !important;
  overflow-y: auto !important;
  box-sizing: border-box !important;
}

.of-sidebar__header {
  flex-shrink: 0;
  padding-bottom: var(--of-spacing-2);
}

.of-sidebar__nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 0;
}

.of-sidebar__item {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: var(--of-spacing-2) !important;
  padding: 6px 10px !important;
  background: transparent !important;
  border: none !important;
  border-radius: var(--of-radius-md) !important;
  cursor: pointer !important;
  font-family: var(--of-font-sans) !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  color: var(--of-color-gray-600) !important;
  line-height: 1.4 !important;
  text-align: left !important;
  width: 100% !important;
  box-sizing: border-box !important;
  transition: var(--of-transition-fast) !important;
}

.of-sidebar__item--child {
  padding-left: 28px !important;
  font-size: 12px !important;
}

.of-sidebar__item:hover:not(.of-sidebar__item--active) {
  background: var(--of-color-gray-100) !important;
}

.of-sidebar__item--active {
  background: var(--of-color-primary-50) !important;
  color: var(--of-color-primary-600) !important;
}

.of-sidebar__item--active .of-sidebar__item-icon {
  color: var(--of-color-primary-600) !important;
}

.of-sidebar__item-icon {
  color: var(--of-color-gray-400) !important;
  flex-shrink: 0;
}

.of-sidebar__item-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.of-sidebar__item-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--of-color-gray-100);
  color: var(--of-color-gray-500);
  font-size: 11px;
  font-weight: 500;
  border-radius: var(--of-radius-full);
  flex-shrink: 0;
  box-sizing: border-box;
}

.of-sidebar__item--active .of-sidebar__item-badge {
  background: var(--of-color-primary-100);
  color: var(--of-color-primary-600);
}

.of-sidebar__item-chevron {
  color: var(--of-color-gray-400) !important;
  flex-shrink: 0;
  margin-left: auto;
}

.of-sidebar__children {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.of-sidebar__footer {
  flex-shrink: 0;
  padding-top: var(--of-spacing-2);
  border-top: var(--of-border);
}
</style>
