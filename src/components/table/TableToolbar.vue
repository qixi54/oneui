<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, type Component } from "vue";
import { resolveIcon } from "../../utils/icon";
import TableFilterPanel from "./TableFilterPanel.vue";
import TableColumnManager from "./TableColumnManager.vue";
import { ListFilter, ArrowUpDown, Layers, Columns3, Search } from "lucide-vue-next";
import type { TableColumn } from "../../types";
import type { FilterCondition, FilterLogic } from "../../composables/useTableFilter";

export interface ViewSwitcherTab {
  value: string;
  label: string;
  icon?: string | Component;
}

const props = withDefaults(
  defineProps<{
    /** 当前视图模式 */
    currentView?: string;
    /** 视图标签配置 */
    viewTabs?: ViewSwitcherTab[];
    /** 列配置 */
    columns: TableColumn[];

    /** 筛选条件 */
    filterConditions?: readonly FilterCondition[];
    /** 筛选逻辑 */
    filterLogic?: FilterLogic;
    /** 筛选是否激活 */
    filterActive?: boolean;

    /** 当前排序 */
    currentSort?: { field: string | null; order: "asc" | "desc" | null };
    /** 当前分组字段 */
    currentGroup?: string;

    /** 搜索关键词 */
    searchKeyword?: string;

    /** 显示控制 */
    showViewSwitch?: boolean;
    showFilter?: boolean;
    showSort?: boolean;
    showGroup?: boolean;
    showColumns?: boolean;
    showSearch?: boolean;

    /** 可用的保存视图列表 */
    savedViews?: { id: string; name: string }[];
  }>(),
  {
    currentView: "table",
    viewTabs: undefined,
    filterConditions: undefined,
    filterLogic: "and",
    filterActive: false,
    currentSort: undefined,
    currentGroup: undefined,
    searchKeyword: "",
    showViewSwitch: true,
    showFilter: true,
    showSort: true,
    showGroup: true,
    showColumns: true,
    showSearch: true,
    savedViews: undefined,
  },
);

const emit = defineEmits<{
  "update:currentView": [view: string];
  "update:columns": [columns: TableColumn[]];
  "update:searchKeyword": [keyword: string];
  "add-filter": [];
  "remove-filter": [id: string];
  "update-filter": [id: string, update: Partial<FilterCondition>];
  "clear-filters": [];
  "update:filterLogic": [logic: FilterLogic];
  sort: [field: string];
  group: [field: string | null];
  "save-view": [name: string];
  "load-view": [viewId: string];
}>();

const DEFAULT_TABS: ViewSwitcherTab[] = [
  { value: "table", label: "表格", icon: "table-2" },
  { value: "kanban", label: "看板", icon: "columns-3" },
  { value: "timeline", label: "时间线", icon: "calendar" },
];

// ─── Resolved Tabs ────────────────────────────────────────────────────────────
const resolvedTabs = computed(() => props.viewTabs ?? DEFAULT_TABS);

// ─── Panel Visibility ─────────────────────────────────────────────────────────
const showFilterPanel = ref(false);
const showSortPanel = ref(false);
const showGroupPanel = ref(false);
const showColumnPanel = ref(false);

// ─── Button Refs ──────────────────────────────────────────────────────────────
const filterBtnRef = ref<HTMLElement | null>(null);
const sortBtnRef = ref<HTMLElement | null>(null);
const groupBtnRef = ref<HTMLElement | null>(null);
const columnBtnRef = ref<HTMLElement | null>(null);

// ─── Dropdown Positioning ─────────────────────────────────────────────────────
const filterDropdownStyle = ref<Record<string, string>>({});
const sortDropdownStyle = ref<Record<string, string>>({});
const groupDropdownStyle = ref<Record<string, string>>({});
const columnDropdownStyle = ref<Record<string, string>>({});

function calcDropdownStyle(el: HTMLElement | null): Record<string, string> {
  if (!el) return {};
  const rect = el.getBoundingClientRect();
  return {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
  };
}

