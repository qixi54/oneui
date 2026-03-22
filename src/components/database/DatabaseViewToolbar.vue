<script setup lang="ts">
import TableToolbar from "../table/TableToolbar.vue";
import type { TableColumn } from "../../types";
import type { FilterCondition, FilterLogic } from "../../composables/useTableFilter";
import type { ViewSwitcherTab } from "../table/TableToolbar.vue";

const props = withDefaults(
  defineProps<{
    currentView?: string;
    viewTabs?: ViewSwitcherTab[];
    columns: TableColumn[];
    filterConditions?: readonly FilterCondition[];
    filterLogic?: FilterLogic;
    filterActive?: boolean;
    currentSort?: { field: string | null; order: "asc" | "desc" | null };
    currentGroup?: string;
    searchKeyword?: string;
    showViewSwitch?: boolean;
    showFilter?: boolean;
    showSort?: boolean;
    showGroup?: boolean;
    showColumns?: boolean;
    showSearch?: boolean;
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

defineOptions({ name: "DatabaseViewToolbar" });
</script>

<template>
  <TableToolbar
    class="of-database-view__toolbar"
    :current-view="props.currentView"
    :view-tabs="props.viewTabs"
    :columns="props.columns"
    :filter-conditions="props.filterConditions"
    :filter-logic="props.filterLogic"
    :filter-active="props.filterActive"
    :current-sort="props.currentSort"
    :current-group="props.currentGroup"
    :search-keyword="props.searchKeyword"
    :show-view-switch="props.showViewSwitch"
    :show-filter="props.showFilter"
    :show-sort="props.showSort"
    :show-group="props.showGroup"
    :show-columns="props.showColumns"
    :show-search="props.showSearch"
    :saved-views="props.savedViews"
    @update:current-view="emit('update:currentView', $event)"
    @update:columns="emit('update:columns', $event)"
    @update:search-keyword="emit('update:searchKeyword', $event)"
    @add-filter="emit('add-filter')"
    @remove-filter="emit('remove-filter', $event)"
    @update-filter="(id, update) => emit('update-filter', id, update)"
    @clear-filters="emit('clear-filters')"
    @update:filter-logic="emit('update:filterLogic', $event)"
    @sort="emit('sort', $event)"
    @group="emit('group', $event)"
    @save-view="emit('save-view', $event)"
    @load-view="emit('load-view', $event)"
  />
</template>
