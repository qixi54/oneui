<script setup lang="ts">
import { computed, type Component } from "vue";
import { resolveIcon } from "../../utils/icon";

export interface ViewSwitcherTab {
  value: string;
  label: string;
  icon?: string | Component;
}

export interface ViewSwitcherProps {
  tabs?: ViewSwitcherTab[];
  modelValue?: string;
  disabled?: boolean;
  showFilter?: boolean;
  showGroup?: boolean;
  showSort?: boolean;
  showSearch?: boolean;
  filterLabel?: string;
  groupLabel?: string;
  sortLabel?: string;
  searchPlaceholder?: string;
}

const props = withDefaults(defineProps<ViewSwitcherProps>(), {
  tabs: undefined,
  modelValue: "table",
  disabled: false,
  showFilter: true,
  showGroup: true,
  showSort: true,
  showSearch: true,
  filterLabel: "筛选",
  groupLabel: "分组",
  sortLabel: "排序",
  searchPlaceholder: "搜索...",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  filter: [];
  group: [];
  sort: [];
  search: [query: string];
}>();

defineOptions({ inheritAttrs: false });

const resolvedTabs = computed(() => props.tabs ?? DEFAULT_TABS);

const DEFAULT_TABS: ViewSwitcherTab[] = [
  { value: "table", label: "表格", icon: "table-2" },
  { value: "kanban", label: "看板", icon: "columns-3" },
  { value: "timeline", label: "时间线", icon: "calendar" },
];
</script>

<template>
  <div class="one-view-switcher" :class="{ 'one-view-switcher--disabled': disabled }" v-bind="$attrs">
    <!-- 视图标签组 -->
    <div class="one-view-switcher__tabs">
      <button
        v-for="tab in resolvedTabs"
        :key="tab.value"
        class="one-view-switcher__tab"
        :class="{ 'one-view-switcher__tab--active': modelValue === tab.value }"
        :disabled="disabled"
        @click="emit('update:modelValue', tab.value)"
      >
        <component :is="resolveIcon(tab.icon)" v-if="tab.icon" class="one-view-switcher__tab-icon" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- 分隔符 -->
    <div class="one-view-switcher__sep" />

    <!-- 工具按钮 -->
    <button v-if="showFilter" class="one-view-switcher__tool-btn" :disabled="disabled" @click="emit('filter')">
      {{ filterLabel }}
    </button>
    <button v-if="showGroup" class="one-view-switcher__tool-btn" :disabled="disabled" @click="emit('group')">
      {{ groupLabel }}
    </button>
    <button v-if="showSort" class="one-view-switcher__tool-btn" :disabled="disabled" @click="emit('sort')">
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
        :disabled="disabled"
        @input="emit('search', ($event.target as HTMLInputElement).value)"
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
  gap: var(--of-spacing-3);
  height: 44px;
  padding: 0 var(--of-spacing-4);
  background: var(--of-surface-elevated, var(--of-color-bg-elevated, #ffffff));
  border-bottom: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  box-sizing: border-box;
}

.one-view-switcher--disabled {
  opacity: 0.5;
}

.one-view-switcher__tabs {
  display: flex;
  align-items: center;
  height: 30px;
  border-radius: var(--of-radius-md);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  overflow: hidden;
}

.one-view-switcher__tab {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-1);
  padding: 0 var(--of-spacing-2_5);
  height: 100%;
  border: none;
  background: transparent;
  font-size: var(--of-font-size-xs);
  font-weight: var(--of-font-weight-medium);
  color: var(--of-text-secondary, var(--of-color-gray-500, #6b7280));
  cursor: pointer;
  white-space: nowrap;
  transition: var(--of-transition-fast);
}

.one-view-switcher__tab:disabled,
.one-view-switcher__tool-btn:disabled,
.one-view-switcher__search-input:disabled {
  cursor: not-allowed;
  pointer-events: none;
}

.one-view-switcher__tab:focus-visible,
.one-view-switcher__tool-btn:focus-visible,
.one-view-switcher__search-input:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
}

.one-view-switcher__tab:first-child {
  border-radius: var(--of-radius-md) 0 0 var(--of-radius-md);
}

.one-view-switcher__tab:last-child {
  border-radius: 0 var(--of-radius-md) var(--of-radius-md) 0;
}

.one-view-switcher__tab--active {
  background: var(--of-surface-selected, var(--of-color-gray-100));
  color: var(--of-text-primary, var(--of-color-gray-900));
  font-weight: var(--of-font-weight-semibold);
}

.one-view-switcher__tab-icon {
  width: 13px;
  height: 13px;
}

.one-view-switcher__sep {
  width: 1px;
  height: 18px;
  background: var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  flex-shrink: 0;
}

.one-view-switcher__tool-btn {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-1);
  padding: var(--of-spacing-1) var(--of-spacing-2);
  height: 28px;
  border-radius: var(--of-radius-md);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  background: transparent;
  font-size: var(--of-font-size-xs);
  font-weight: var(--of-font-weight-medium);
  color: var(--of-text-secondary, var(--of-color-gray-600, #4b5563));
  cursor: pointer;
  white-space: nowrap;
  transition: var(--of-transition-fast);
}

.one-view-switcher__tool-btn:hover {
  background: var(--of-surface-muted, var(--of-color-gray-50));
}

.one-view-switcher__spacer {
  flex: 1;
}

.one-view-switcher__search {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-1_5);
  width: 180px;
  height: 28px;
  padding: 0 var(--of-spacing-2_5);
  border-radius: var(--of-radius-md);
  background: var(--of-surface-muted, var(--of-color-gray-100, #f3f4f6));
}

.one-view-switcher__search-icon {
  width: 12px;
  height: 12px;
  color: var(--of-text-tertiary, var(--of-color-gray-400, #9ca3af));
  flex-shrink: 0;
}

.one-view-switcher__search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--of-font-size-xs);
  color: var(--of-text-secondary, var(--of-color-gray-600, #4b5563));
  outline: none;
}

.one-view-switcher__search-input::placeholder {
  color: var(--of-text-tertiary, var(--of-color-gray-400, #9ca3af));
}
</style>