function togglePanel(panel: "filter" | "sort" | "group" | "column") {
  // Close other panels first
  if (panel !== "filter") showFilterPanel.value = false;
  if (panel !== "sort") showSortPanel.value = false;
  if (panel !== "group") showGroupPanel.value = false;
  if (panel !== "column") showColumnPanel.value = false;

  const refs: Record<
    string,
    { show: typeof showFilterPanel; btnRef: typeof filterBtnRef; style: typeof filterDropdownStyle }
  > = {
    filter: { show: showFilterPanel, btnRef: filterBtnRef, style: filterDropdownStyle },
    sort: { show: showSortPanel, btnRef: sortBtnRef, style: sortDropdownStyle },
    group: { show: showGroupPanel, btnRef: groupBtnRef, style: groupDropdownStyle },
    column: { show: showColumnPanel, btnRef: columnBtnRef, style: columnDropdownStyle },
  };

  const target = refs[panel];
  target.show.value = !target.show.value;
  if (target.show.value) {
    nextTick(() => {
      target.style.value = calcDropdownStyle(target.btnRef.value);
    });
  }
}

// ─── Click Outside ────────────────────────────────────────────────────────────
function closeAllPanels() {
  showFilterPanel.value = false;
  showSortPanel.value = false;
  showGroupPanel.value = false;
  showColumnPanel.value = false;
}

function handleGlobalClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (
    !target.closest(".of-table-toolbar__btn-group") &&
    !target.closest(".of-table-toolbar__dropdown")
  ) {
    closeAllPanels();
  }
}

onMounted(() => document.addEventListener("click", handleGlobalClick, true));
onUnmounted(() => document.removeEventListener("click", handleGlobalClick, true));

// ─── Computed Column Lists ────────────────────────────────────────────────────
const sortableColumns = computed(() => props.columns.filter((c) => !c.hidden));
const groupableColumns = computed(() =>
  props.columns.filter(
    (c) => !c.hidden && (c.type === "status" || c.type === "string" || c.type === "priority"),
  ),
);
</script>

