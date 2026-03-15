<script setup lang="ts">
import { computed } from "vue";
import { resolveIcon } from "../../utils/icon";

export interface ViewSwitcherTab {
  value: string;
  label: string;
  icon?: string;
}

export interface ViewSwitcherProps {
  tabs?: ViewSwitcherTab[];
  modelValue?: string;
  showFilter?: boolean;
  showGroup?: boolean;
  showSort?: boolean;
  showSearch?: boolean;
  filterLabel?: string;
  groupLabel?: string;
  sortLabel?: string;
  searchPlaceholder?: string;
}

const DEFAULT_TABS: ViewSwitcherTab[] = [
  { value: "table", label: "表格", icon: "table-2" },
  { value: "kanban", label: "看板", icon: "columns-3" },
  { value: "timeline", label: "时间线", icon: "calendar" },
];

const props = withDefaults(defineProps<ViewSwitcherProps>(), {
  tabs: undefined,
  modelValue: "table",
  showFilter: true,
  showGroup: true,
  showSort: true,
  showSearch: true,
  filterLabel: "筛选",
  groupLabel: "分组",
  sortLabel: "排序",
  searchPlaceholder: "搜索...",
});

defineEmits<{
  "update:modelValue": [value: string];
  filter: [];
  group: [];
  sort: [];
  search: [query: string];
}>();

const resolvedTabs = computed(() => props.tabs ?? DEFAULT_TABS);
</script>

<template>
  <div class="one-view-switcher">
    <!-- 视图标签组 -->
    <div class="one-view-switcher__tabs">
      <button
        v-for="tab in resolvedTabs"
        :key="tab.value"
        class="one-view-switcher__tab"
        :class="{ 'one-view-switcher__tab--active': modelValue === tab.value }"
        @click="$emit('update:modelValue', tab.value)"
      >
        <component v-if="tab.icon" :is="resolveIcon(tab.icon)" class="one-view-switcher__tab-icon" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- 分隔符 -->
    <div class="one-view-switcher__sep" />

    <!-- 工具按钮 -->
    <button v-if="showFilter" class="one-view-switcher__tool-btn" @click="$emit('filter')">
      {{ filterLabel }}
    </button>
    <button v-if="showGroup" class="one-view-switcher__tool-btn" @click="$emit('group')">
      {{ groupLabel }}
    </button>
    <button v-if="showSort" class="one-view-switcher__tool-btn" @click="$emit('sort')">
      {{ sortLabel }}
    </button>

    <!-- 弹性空白 -->
    <div class="one-view-switcher__spacer" />

    <!-- 搜索框 -->
    <div v-if="showSearch" class="one-view-switcher__search">
      <component :is="resolveIcon('search')" class="one-view-switcher__search-icon" />
      <input
        class="one-view-switcher__search-input"
        :placeholder="searchPlaceholder"
        @input="$emit('search', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- 额外 slot -->
    <slot />
  </div>
</template>

<style scoped>
.one-view-switcher {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  height: 44px !important;
  padding: 0 16px !important;
  background: var(--of-color-bg-elevated, #ffffff) !important;
  border-bottom: 1px solid var(--of-color-gray-200, #e5e7eb) !important;
  box-sizing: border-box !important;
}

.one-view-switcher__tabs {
  display: flex !important;
  align-items: center !important;
  height: 30px !important;
  border-radius: 6px !important;
  border: 1px solid var(--of-color-gray-200, #e5e7eb) !important;
  overflow: hidden !important;
}

.one-view-switcher__tab {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  padding: 0 10px !important;
  height: 100% !important;
  border: none !important;
  background: transparent !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  color: var(--of-color-gray-500, #6b7280) !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  transition: all 0.15s ease !important;
}

.one-view-switcher__tab:first-child {
  border-radius: 6px 0 0 6px !important;
}

.one-view-switcher__tab:last-child {
  border-radius: 0 6px 6px 0 !important;
}

.one-view-switcher__tab--active {
  background: var(--of-color-primary-50, #eef2ff) !important;
  color: var(--of-color-primary-500, #6366f1) !important;
  font-weight: 600 !important;
}

.one-view-switcher__tab-icon {
  width: 13px !important;
  height: 13px !important;
}

.one-view-switcher__sep {
  width: 1px !important;
  height: 18px !important;
  background: var(--of-color-gray-200, #e5e7eb) !important;
  flex-shrink: 0 !important;
}

.one-view-switcher__tool-btn {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  padding: 4px 8px !important;
  height: 28px !important;
  border-radius: 6px !important;
  border: 1px solid var(--of-color-gray-200, #e5e7eb) !important;
  background: transparent !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  color: var(--of-color-gray-600, #4b5563) !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  transition: all 0.15s ease !important;
}

.one-view-switcher__tool-btn:hover {
  background: var(--of-color-gray-50, #f9fafb) !important;
}

.one-view-switcher__spacer {
  flex: 1 !important;
}

.one-view-switcher__search {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  width: 180px !important;
  height: 28px !important;
  padding: 0 10px !important;
  border-radius: 6px !important;
  background: var(--of-color-gray-100, #f3f4f6) !important;
}

.one-view-switcher__search-icon {
  width: 12px !important;
  height: 12px !important;
  color: var(--of-color-gray-400, #9ca3af) !important;
  flex-shrink: 0 !important;
}

.one-view-switcher__search-input {
  flex: 1 !important;
  border: none !important;
  background: transparent !important;
  font-size: 11px !important;
  color: var(--of-color-gray-600, #4b5563) !important;
  outline: none !important;
}

.one-view-switcher__search-input::placeholder {
  color: var(--of-color-gray-400, #9ca3af) !important;
}
</style>
