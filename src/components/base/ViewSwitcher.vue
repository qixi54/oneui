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
        <component
          v-if="tab.icon"
          :is="resolveIcon(tab.icon)"
          class="one-view-switcher__tab-icon"
        />
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
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
  padding: 0 16px;
  background: var(--of-color-bg-elevated, #ffffff);
  border-bottom: 1px solid var(--of-color-gray-200, #e5e7eb);
  box-sizing: border-box;
}

.one-view-switcher__tabs {
  display: flex;
  align-items: center;
  height: 30px;
  border-radius: 6px;
  border: 1px solid var(--of-color-gray-200, #e5e7eb);
  overflow: hidden;
}

.one-view-switcher__tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 10px;
  height: 100%;
  border: none;
  background: transparent;
  font-size: 11px;
  font-weight: 500;
  color: var(--of-color-gray-500, #6b7280);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.one-view-switcher__tab:first-child {
  border-radius: 6px 0 0 6px;
}

.one-view-switcher__tab:last-child {
  border-radius: 0 6px 6px 0;
}

.one-view-switcher__tab--active {
  background: var(--of-color-primary-50, #eef2ff);
  color: var(--of-color-primary-500, #6366f1);
  font-weight: 600;
}

.one-view-switcher__tab-icon {
  width: 13px;
  height: 13px;
}

.one-view-switcher__sep {
  width: 1px;
  height: 18px;
  background: var(--of-color-gray-200, #e5e7eb);
  flex-shrink: 0;
}

.one-view-switcher__tool-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--of-color-gray-200, #e5e7eb);
  background: transparent;
  font-size: 11px;
  font-weight: 500;
  color: var(--of-color-gray-600, #4b5563);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.one-view-switcher__tool-btn:hover {
  background: var(--of-color-gray-50, #f9fafb);
}

.one-view-switcher__spacer {
  flex: 1;
}

.one-view-switcher__search {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 180px;
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  background: var(--of-color-gray-100, #f3f4f6);
}

.one-view-switcher__search-icon {
  width: 12px;
  height: 12px;
  color: var(--of-color-gray-400, #9ca3af);
  flex-shrink: 0;
}

.one-view-switcher__search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 11px;
  color: var(--of-color-gray-600, #4b5563);
  outline: none;
}

.one-view-switcher__search-input::placeholder {
  color: var(--of-color-gray-400, #9ca3af);
}
</style>