<template>
  <div class="of-table-toolbar">
    <!-- Left: View Tabs -->
    <div v-if="showViewSwitch" class="of-table-toolbar__views">
      <button
        v-for="tab in resolvedTabs"
        :key="tab.value"
        class="of-table-toolbar__view-tab"
        :class="{ 'of-table-toolbar__view-tab--active': currentView === tab.value }"
        @click="emit('update:currentView', tab.value)"
      >
        <component :is="resolveIcon(tab.icon)" v-if="tab.icon" class="of-table-toolbar__tab-icon" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Separator -->
    <div v-if="showViewSwitch" class="of-table-toolbar__sep" />

    <!-- Filter Button -->
    <div v-if="showFilter" ref="filterBtnRef" class="of-table-toolbar__btn-group">
      <button
        class="of-table-toolbar__btn"
        :class="{ 'of-table-toolbar__btn--active': filterActive }"
        @click.stop="togglePanel('filter')"
      >
        <ListFilter :size="14" />
        <span>筛选</span>
        <span v-if="filterActive" class="of-table-toolbar__badge">
          {{ filterConditions?.length ?? 0 }}
        </span>
      </button>
      <Teleport to="body">
        <div
          v-if="showFilterPanel"
          class="of-table-toolbar__dropdown"
          :style="filterDropdownStyle"
          @click.stop
        >
          <TableFilterPanel
            :conditions="filterConditions ?? []"
            :columns="columns"
            :logic="filterLogic ?? 'and'"
            :visible="true"
            @add-condition="emit('add-filter')"
            @remove-condition="(id: string) => emit('remove-filter', id)"
            @update-condition="
              (id: string, upd: Partial<FilterCondition>) => emit('update-filter', id, upd)
            "
            @clear="emit('clear-filters')"
            @update:logic="(logic: FilterLogic) => emit('update:filterLogic', logic)"
            @close="showFilterPanel = false"
          />
        </div>
      </Teleport>
    </div>

    <!-- Sort Button -->
    <div v-if="showSort" ref="sortBtnRef" class="of-table-toolbar__btn-group">
      <button
        class="of-table-toolbar__btn"
        :class="{ 'of-table-toolbar__btn--active': currentSort?.field }"
        @click.stop="togglePanel('sort')"
      >
        <ArrowUpDown :size="14" />
        <span>排序</span>
      </button>
      <Teleport to="body">
        <div
          v-if="showSortPanel"
          class="of-table-toolbar__dropdown"
          :style="sortDropdownStyle"
          @click.stop
        >
          <div class="of-table-toolbar__simple-panel">
            <div class="of-table-toolbar__panel-title">排序</div>
            <button
              v-for="col in sortableColumns"
              :key="col.key"
              class="of-table-toolbar__sort-item"
              :class="{ active: currentSort?.field === col.key }"
              @click="
                emit('sort', col.key);
                showSortPanel = false;
              "
            >
              <span>{{ col.label }}</span>
              <span v-if="currentSort?.field === col.key" class="of-table-toolbar__sort-dir">
                {{ currentSort?.order === "asc" ? "↑" : "↓" }}
              </span>
            </button>
            <button
              v-if="currentSort?.field"
              class="of-table-toolbar__clear-btn"
              @click="
                emit('sort', '');
                showSortPanel = false;
              "
            >
              清除排序
            </button>
          </div>
        </div>
      </Teleport>
    </div>

    <!-- Group Button -->
    <div v-if="showGroup" ref="groupBtnRef" class="of-table-toolbar__btn-group">
      <button
        class="of-table-toolbar__btn"
        :class="{ 'of-table-toolbar__btn--active': !!currentGroup }"
        @click.stop="togglePanel('group')"
      >
        <Layers :size="14" />
        <span>分组</span>
      </button>
      <Teleport to="body">
        <div
          v-if="showGroupPanel"
          class="of-table-toolbar__dropdown"
          :style="groupDropdownStyle"
          @click.stop
        >
          <div class="of-table-toolbar__simple-panel">
            <div class="of-table-toolbar__panel-title">分组</div>
            <button
              v-for="col in groupableColumns"
              :key="col.key"
              class="of-table-toolbar__sort-item"
              :class="{ active: currentGroup === col.key }"
              @click="
                emit('group', currentGroup === col.key ? null : col.key);
                showGroupPanel = false;
              "
            >
              {{ col.label }}
            </button>
            <button
              v-if="currentGroup"
              class="of-table-toolbar__clear-btn"
              @click="
                emit('group', null);
                showGroupPanel = false;
              "
            >
              取消分组
            </button>
          </div>
        </div>
      </Teleport>
    </div>

    <!-- Column Manager Button -->
    <div v-if="showColumns" ref="columnBtnRef" class="of-table-toolbar__btn-group">
      <button class="of-table-toolbar__btn" @click.stop="togglePanel('column')">
        <Columns3 :size="14" />
        <span>列</span>
      </button>
      <Teleport to="body">
        <div
          v-if="showColumnPanel"
          class="of-table-toolbar__dropdown"
          :style="columnDropdownStyle"
          @click.stop
        >
          <TableColumnManager
            :columns="columns"
            :visible="true"
            @update:columns="(cols: TableColumn[]) => emit('update:columns', cols)"
            @close="showColumnPanel = false"
          />
        </div>
      </Teleport>
    </div>

    <!-- Spacer -->
    <div class="of-table-toolbar__spacer" />

    <!-- Search -->
    <div v-if="showSearch" class="of-table-toolbar__search">
      <Search :size="14" class="of-table-toolbar__search-icon" />
      <input
        class="of-table-toolbar__search-input"
        placeholder="搜索..."
        :value="searchKeyword"
        @input="emit('update:searchKeyword', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Extra slot -->
    <slot />
  </div>
</template>

