<script setup lang="ts">
import { type Component } from "vue";
import { Table2Icon, KanbanIcon, LayoutGridIcon, GanttChartIcon } from "lucide-vue-next";
import type { ViewTabItem } from "../../types";

const ICON_MAP: Record<string, Component> = {
  "table-2": Table2Icon,
  kanban: KanbanIcon,
  "layout-grid": LayoutGridIcon,
  "gantt-chart": GanttChartIcon,
};

function resolveIcon(name: string): Component | undefined {
  return ICON_MAP[name];
}

defineProps<{
  modelValue: string;
  items: ViewTabItem[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

function select(key: string) {
  emit("update:modelValue", key);
}
</script>

<template>
  <div class="of-view-tab">
    <button
      v-for="item in items"
      :key="item.key"
      class="of-view-tab__item"
      :class="{ 'of-view-tab__item--active': modelValue === item.key }"
      @click="select(item.key)"
    >
      <component :is="resolveIcon(item.icon)" class="of-view-tab__icon" :size="14" />
      <span class="of-view-tab__label">{{ item.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.of-view-tab {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
}

.of-view-tab__item {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 10px 16px !important;
  background: transparent !important;
  border: none !important;
  border-bottom: 2px solid transparent !important;
  cursor: pointer !important;
  font-family: var(--of-font-sans) !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  line-height: 1 !important;
  color: var(--of-color-gray-500) !important;
  transition: var(--of-transition-fast) !important;
  white-space: nowrap !important;
}

.of-view-tab__item .of-view-tab__icon {
  color: var(--of-color-gray-400) !important;
  flex-shrink: 0;
}

.of-view-tab__item:hover:not(.of-view-tab__item--active) {
  color: var(--of-color-gray-700) !important;
  background: var(--of-color-gray-50) !important;
}

.of-view-tab__item:hover:not(.of-view-tab__item--active) .of-view-tab__icon {
  color: var(--of-color-gray-500) !important;
}

.of-view-tab__item--active {
  color: var(--of-color-primary-500) !important;
  border-bottom-color: var(--of-color-primary-500) !important;
}

.of-view-tab__item--active .of-view-tab__icon {
  color: var(--of-color-primary-500) !important;
}

.of-view-tab__label {
  line-height: 1;
}
</style>