<style scoped>
.of-table-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 16px;
  background: var(--of-color-bg-elevated, #fff);
  border-bottom: 1px solid var(--of-color-gray-200, #e5e7eb);
  font-family: var(--of-font-sans);
  box-sizing: border-box;
}

.of-table-toolbar__views {
  display: flex;
  align-items: center;
  height: 30px;
  border-radius: 6px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  overflow: hidden;
}

.of-table-toolbar__view-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 10px;
  height: 100%;
  border: none;
  background: transparent;
  font-size: 11px;
  font-weight: 500;
  color: var(--of-text-secondary, var(--of-color-gray-500, #6b7280));
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.of-table-toolbar__view-tab:first-child {
  border-radius: 6px 0 0 6px;
}

.of-table-toolbar__view-tab:last-child {
  border-radius: 0 6px 6px 0;
}

.of-table-toolbar__view-tab--active {
  background: var(--of-surface-selected, var(--of-color-gray-100, #f3f4f6));
  color: var(--of-text-primary, var(--of-color-gray-700, #374151));
  font-weight: 600;
}

.of-table-toolbar__tab-icon {
  width: 13px;
  height: 13px;
}

.of-table-toolbar__sep {
  width: 1px;
  height: 18px;
  background: var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  flex-shrink: 0;
}

.of-table-toolbar__btn-group {
  position: relative;
}

.of-table-toolbar__btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  height: 28px;
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  border-radius: 6px;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--of-text-secondary, var(--of-color-gray-600, #4b5563));
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.of-table-toolbar__btn:hover {
  background: var(--of-surface-muted, var(--of-color-gray-50, #f9fafb));
}

.of-table-toolbar__btn--active {
  background: var(--of-surface-selected, var(--of-color-gray-100, #f3f4f6));
  color: var(--of-text-primary, var(--of-color-gray-700, #374151));
  border-color: var(--of-border-strong, var(--of-color-gray-300, #d1d5db));
}

.of-table-toolbar__badge {
  min-width: 16px;
  height: 16px;
  background: var(--of-surface-muted, var(--of-color-gray-200, #e5e7eb));
  color: var(--of-color-white, #fff);
  border-radius: 8px;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  padding: 0 4px;
}

.of-table-toolbar__dropdown {
  position: fixed;
  z-index: 1000;
}

.of-table-toolbar__simple-panel {
  background: var(--of-color-bg-elevated, #fff);
  border: 1px solid var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb));
  border-radius: 8px;
  box-shadow: var(--of-shadow-popover);
  min-width: 180px;
  padding: 8px;
}

.of-table-toolbar__panel-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--of-text-secondary, var(--of-color-gray-500, #6b7280));
  padding: 4px 8px 8px;
}

.of-table-toolbar__sort-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 6px 8px;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 13px;
  font-family: var(--of-font-sans);
  color: var(--of-text-secondary, var(--of-color-gray-600, #4b5563));
  cursor: pointer;
  text-align: left;
}

.of-table-toolbar__sort-item:hover {
  background: var(--of-color-gray-50, #f9fafb);
}

.of-table-toolbar__sort-item.active {
  background: var(--of-surface-selected, var(--of-color-gray-100, #f3f4f6));
  color: var(--of-text-primary, var(--of-color-gray-700, #374151));
}

.of-table-toolbar__sort-dir {
  font-size: 12px;
  color: var(--of-text-secondary, var(--of-color-gray-500, #6b7280));
}

.of-table-toolbar__clear-btn {
  width: 100%;
  padding: 6px 8px;
  margin-top: 4px;
  border: none;
  border-top: 1px solid var(--of-border-subtle, var(--of-color-gray-100, #f3f4f6));
  background: transparent;
  font-size: 12px;
  font-family: var(--of-font-sans);
  color: var(--of-text-tertiary, var(--of-color-gray-400, #9ca3af));
  cursor: pointer;
  text-align: center;
}

.of-table-toolbar__clear-btn:hover {
  color: var(--of-text-primary, #0f172a);
}

.of-table-toolbar__spacer {
  flex: 1;
}

.of-table-toolbar__search {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 200px;
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  background: var(--of-surface-muted, var(--of-color-gray-100, #f3f4f6));
}

.of-table-toolbar__search-icon {
  color: var(--of-text-tertiary, var(--of-color-gray-400, #9ca3af));
  flex-shrink: 0;
}

.of-table-toolbar__search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 12px;
  color: var(--of-text-secondary, var(--of-color-gray-600, #4b5563));
  outline: none;
  font-family: var(--of-font-sans);
}

.of-table-toolbar__search-input::placeholder {
  color: var(--of-text-tertiary, var(--of-color-gray-400, #9ca3af));
}
</style>
